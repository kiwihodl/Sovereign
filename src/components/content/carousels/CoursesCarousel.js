import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
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
    const [courses, setCourses] = useState([]);
    const { fetchCourses } = useNostr();

    useEffect(() => {
        const fetch = async () => {
            try {
                const courses = await fetchCourses();
                console.log('courses:', courses);
                setCourses(courses);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        fetch();
    }, [fetchCourses]);

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
