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
    const [screenWidth, setScreenWidth] = useState(null);
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
        // Update the state to the current window width
        setScreenWidth(window.innerWidth);

        const handleResize = () => {
            // Update the state to the new window width when it changes
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Remove the event listener on cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []); // The empty array ensures this effect only runs once, similar to componentDidMount


    const calculateImageDimensions = () => {
        if (screenWidth >= 1200) {
            // Large screens
            return { width: 426, height: 240 };
        } else if (screenWidth >= 768 && screenWidth < 1200) {
            // Medium screens
            return { width: 344, height: 194 };
        } else {
            // Small screens
            return { width: screenWidth - 120, height: (screenWidth - 120) * (9 / 16) };
        }
    };

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
