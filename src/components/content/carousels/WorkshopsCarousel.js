import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import { useNostr } from '@/hooks/useNostr';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import WorkshopTemplate from '@/components/content/carousels/templates/WorkshopTemplate';
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

export default function WorkshopsCarousel() {
    const [processedWorkshops, setProcessedWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchWorkshops, fetchZapsForEvents } = useNostr();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const fetchedWorkshops = await fetchWorkshops();
                if (fetchedWorkshops && fetchedWorkshops.length > 0) {
                    const processedWorkshops = fetchedWorkshops.map(workshop => parseEvent(workshop));
    
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
            setLoading(false);
        };        
        fetch();
    }, [fetchWorkshops, fetchZapsForEvents]); // Assuming fetchZapsForEvents is adjusted to handle workshops
    

    return (
        <>
            <h2 className="ml-[6%] mt-4">Workshops</h2>
            <Carousel value={loading ? [{}, {}, {}] : [...processedWorkshops, ...processedWorkshops]}
                      numVisible={2}
                      itemTemplate={loading ? TemplateSkeleton : WorkshopTemplate}
                      responsiveOptions={responsiveOptions} />
        </>
    );
}
