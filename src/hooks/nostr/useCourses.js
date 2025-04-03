import { useState, useEffect } from 'react';
import { useNDKContext } from '@/context/NDKContext';
import { useContentIdsQuery } from '@/hooks/apiQueries/useContentIdsQuery';
import appConfig from '@/config/appConfig';

export function useCourses() {
  const [isClient, setIsClient] = useState(false);
  const [courses, setCourses] = useState();

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

  const { contentIds } = useContentIdsQuery();
  const { ndk, addSigner } = useNDKContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasRequiredProperties = (event, contentIds) => {
    const hasId = event.tags.some(([tag, value]) => tag === 'd' && contentIds.includes(value));
    return hasId;
  };

  const fetchCoursesFromNDK = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      if (!contentIds || contentIds.length === 0) {
        setCoursesLoading(false);
        return []; // Return early if no content IDs are found
      }

      await ndk.connect();

      const filter = { kinds: [30004], authors: appConfig.authorPubkeys };
      const events = await ndk.fetchEvents(filter);

      if (events && events.size > 0) {
        const eventsArray = Array.from(events);
        const courses = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
        setCoursesLoading(false);
        return courses;
      }
      setCoursesLoading(false);
      return [];
    } catch (error) {
      console.error('Error fetching courses from NDK:', error);
      setCoursesError(error);
      setCoursesLoading(false);
      return [];
    }
  };

  useEffect(() => {
    if (isClient && contentIds) {
      fetchCoursesFromNDK().then(fetchedCourses => {
        if (fetchedCourses && fetchedCourses.length > 0) {
          setCourses(fetchedCourses);
        }
      });
    }
  }, [isClient, contentIds]);

  return { courses, coursesLoading, coursesError };
}
