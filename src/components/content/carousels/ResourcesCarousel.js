import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { parseEvent } from '@/utils/nostr';
// import ResourceTemplate from '@/components/content/carousels/templates/ResourceTemplate';
import { DocumentTemplate } from '@/components/content/carousels/newTemplates/DocumentTemplate';
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
                    
                    // Sort resources by created_at in descending order (most recent first)
                    const sortedResources = processedResources.sort((a, b) => b.created_at - a.created_at);

                    console.log("Sorted resources:", sortedResources);

                    setProcessedResources(sortedResources);
                } else {
                    console.log('No resources fetched or empty array returned');
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
            <h3 className="ml-[6%] mt-4">Resources</h3>
            <Carousel 
                value={resourcesLoading || !processedResources.length ? [{}, {}, {}] : [...processedResources]}
                numVisible={2}
                itemTemplate={(item) => 
                        processedResources.length > 0 ? 
                        <DocumentTemplate key={item.id} document={item} /> : 
                        <TemplateSkeleton key={Math.random()} />
                }
                responsiveOptions={responsiveOptions} />
        </>
    );
}
