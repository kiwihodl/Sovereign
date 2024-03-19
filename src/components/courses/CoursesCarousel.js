import React, { useState, useEffect, use } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import { formatTimestampToHowLongAgo } from '@/utils/time';
import { useNostr } from '@/hooks/useNostr';

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

    const courseTemplate = (course) => {
        const { width, height } = calculateImageDimensions();
        return (
            <div style={{width: width < 768 ? "auto" : width}} onClick={() => router.push(`/details/${course.id}`)} className="flex flex-col items-center mx-auto px-4 cursor-pointer mt-8 rounded-md shadow-lg">
                <div style={{maxWidth: width, minWidth: width}} className="max-tab:h-auto max-mob:h-auto">
                    <Image
                        alt="resource thumbnail"
                        src={returnImageProxy(course.image)}
                        quality={100}
                        width={width}
                        height={height}
                        className="w-full h-full object-cover object-center rounded-md"
                    />
                    <div className='flex flex-col justify-start'>
                        <h4 className="mb-1 font-bold text-2xl font-blinker">{course.title}</h4>
                        <p style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'prewrap',
                            font: '400 1rem/1.5 Blinker, sans-serif'
                        }}>
                            {course.summary}
                        </p>
                        <p className="text-sm mt-1 text-gray-400">Published: {formatTimestampToHowLongAgo(course.published_at)}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <h2 className="ml-[6%] mt-4">courses</h2>
            <Carousel value={[...processedCourses, ...processedCourses]} numVisible={2} itemTemplate={courseTemplate} responsiveOptions={responsiveOptions} />
        </>
    );
}
