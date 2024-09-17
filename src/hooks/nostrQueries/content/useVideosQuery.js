import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';
import axios from 'axios';
import appConfig from '@/config/appConfig';

export function useVideosQuery() {
    const [isClient, setIsClient] = useState(false);
    const {ndk, addSigner} = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const hasRequiredProperties = (event, contentIds) => {
        const hasVideo = event.tags.some(([tag, value]) => tag === "t" && value === "video");
        const hasId = event.tags.some(([tag, value]) => tag === "d" && contentIds.includes(value));
        return hasVideo && hasId;
    };

    const fetchVideosFromNDK = async () => {
        try {
            const response = await axios.get(`/api/content/all`);
            const contentIds = response.data;

            if (!contentIds || contentIds.length === 0) {
                console.log('No content IDs found');
                return []; // Return early if no content IDs are found
            }

            await ndk.connect();

            const filter = { kinds: [30023, 30402], authors: appConfig.authorPubkeys };
            const events = await ndk.fetchEvents(filter);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                const videos = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
                return videos;
            }
            return [];
        } catch (error) {
            console.error('Error fetching videos from NDK:', error);
            return [];
        }
    };

    const { data: videos, isLoading: videosLoading, error: videosError, refetch: refetchVideos } = useQuery({
        queryKey: ['videos', isClient],
        queryFn: fetchVideosFromNDK,
        // staleTime: 1000 * 60 * 30, // 30 minutes
        // refetchInterval: 1000 * 60 * 30, // 30 minutes
        enabled: isClient,
    });

    return { videos, videosLoading, videosError, refetchVideos };
}
