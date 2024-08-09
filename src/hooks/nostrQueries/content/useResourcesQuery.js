import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';
import axios from 'axios';

const AUTHOR_PUBKEY = process.env.NEXT_PUBLIC_AUTHOR_PUBKEY;

export function useResourcesQuery() {
    const [isClient, setIsClient] = useState(false);
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const hasRequiredProperties = (event, contentIds) => {
        const hasPlebDevs = event.tags.some(([tag, value]) => tag === "t" && value === "plebdevs");
        const hasResource = event.tags.some(([tag, value]) => tag === "t" && value === "resource");
        const hasId = event.tags.some(([tag, value]) => tag === "d" && contentIds.includes(value));
        return hasPlebDevs && hasResource && hasId;
    };

    const fetchResourcesFromNDK = async () => {
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
                const resources = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
                return resources;
            }
            return [];
        } catch (error) {
            console.error('Error fetching resources from NDK:', error);
            return [];
        }
    };

    const { data: resources, isLoading: resourcesLoading, error: resourcesError, refetch: refetchResources } = useQuery({
        queryKey: ['resources', isClient],
        queryFn: fetchResourcesFromNDK,
        // staleTime: 1000 * 60 * 30, // 30 minutes
        // refetchInterval: 1000 * 60 * 30, // 30 minutes
        enabled: isClient,
    });

    return { resources, resourcesLoading, resourcesError, refetchResources };
}
