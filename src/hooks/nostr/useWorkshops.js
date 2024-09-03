import { useState, useEffect } from 'react';
import { useNDKContext } from '@/context/NDKContext';
import { useContentIdsQuery } from '@/hooks/apiQueries/useContentIdsQuery';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

export function useWorkshops() {
    const [isClient, setIsClient] = useState(false);
    const [workshops, setWorkshops] = useState();
    // Add new state variables for loading and error
    const [workshopsLoading, setWorkshopsLoading] = useState(false);
    const [workshopsError, setWorkshopsError] = useState(null);

    const { contentIds } = useContentIdsQuery()
    const {ndk, addSigner} = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const hasRequiredProperties = (event, contentIds) => {
        const hasWorkshop = event.tags.some(([tag, value]) => tag === "t" && value === "workshop");
        const hasId = event.tags.some(([tag, value]) => tag === "d" && contentIds.includes(value));
        return hasWorkshop && hasId;
    };

    const fetchWorkshopsFromNDK = async () => {
        setWorkshopsLoading(true);
        setWorkshopsError(null);
        try {
            if (!contentIds || contentIds.length === 0) {
                console.log('No content IDs found');
                setWorkshopsLoading(false);
                return []; // Return early if no content IDs are found
            }

            await ndk.connect();

            const filter = { kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] };
            const events = await ndk.fetchEvents(filter);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                const workshops = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
                setWorkshopsLoading(false);
                return workshops;
            }
            setWorkshopsLoading(false);
            return [];
        } catch (error) {
            console.error('Error fetching workshops from NDK:', error);
            setWorkshopsError(error);
            setWorkshopsLoading(false);
            return [];
        }
    };

    useEffect(() => {
        if (isClient && contentIds) {
            fetchWorkshopsFromNDK().then(fetchedWorkshops => {
                if (fetchedWorkshops && fetchedWorkshops.length > 0) {
                    setWorkshops(fetchedWorkshops);
                }
            });
        }
    }, [isClient, contentIds]);

    return { workshops, workshopsLoading, workshopsError };
}