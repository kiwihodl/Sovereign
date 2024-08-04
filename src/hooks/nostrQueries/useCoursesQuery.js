import { useState, useEffect } from 'react';
import { useNostr } from '@/hooks/useNostr';
import { useQuery } from '@tanstack/react-query';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY

export function useCoursesQuery() {
    const [isClient, setIsClient] = useState(false);
    const { subscribe } = useNostr();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchCourses = async () => {
        const filter = [{ kinds: [30004], authors: [AUTHOR_PUBKEY] }];
        // Do we need required tags for courses? community instead?
        // const hasRequiredTags = (tags) => {
        //     const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
        //     const hasCourse = tags.some(([tag, value]) => tag === "t" && value === "course");
        //     return hasPlebDevs && hasCourse;
        // };
    
        return new Promise((resolve, reject) => {
          let courses = [];
          const subscription = subscribe(
            filter,
            {
              onevent: (event) => {
                // if (hasRequiredTags(event.tags)) {
                // courses.push(event);
                // }
                courses.push(event);
              },
              onerror: (error) => {
                console.error('Error fetching courses:', error);
                reject(error);
              },
              onclose: () => {
                resolve(courses);
              },
            }
          );
    
          setTimeout(() => {
            subscription?.close();
            resolve(courses);
          }, 2000);
        });
      }

const { data: courses, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useQuery({
    queryKey: ['courses', isClient],
    queryFn: fetchCourses,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    enabled: isClient,
  })

  return { courses, coursesLoading, coursesError, refetchCourses }
}