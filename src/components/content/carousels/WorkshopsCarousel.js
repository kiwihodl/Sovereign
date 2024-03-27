import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import { useNostr } from '@/hooks/useNostr';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import WorkshopTemplate from '@/components/content/carousels/templates/WorkshopTemplate';

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
    const [workshops, setWorkshops] = useState([]);
    const router = useRouter();
    const { fetchWorkshops, events } = useNostr();
    const { returnImageProxy } = useImageProxy();

    useEffect(() => {
        if (events && events.workshops && events.workshops.length > 0) {
            setWorkshops(events.workshops);
        } else {
            fetchWorkshops();
        }
    }, [events]);

    useEffect(() => {
        const processWorkshops = workshops.map(workshop => {
            const { id, content, title, summary, image, published_at } = parseEvent(workshop);
            return { id, content, title, summary, image, published_at };
        });
        setProcessedWorkshops(processWorkshops);
    }, [workshops]);

    return (
        <>
            <h2 className="ml-[6%] mt-4">workshops</h2>
            <Carousel value={[...processedWorkshops, ...processedWorkshops]} numVisible={2} itemTemplate={WorkshopTemplate} responsiveOptions={responsiveOptions} />
        </>
    );
}
