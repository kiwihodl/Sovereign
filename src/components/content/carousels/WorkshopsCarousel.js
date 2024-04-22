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
    const { fetchWorkshops } = useNostr();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const fetchedWorkshops = await fetchWorkshops();
                if (fetchedWorkshops && fetchedWorkshops.length > 0) {
                    const processed = fetchedWorkshops.map(workshop => parseEvent(workshop));
                    setProcessedWorkshops(processed);
                } else {
                    console.log('No workshops fetched or empty array returned');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching workshops:', error);
                setLoading(false);
            }
        };
        fetch();
    }, [fetchWorkshops]);

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
