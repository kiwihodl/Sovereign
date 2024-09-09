import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { parseEvent } from '@/utils/nostr';
import WorkshopTemplate from '@/components/content/carousels/templates/WorkshopTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useWorkshops } from '@/hooks/nostr/useWorkshops';

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
    const { workshops, workshopsLoading, workshopsError } = useWorkshops();

    useEffect(() => {
        const fetch = async () => {
            try {
                if (workshops && workshops.length > 0) {
                    console.log('workshops', workshops);
                    const processedWorkshops = workshops.map(workshop => parseEvent(workshop));
                    console.log('processedWorkshops', processedWorkshops);
                    setProcessedWorkshops(processedWorkshops);
                } else {
                    console.log('No workshops fetched or empty array returned');
                }
            } catch (error) {
                console.error('Error fetching workshops:', error);
            }
        };
        fetch();
    }, [workshops]);

    if (workshopsError) return <div>Error: {workshopsError}</div>;

    return (
        <>
            <h3 className="ml-[6%] mt-4">Workshops</h3>
            <Carousel 
                value={workshopsLoading || !processedWorkshops.length ? [{}, {}, {}] : [...processedWorkshops]}
                numVisible={2}
                itemTemplate={(item) => 
                    !processedWorkshops.length ? 
                    <TemplateSkeleton key={Math.random()} /> : 
                    <WorkshopTemplate key={item.id} workshop={item} />
                }
                responsiveOptions={responsiveOptions}
            />
        </>
    );
}
