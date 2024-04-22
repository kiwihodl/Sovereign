import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import { useNostr } from '@/hooks/useNostr';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import ResourceTemplate from '@/components/content/carousels/templates/ResourceTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';

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

export default function ResourcesCarousel() {
    const [processedResources, setProcessedResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchResources } = useNostr();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const fetchedResources = await fetchResources();
                if (fetchedResources && fetchedResources.length > 0) {
                    const processed = fetchedResources.map(resource => parseEvent(resource));
                    setProcessedResources(processed);
                } else {
                    console.log('No resources fetched or empty array returned');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching resources:', error);
                setLoading(false);
            }
        };
        fetch();
    }, [fetchResources]);

    return (
        <>
            <h2 className="ml-[6%] mt-4">Resources</h2>
            <Carousel value={loading ? [{}, {}, {}] : [...processedResources, ...processedResources]}
                      numVisible={2}
                      itemTemplate={loading ? TemplateSkeleton : ResourceTemplate}
                      responsiveOptions={responsiveOptions} />
        </>
    );
}
