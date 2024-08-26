import { useState, useEffect } from 'react';
import { useNDKContext } from '@/context/NDKContext';
import { useContentIdsQuery } from '@/hooks/apiQueries/useContentIdsQuery';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

export function useCourses() {
    const [isClient, setIsClient] = useState(false);
    const [courses, setCourses] = useState();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { contentIds } = useContentIdsQuery()
    const {ndk, addSigner} = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const hasRequiredProperties = (event, contentIds) => {
        const hasId = event.tags.some(([tag, value]) => tag === "d" && contentIds.includes(value));
        return hasId;
    };

    const fetchCoursesFromNDK = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!contentIds || contentIds.length === 0) {
                console.log('No content IDs found');
                setIsLoading(false);
                return []; // Return early if no content IDs are found
            }

            await ndk.connect();

            const filter = { kinds: [30004], authors: [AUTHOR_PUBKEY] };
            const events = await ndk.fetchEvents(filter);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                const courses = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
                setIsLoading(false);
                return courses;
            }
            setIsLoading(false);
            return [];
        } catch (error) {
            console.error('Error fetching courses from NDK:', error);
            setError(error);
            setIsLoading(false);
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

    return { courses, isLoading, error };
}