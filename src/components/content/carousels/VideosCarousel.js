import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { parseEvent } from '@/utils/nostr';
import {VideoTemplate} from '@/components/content/carousels/templates/VideoTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useVideos } from '@/hooks/nostr/useVideos';
import useWindowWidth from '@/hooks/useWindowWidth';
import { Divider } from 'primereact/divider';

const responsiveOptions = [
    {
        breakpoint: '3000px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '1462px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
];

export default function VideosCarousel() {
    const [processedVideos, setProcessedVideos] = useState([]);
    const { videos, videosLoading, videosError } = useVideos();
    const windowWidth = useWindowWidth();
    const isMobileView = windowWidth <= 450;

    useEffect(() => {
        const fetch = async () => {
            try {
                if (videos && videos.length > 0) {
                    const processedVideos = videos.map(video => parseEvent(video));
                    
                    const sortedVideos = processedVideos.sort((a, b) => b.created_at - a.created_at);

                    console.log('Sorted videos:', sortedVideos);
                    setProcessedVideos(sortedVideos);
                } else {
                    console.log('No videos fetched or empty array returned');
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };
        fetch();
    }, [videos]);

    if (videosError) return <div>Error: {videosError}</div>;

    return (
        <>
            <h3 className={`ml-[6%] mt-4 max-mob:text-3xl max-mob:ml-10`}>Videos</h3>
            <Divider className={`${isMobileView ? '' : 'hidden'}`} />
            <Carousel 
                value={videosLoading || !processedVideos.length ? [{}, {}, {}] : [...processedVideos]}
                numVisible={2}
                pt={{
                    previousButton: {
                        className: isMobileView ? 'm-0' : ''
                    },
                    nextButton: {
                        className: isMobileView ? 'm-0' : ''
                    }
                }}
                itemTemplate={(item) => 
                    !processedVideos.length ? 
                    <TemplateSkeleton key={Math.random()} /> : 
                    <VideoTemplate key={item.id} video={item} />
                }
                responsiveOptions={responsiveOptions}
            />
        </>
    );
}
