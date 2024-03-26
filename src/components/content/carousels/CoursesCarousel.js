import React, { useState, useEffect, use } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import { useNostr } from '@/hooks/useNostr';
import CourseTemplate from '@/components/content/carousels/templates/CourseTemplate';

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


export default function CoursesCarousel() {
    const [processedCourses, setProcessedCourses] = useState([]);
    const [screenWidth, setScreenWidth] = useState(null);
    const [courses, setCourses] = useState([]);
    const router = useRouter();
    const { fetchCourses, events } = useNostr();
    const { returnImageProxy } = useImageProxy();

    useEffect(() => {
        if (events && events.courses && events.courses.length > 0) {
            setCourses(events.courses);
        } else {
            fetchCourses();
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
        const processCourses = courses.map(course => {
            const { id, content, title, summary, image, published_at } = parseEvent(course);
            return { id, content, title, summary, image, published_at };
        }
        );
        setProcessedCourses(processCourses);
    }, [courses]);

    return (
        <>
            <h2 className="ml-[6%] mt-4">courses</h2>
            <Carousel value={[...processedCourses, ...processedCourses]} numVisible={2} itemTemplate={CourseTemplate} responsiveOptions={responsiveOptions} />
        </>
    );
}
