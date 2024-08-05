import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY

export function useWorkshopsQuery() {
    const [isClient, setIsClient] = useState(false);
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

const hasRequiredTags = (tags) => {
    const hasPlebDevs = tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
    const hasWorkshop = tags.some(([tag, value]) => tag === "t" && value === "workshop");
    return hasPlebDevs && hasWorkshop;
};

const fetchWorkshopsFromNDK = async () => {
    try {
        console.log('Fetching workshops from NDK');
        await ndk.connect();

        const filter = { kinds: [30023, 30402], authors: [AUTHOR_PUBKEY] };
        const events = await ndk.fetchEvents(filter);

        if (events && events.size > 0) {
            const eventsArray = Array.from(events);
            console.log('eventsArray', eventsArray)
            const resources = eventsArray.filter(event => hasRequiredTags(event.tags));
            return resources;
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
  })

  return { workshops, workshopsLoading, workshopsError, refetchWorkshops }
}