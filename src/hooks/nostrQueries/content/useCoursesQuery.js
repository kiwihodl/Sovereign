import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';
import axios from 'axios';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

export function useCoursesQuery() {
    const [isClient, setIsClient] = useState(false);
    const {ndk, addSigner} = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const hasRequiredProperties = (event, contentIds) => {
        const hasId = event.tags.some(([tag, value]) => tag === "d" && contentIds.includes(value));
        return hasId;
    };

    const fetchCoursesFromNDK = async () => {
        try {
            const response = await axios.get(`/api/content/all`);
            const contentIds = response.data;

            if (!contentIds || contentIds.length === 0) {
                console.log('No content IDs found');
                return []; // Return early if no content IDs are found
            }

            await ndk.connect();

            const filter = { kinds: [30004], authors: [AUTHOR_PUBKEY] };
            const events = await ndk.fetchEvents(filter);

            console.log('events', events);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                const courses = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
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
        // staleTime: 1000 * 60 * 30, // 30 minutes
        // refetchInterval: 1000 * 60 * 30, // 30 minutes
        enabled: isClient,
    });

    return { courses, coursesLoading, coursesError, refetchCourses };
}
