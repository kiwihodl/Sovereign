import { useState, useEffect } from 'react';
import { nip19 } from 'nostr-tools';
import { parseCourseEvent } from '@/utils/nostr';
import { useToast } from '@/hooks/useToast';

/**
 * Hook to fetch and manage course data
 * @param {Object} ndk - NDK instance for Nostr data fetching
 * @param {Function} fetchAuthor - Function to fetch author data
 * @param {Object} router - Next.js router instance
 * @returns {Object} Course data and related state
 */
const useCourseData = (ndk, fetchAuthor, router) => {
  const [course, setCourse] = useState(null);
  const [lessonIds, setLessonIds] = useState([]);
  const [paidCourse, setPaidCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!router.isReady) return;

    const { slug } = router.query;
    let id;

    const fetchCourseId = async () => {
      if (slug.includes('naddr')) {
        const { data } = nip19.decode(slug);
        if (!data?.identifier) {
          showToast('error', 'Error', 'Resource not found');
          return null;
        }
        return data.identifier;
      } else {
        return slug;
      }
    };

    const fetchCourse = async courseId => {
      try {
        await ndk.connect();
        const event = await ndk.fetchEvent({ '#d': [courseId] });
        if (!event) return null;

        const author = await fetchAuthor(event.pubkey);
        const lessonIds = event.tags.filter(tag => tag[0] === 'a').map(tag => tag[1].split(':')[2]);

        const parsedCourse = { ...parseCourseEvent(event), author };
        return { parsedCourse, lessonIds };
      } catch (error) {
        console.error('Error fetching event:', error);
        return null;
      }
    };

    const initializeCourse = async () => {
      setLoading(true);
      id = await fetchCourseId();
      if (!id) {
        setLoading(false);
        return;
      }

      const courseData = await fetchCourse(id);
      if (courseData) {
        const { parsedCourse, lessonIds } = courseData;
        setCourse(parsedCourse);
        setLessonIds(lessonIds);
        setPaidCourse(parsedCourse.price && parsedCourse.price > 0);
      }
      setLoading(false);
    };

    initializeCourse();
  }, [router.isReady, router.query, ndk, fetchAuthor, showToast]);

  return { course, lessonIds, paidCourse, loading };
};

export default useCourseData; 