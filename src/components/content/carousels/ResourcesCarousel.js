import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useNostr } from '@/hooks/useNostr';
import { parseEvent } from '@/utils/nostr';
import ResourceTemplate from '@/components/content/carousels/templates/ResourceTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useNostrQueries } from '@/hooks/useNostrQueries';
import { useResourcesQuery } from '@/hooks/useResourcesQuery';

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
    const { fetchZapsForEvents } = useNostr();
    // const { resources, resourcesError, refetchResources } = useNostrQueries()
    const { resources, resourcesError, refetchResources } = useResourcesQuery()

    useEffect(() => {
        const fetch = async () => {
            try {
                if (resources && resources.length > 0) {
                    const processedResources = resources.map(resource => parseEvent(resource));

                    console.log('processedResources:', processedResources);
    
                    const allZaps = await fetchZapsForEvents(processedResources);
    
                    const resourcesWithZaps = processedResources.map(resource => {
                        const relevantZaps = allZaps.filter(zap => {
                            const eTagMatches = zap.tags.find(tag => tag[0] === 'e' && tag[1] === resource.id);
                            const aTag = zap.tags.find(tag => tag[0] === 'a');
                            const aTagMatches = aTag && resource.d === aTag[1].split(':').pop();
                            return eTagMatches || aTagMatches;
                        });
                        return {
                            ...resource,
                            zaps: relevantZaps
                        };
                    });
    
                    setProcessedResources(resourcesWithZaps);
                } else {
                    refetchResources();
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
            <Carousel value={!processedResources.length > 0 ? [{}, {}, {}] : [...processedResources]}
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
