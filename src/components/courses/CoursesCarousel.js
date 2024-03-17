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

    useEffect(() => {
        const processCourses = courses.map(course => {
            const { id, content, title, summary, image, published_at } = parseEvent(course);
            return { id, content, title, summary, image, published_at };
        }
        );
        setProcessedCourses(processCourses);
    }, [courses]);

    const courseTemplate = (course) => {
        return (
            <div onClick={() => router.push(`/details/${course.id}`)} className="flex flex-col items-center w-full mx-auto px-4 cursor-pointer mt-8">
                <div className="w-86 h-60 bg-gray-200 overflow-hidden rounded-md shadow-lg">
                    <Image
                        alt="resource thumbnail"
                        src={returnImageProxy(course.image)}
                        width={344}
                        height={194}
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                <div className='flex flex-col justify-start max-w-[426px]'>
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
            <Carousel value={processedCourses} numVisible={3} itemTemplate={courseTemplate} responsiveOptions={responsiveOptions} />
        </>
    );
}
