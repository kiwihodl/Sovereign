import { useState, useEffect } from 'react';
import { useNDKContext } from '@/context/NDKContext';
import { useContentIdsQuery } from '@/hooks/apiQueries/useContentIdsQuery';
import appConfig from "@/config/appConfig";

export function useVideos() {
    const [isClient, setIsClient] = useState(false);
    const [videos, setVideos] = useState();
    // Add new state variables for loading and error
    const [videosLoading, setVideosLoading] = useState(false);
    const [videosError, setVideosError] = useState(null);

    const { contentIds } = useContentIdsQuery()
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
        setVideosLoading(true);
        setVideosError(null);
        try {
            if (!contentIds || contentIds.length === 0) {
                setVideosLoading(false);
                return []; // Return early if no content IDs are found
            }

            await ndk.connect();

            const filter = { kinds: [30023, 30402], authors: appConfig.authorPubkeys };
            const events = await ndk.fetchEvents(filter);

            if (events && events.size > 0) {
                const eventsArray = Array.from(events);
                const videos = eventsArray.filter(event => hasRequiredProperties(event, contentIds));
                setVideosLoading(false);
                return videos;
            }
            setVideosLoading(false);
            return [];
        } catch (error) {
            console.error('Error fetching videos from NDK:', error);
            setVideosError(error);
            setVideosLoading(false);
            return [];
        }
    };

    useEffect(() => {
        if (isClient && contentIds) {
            fetchVideosFromNDK().then(fetchedVideos => {
                if (fetchedVideos && fetchedVideos.length > 0) {
                    setVideos(fetchedVideos);
                }
            });
        }
    }, [isClient, contentIds]);

    return { videos, videosLoading, videosError };
}