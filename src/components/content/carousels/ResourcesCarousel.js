import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import { useNostr } from '@/hooks/useNostr';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import ResourceTemplate from '@/components/content/carousels/templates/ResourceTemplate';

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
    const [resources, setResources] = useState([]);
    const router = useRouter();
    const { fetchResources } = useNostr();
    const { returnImageProxy } = useImageProxy();

    useEffect(() => {
        const fetch = async () => {
            try {
                const resources = await fetchResources();
                console.log('resources:', resources);
                setResources(resources);
            } catch (error) {
                console.error('Error fetching resources:', error);
            }
        };
        fetch();
    }, [fetchResources]);

    useEffect(() => {
        const processResources = resources.map(resource => {
            const { id, content, title, summary, image, published_at } = parseEvent(resource);
            return { id, content, title, summary, image, published_at };
        });
        setProcessedResources(processResources);
    }, [resources]);

    return (
        <>
            <h2 className="ml-[6%] mt-4">resources</h2>
            <Carousel value={[...processedResources, ...processedResources]} numVisible={2} itemTemplate={ResourceTemplate} responsiveOptions={responsiveOptions} />
        </>
    );
}
