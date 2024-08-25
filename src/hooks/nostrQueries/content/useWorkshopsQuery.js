import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';
import axios from 'axios';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

export function useWorkshopsQuery() {
    const [isClient, setIsClient] = useState(false);
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
        try {
            const response = await axios.get(`/api/content/all`);
            const contentIds = response.data;

            if (!contentIds || contentIds.length === 0) {
                console.log('No content IDs found');
                return []; // Return early if no content IDs are found
            }

            await ndk.connect();

            const filter = { kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] };
            const events = await ndk.fetchEvents(filter);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                const workshops = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
                return workshops;
            }
            return [];
        } catch (error) {
            console.error('Error fetching workshops from NDK:', error);
            return [];
        }
    };

    const { data: workshops, isLoading: workshopsLoading, error: workshopsError, refetch: refetchWorkshops } = useQuery({
        queryKey: ['workshops', isClient],
        queryFn: fetchWorkshopsFromNDK,
        // staleTime: 1000 * 60 * 30, // 30 minutes
        // refetchInterval: 1000 * 60 * 30, // 30 minutes
        enabled: isClient,
    });

    return { workshops, workshopsLoading, workshopsError, refetchWorkshops };
}
