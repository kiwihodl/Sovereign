import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { parseEvent } from '@/utils/nostr';
import ResourceTemplate from '@/components/content/carousels/templates/ResourceTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useResourcesQuery } from '@/hooks/nostrQueries/useResourcesQuery';
import { useZapsQuery } from '@/hooks/nostrQueries/useZapsQuery';

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
    const { resources, resourcesLoading, resourcesError, refetchResources } = useResourcesQuery()
    const { zaps, zapsLoading, zapsError, refetchZaps } = useZapsQuery({ events: resources })

    useEffect(() => {
        if (resources && resources.length > 0) {
            refetchZaps(resources)
        }
    }, [resources, refetchZaps]);

    useEffect(() => {
        const fetch = async () => {
            try {
                if (resources && resources.length > 0 && zaps) {
                    const processedResources = resources.map(resource => parseEvent(resource));

                    let resourcesWithZaps = processedResources.map(resource => {
                        let collectedZaps = []
                        zaps.forEach(zap => {
                            if (zap.tags.find(tag => tag[0] === "e" && tag[1] === resource.id) || zap.tags.find(tag => tag[0] === "a" && tag[1] === `${resource.kind}:${resource.id}:${resource.d}`)) {
                                collectedZaps.push(zap)
                            }
                        })
                        return { ...resource, zaps: collectedZaps }
                    })

                    setProcessedResources(resourcesWithZaps);
                }
            } catch (error) {
                console.error('Error fetching resources:', error);
            }
        };        
        fetch();
    }, [resources]);

    if (resourcesLoading) {
        return <div>Loading...</div>
    }

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
