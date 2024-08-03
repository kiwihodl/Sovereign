import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import { useNostr } from '@/hooks/useNostr';
import { parseEvent } from '@/utils/nostr';
import WorkshopTemplate from '@/components/content/carousels/templates/WorkshopTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useNostrQueries } from '@/hooks/useNostrQueries';

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

export default function WorkshopsCarousel() {
    const [processedWorkshops, setProcessedWorkshops] = useState([])

    const { workshops, workshopsError } = useNostrQueries()
    const { fetchZapsForEvents } = useNostr()

    useEffect(() => {
        const fetch = async () => {
            try {
                console.debug('workshops', workshops);
                if (workshops && workshops.length > 0) {
                    const processedWorkshops = workshops.map(workshop => parseEvent(workshop));
    
                    const allZaps = await fetchZapsForEvents(processedWorkshops);
    
                    const workshopsWithZaps = processedWorkshops.map(workshop => {
                        const relevantZaps = allZaps.filter(zap => {
                            const eTagMatches = zap.tags.find(tag => tag[0] === 'e' && tag[1] === workshop.id);
                            const aTag = zap.tags.find(tag => tag[0] === 'a');
                            const aTagMatches = aTag && workshop.d === aTag[1].split(':').pop();
                            return eTagMatches || aTagMatches;
                        });
                        return {
                            ...workshop,
                            zaps: relevantZaps
                        };
                    });
    
                    setProcessedWorkshops(workshopsWithZaps);
                } else {
                    console.log('No workshops fetched or empty array returned');
                }
            } catch (error) {
                console.error('Error fetching workshops:', error);
            }
        };        
        fetch();
    }, [workshops]);

     if (workshopsError) {
        return <div>Error: {workshopsError.message}</div>
     }

    return (
        <>
            <h2 className="ml-[6%] mt-4">Workshops</h2>
            <Carousel value={!processedWorkshops.length > 0 ? [{}, {}, {}] : [...processedWorkshops]}
                      numVisible={2}
                      itemTemplate={(item) => 
                        processedWorkshops.length > 0 ? 
                        <WorkshopTemplate key={item.id} workshop={item} /> : 
                        <TemplateSkeleton key={Math.random()} />
                    }
                      responsiveOptions={responsiveOptions} />
        </>
    );
}
