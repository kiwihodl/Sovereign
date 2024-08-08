import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';
import { useContentIdsQuery } from '@/hooks/apiQueries/useContentIdsQuery';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

export function useWorkshopsQuery() {
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
        const hasPlebDevs = event.tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
        const hasWorkshop = event.tags.some(([tag, value]) => tag === "t" && value === "workshop");
        const hasId = contentIds.includes(event.id);
        return hasPlebDevs && hasWorkshop && hasId;
    };

    const fetchWorkshopsFromNDK = async () => {
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
            console.log('Fetching workshops from NDK');
            await ndk.connect();

            const filter = { kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] };
            const events = await ndk.fetchEvents(filter);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                console.log('eventsArray', eventsArray);
                const workshops = eventsArray.filter(event => hasRequiredProperties(event));
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
        staleTime: 1000 * 60 * 30, // 30 minutes
        refetchInterval: 1000 * 60 * 30, // 30 minutes
        enabled: isClient,
    });

    return { workshops, workshopsLoading, workshopsError, refetchWorkshops };
}
