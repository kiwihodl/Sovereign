import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import { formatTimestampToHowLongAgo } from '@/utils/time';

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
            <div onClick={() => router.push(`/course/${course.id}`)} className="flex flex-col items-center w-full px-4 cursor-pointer">
                <div className="w-86 h-60 bg-gray-200 overflow-hidden rounded-md shadow-lg">
                    <Image
                        alt="resource thumbnail"
                        src={returnImageProxy(course.image)}
                        width={344}
                        height={194}
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                <div className='flex flex-col justify-start w-[426px]'>
                    <h4 className="mb-1 font-bold text-xl">{course.title}</h4>
                    <p className='truncate'>{course.summary}</p>
                    <p className="text-sm mt-1 text-gray-400">Published: {formatTimestampToHowLongAgo(course.published_at)}</p>
                    {/* <div className="flex flex-row items-center justify-center gap-2">
                        <Button icon="pi pi-search" rounded />
                        <Button icon="pi pi-star-fill" rounded severity="success" />
                    </div> */}
                </div>
            </div>
        );
    };

    return (
        <>
            <h1 className="text-2xl font-bold ml-[6%] my-4">Courses</h1>
            <Carousel value={processedCourses} numVisible={3} itemTemplate={courseTemplate} />
        </>
    );
}
