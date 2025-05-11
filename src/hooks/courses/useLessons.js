import { useState, useEffect } from 'react';
import { parseEvent } from '@/utils/nostr';

/**
 * Hook to fetch and manage lesson data for a course
 * @param {Object} ndk - NDK instance for Nostr data fetching
 * @param {Function} fetchAuthor - Function to fetch author data
 * @param {Array} lessonIds - Array of lesson IDs to fetch
 * @param {String} pubkey - Public key of the course author
 * @returns {Object} Lesson data and state
 */
const useLessons = (ndk, fetchAuthor, lessonIds, pubkey) => {
  const [lessons, setLessons] = useState([]);
  const [uniqueLessons, setUniqueLessons] = useState([]);
  
  // Fetch lessons when IDs or pubkey change
  useEffect(() => {
    if (lessonIds.length > 0 && pubkey) {
      const fetchLessons = async () => {
        try {
          await ndk.connect();
          
          // Create a single filter with all lesson IDs to avoid multiple calls
          const filter = {
            '#d': lessonIds,
            kinds: [30023, 30402],
            authors: [pubkey],
          };
          
          const events = await ndk.fetchEvents(filter);
          const newLessons = [];
          
          // Process events
          for (const event of events) {
            const author = await fetchAuthor(event.pubkey);
            const parsedLesson = { ...parseEvent(event), author };
            newLessons.push(parsedLesson);
          }
          
          setLessons(newLessons);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };
      
      fetchLessons();
    }
  }, [lessonIds, ndk, fetchAuthor, pubkey]);

  // Deduplicate lessons
  useEffect(() => {
    const newUniqueLessons = Array.from(
      new Map(lessons.map(lesson => [lesson.id, lesson])).values()
    );
    setUniqueLessons(newUniqueLessons);
  }, [lessons]);

  return { lessons, uniqueLessons, setLessons };
};

export default useLessons; 