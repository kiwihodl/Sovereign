import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { parseEvent } from '@/utils/nostr';
import ResourceTemplate from '@/components/content/carousels/templates/ResourceTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useResources } from '@/hooks/nostr/useResources';

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
    const { resources, resourcesLoading, resourcesError } = useResources()

    useEffect(() => {
        const fetch = async () => {
            try {
                if (resources && resources.length > 0) {
                    const processedResources = resources.map(resource => parseEvent(resource));

                    setProcessedResources(processedResources);
                }
            } catch (error) {
                console.error('Error fetching resources:', error);
            }
        };        
        fetch();
    }, [resources]);

    if (resourcesError) {
        return <div>Error: {resourcesError.message}</div>
    }

    return (
        <>
            <h2 className="ml-[6%] mt-4">Resources</h2>
            <Carousel 
                value={resourcesLoading || !processedResources.length ? [{}, {}, {}] : [...processedResources]}
                numVisible={2}
                itemTemplate={(item) => 
                        processedResources.length > 0 ? 
                        <ResourceTemplate key={item.id} resource={item} /> : 
                        <TemplateSkeleton key={Math.random()} />
                }
                responsiveOptions={responsiveOptions} />
        </>
    );
}
