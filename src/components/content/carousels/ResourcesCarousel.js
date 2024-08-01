import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useNostr } from '@/hooks/useNostr';
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
    const { fetchResources, fetchZapsForEvents } = useNostr();

    useEffect(() => {
        const fetch = async () => {
            try {
                const fetchedResources = await fetchResources();
                if (fetchedResources && fetchedResources.length > 0) {
                    const processedResources = fetchedResources.map(resource => parseEvent(resource));
    
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
                    console.log('No resources fetched or empty array returned');
                }
            } catch (error) {
                console.error('Error fetching resources:', error);
            }
        };        
        fetch();
    }, [fetchResources, fetchZapsForEvents]); // Assuming fetchZapsForEvents is adjusted to handle resources
    

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
