import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';

export function useCoursesZapsQuery({ event }) {
    const [isClient, setIsClient] = useState(false);
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchZapsFromNDK = async (event) => {
        if (!ndk) {
            console.error('NDK instance is null');
            return [];
        }

        if (!event) {
            console.error('No event provided');
            return [];
        }

        try {
            await ndk.connect();
            let zaps = [];

            const filters = [{ kinds: [9735], "#e": [event.id] }, { kinds: [9735], "#a": [`${event.kind}:${event.id}:${event.d}`] }];

            for (const filter of filters) {
                const zapEvents = await ndk.fetchEvents(filter);
                zapEvents.forEach(zap => zaps.push(zap));
            }

            return zaps;
        } catch (error) {
            console.error('Error fetching zaps from NDK:', error);
            return [];
        }
    };

    const { data: zaps, isLoading: zapsLoading, error: zapsError, refetch: refetchZaps } = useQuery({
        queryKey: ['coursesZaps', isClient, event],
        queryFn: () => fetchZapsFromNDK(event),
        staleTime: 1000 * 60 * 3, // 3 minutes
        cacheTime: 1000 * 60 * 60, // 1 hour
        enabled: isClient,
    });

    return { zaps, zapsLoading, zapsError, refetchZaps }
}
