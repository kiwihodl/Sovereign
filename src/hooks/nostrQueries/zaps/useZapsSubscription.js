import { useState, useEffect } from 'react';
import { useNDKContext } from '@/context/NDKContext';

export function useZapsSubscription({ event }) {
    const [isClient, setIsClient] = useState(false);
    const [zaps, setZaps] = useState([]);
    const [zapsLoading, setZapsLoading] = useState(true);
    const [zapsError, setZapsError] = useState(null);
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !ndk || !event) return;

        let subscription = null;

        const fetchZapsFromNDK = async () => {
            try {
                await ndk.connect();
                const uniqueEvents = new Set();

                const filters = [
                    { kinds: [9735], "#e": [event.id] },
                    { kinds: [9735], "#a": [`${event.kind}:${event.id}:${event.d}`] }
                ];

                subscription = ndk.subscribe(filters);

                subscription.on('event', (zap) => {
                    uniqueEvents.add(zap);
                    setZaps(Array.from(uniqueEvents));
                    setZapsLoading(false);
                });

                subscription.on('eose', () => {
                    setZaps(Array.from(uniqueEvents));
                    setZapsLoading(false);
                });

                // if there are no zaps for 15 seconds and no eose to stop loading
                setTimeout(() => {
                    if (uniqueEvents.size === 0) {
                        setZapsLoading(false);
                        setZaps(Array.from(uniqueEvents));
                    }
                }, 15000);

            } catch (error) {
                setZapsError('Error fetching zaps from NDK: ' + error);
                setZapsLoading(false);
            }
        };

        fetchZapsFromNDK();

        return () => {
            if (subscription) {
                subscription.stop();
            }
        };
    }, [isClient, ndk, event]);

    return { zaps, zapsLoading, zapsError };
}
