import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import { formatTimestampToHowLongAgo } from '@/utils/time';

const responsiveOptions = [
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
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
    const courses = useSelector((state) => state.events.courses);
    const [processedCourses, setProcessedCourses] = useState([]);
    const { returnImageProxy } = useImageProxy();

    const router = useRouter();

    const [screenWidth, setScreenWidth] = useState(null);

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
    

    // Function to calculate image dimensions based on screenWidth
    const calculateImageDimensions = () => {
        if (screenWidth >= 1200) {
            // Large screens
            return { width: 344, height: 194 };
        } else if (screenWidth >= 768 && screenWidth < 1200) {
            // Medium screens
            return { width: 300, height: 169 };
        } else {
            console.log('screenWidth:', screenWidth);
            // Small screens
            return { width: screenWidth - 30, height: (screenWidth - 30) * (9 / 16) };
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
        console.log('width:', width);
        console.log('height:', height);

        return (
            <div onClick={() => router.push(`/details/${course.id}`)} className="flex flex-col items-center w-full mx-auto px-4 cursor-pointer mt-8">
                <div className="w-86 h-60 bg-gray-200 overflow-hidden rounded-md shadow-lg max-tab:w-[100vw] max-mob:w-[100vw] max-tab:h-auto max-mob:h-auto">
                    <Image
                        alt="resource thumbnail"
                        src={returnImageProxy(course.image)}
                        quality={100}
                        width={width}
                        height={height}
                    />
                </div>
                <div className='flex flex-col justify-start max-w-[426px] max-tab:w-[100vw] max-mob:w-[100vw]'>
                    <h4 className="mb-1 font-bold text-xl">{course.title}</h4>
                    <p className='truncate'>{course.summary}</p>
                    <p className="text-sm mt-1 text-gray-400">Published: {formatTimestampToHowLongAgo(course.published_at)}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            <h1 className="text-2xl ml-[6%] mt-4">courses</h1>
            <Carousel value={processedCourses} numVisible={2} itemTemplate={courseTemplate} responsiveOptions={responsiveOptions} />
        </>
    );
}
