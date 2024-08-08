import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';
import { useContentIdsQuery } from '@/hooks/apiQueries/useContentIdsQuery';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

export function useCoursesQuery() {
    const [isClient, setIsClient] = useState(false);

    const { contentIds, contentIdsLoading, contentIdsError, refetchContentIds } = useContentIdsQuery();
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        refetchContentIds();
    }, [refetchContentIds]);

    const hasRequiredProperties = (event) => {
        if (contentIdsLoading) {
            return false;
        }

        const hasCourseTag = event.tags.some(([tag, value]) => tag === "t" && value === "course");
        const hasId = contentIds.includes(event.id);
        return hasCourseTag && hasId;
    };

    const fetchCoursesFromNDK = async () => {
        try {
            if (contentIdsLoading) {
                return []; // or a loading state indication
            }
            if (contentIdsError) {
                console.error('Error fetching content IDs:', contentIdsError);
                return [];
            }
            if (!contentIds) {
                return [];
            }

            await ndk.connect();

            const filter = { kinds: [30004], authors: [AUTHOR_PUBKEY] };
            const events = await ndk.fetchEvents(filter);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                const courses = eventsArray.filter(event => hasRequiredProperties(event));
                return courses;
            }
            return [];
        } catch (error) {
            console.error('Error fetching courses from NDK:', error);
            return [];
        }
    };

    const { data: courses, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useQuery({
        queryKey: ['courses', isClient],
        queryFn: fetchCoursesFromNDK,
        staleTime: 1000 * 60 * 30, // 30 minutes
        refetchInterval: 1000 * 60 * 30, // 30 minutes
        enabled: isClient,
    });

    return { courses, coursesLoading, coursesError, refetchCourses };
}
