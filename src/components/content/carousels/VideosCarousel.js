import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    const [paidLessons, setPaidLessons] = useState([]);
    const [freeLessons, setFreeLessons] = useState([]);
    const { videos, videosLoading, videosError } = useVideos();
    const windowWidth = useWindowWidth();
    const isMobileView = windowWidth <= 450;

    useEffect(() => {
        axios.get('/api/lessons').then(res => {
            if (res.data) {
                res.data.forEach(lesson => {
                    if (lesson?.resource?.price > 0) {
                        setPaidLessons(prev => [...prev, lesson?.resourceId]);
                    } else {
                        setFreeLessons(prev => [...prev, lesson?.resourceId]);
                    }
                });
            }
        }).catch(err => {
            console.error('err', err);
        });
    }, []);

    useEffect(() => {
        const fetch = async () => {
            try {
                if (videos && videos.length > 0 && paidLessons.length > 0) {
                    const processedVideos = videos.map(video => parseEvent(video));
                    
                    const sortedVideos = processedVideos.sort((a, b) => b.created_at - a.created_at);

                    // filter out videos that are in the paid lessons array
                    const filteredVideos = sortedVideos.filter(video => !paidLessons.includes(video?.d));

                    setProcessedVideos(filteredVideos);
                } else {
                    console.log('No videos fetched or empty array returned');
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };
        fetch();
    }, [videos, paidLessons]);

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
                    <VideoTemplate key={item.id} video={item} isLesson={freeLessons.includes(item.d)} showMetaTags={false} />
                }
                responsiveOptions={responsiveOptions}
            />
        </>
    );
}
