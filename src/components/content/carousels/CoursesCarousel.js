import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { parseEvent } from '@/utils/nostr';
import { useNostr } from '@/hooks/useNostr';
import CourseTemplate from '@/components/content/carousels/templates/CourseTemplate';
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

export default function CoursesCarousel() {
    const [processedCourses, setProcessedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchCourses } = useNostr();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const fetchedCourses = await fetchCourses();
                if (fetchedCourses && fetchedCourses.length > 0) {
                    const processed = fetchedCourses.map(course => parseEvent(course));
                    setProcessedCourses(processed);
                } else {
                    console.log('No courses fetched or empty array returned');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setLoading(false);
            }
        };        
        fetch();
    }, [fetchCourses]); 

    return (
        <>
            <h2 className="ml-[6%] mt-4">Courses</h2>
            <Carousel value={loading ? [{}, {}, {}] : [...processedCourses, ...processedCourses]} 
                      numVisible={2} 
                      itemTemplate={loading ? TemplateSkeleton : CourseTemplate}
                      responsiveOptions={responsiveOptions} />
        </>
    );
}
