import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY

export function useCoursesQuery() {
    const [isClient, setIsClient] = useState(false);
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchCoursesFromNDK = async () => {
        try {
            console.log('Fetching courses from NDK');
            await ndk.connect();
      
            const filter = { kinds: [30004], authors: [AUTHOR_PUBKEY] };
            const events = await ndk.fetchEvents(filter);
      
            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                console.log('eventsArray', eventsArray)
                // const resources = eventsArray.filter(event => hasRequiredTags(event.tags));
                // return resources;
                return eventsArray;
            }
            return [];
        } catch (error) {
            console.error('Error fetching workshops from NDK:', error);
            return [];
        }
      };

const { data: courses, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useQuery({
    queryKey: ['courses', isClient],
    queryFn: fetchCoursesFromNDK,
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    enabled: isClient,
  })

  return { courses, coursesLoading, coursesError, refetchCourses }
}