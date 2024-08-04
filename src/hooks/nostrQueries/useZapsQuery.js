import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';

export function useZapsQuery({ events }) {
    const [isClient, setIsClient] = useState(false);
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchZapsFromNDK = async (events) => {
        try {
            await ndk.connect();

            let zaps = [];

            for (const event of events) {
                const uniqueEvents = new Set();
                const filters = [{ kinds: [9735], "#e": [event.id] }, { kinds: [9735], "#a": [`${event.kind}:${event.id}:${event.d}`] }];

                for (const filter of filters) {
                    const zapEvents = await ndk.fetchEvents(filter);
                    zapEvents.forEach(zap => uniqueEvents.add(zap));
                }
    
                zaps = [...zaps, ...Array.from(uniqueEvents)];
            }
            console.log('Zaps fetched:', zaps);
            return zaps;
        } catch (error) {
            console.error('Error fetching zaps from NDK:', error);
            return [];
        }
    };

    const { data: zaps, isLoading: zapsLoading, error: zapsError, refetch: refetchZaps } = useQuery({
        queryKey: ['zaps', isClient],
        queryFn: () => fetchZapsFromNDK(events),
        staleTime: 1000 * 60 * 3, // 3 minutes
        cacheTime: 1000 * 60 * 60, // 1 hour
        enabled: isClient,
    })

    return { zaps, zapsLoading, zapsError, refetchZaps }
}