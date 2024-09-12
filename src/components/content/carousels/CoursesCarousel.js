import React, { useState, useEffect, use } from 'react';
import { Carousel } from 'primereact/carousel';
import { parseCourseEvent } from '@/utils/nostr';
// import CourseTemplate from '@/components/content/carousels/templates/CourseTemplate';
import { CourseTemplate } from '@/components/content/carousels/newTemplates/CourseTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useCourses } from '@/hooks/nostr/useCourses';

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
    const { courses, coursesLoading, coursesError } = useCourses()

    useEffect(() => {
        const fetch = async () => {
            try {
                if (courses && courses.length > 0) {
                    const processedCourses = courses.map(course => parseCourseEvent(course));

                    setProcessedCourses(processedCourses);
                } else {
                    console.log('No courses fetched or empty array returned');
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        fetch();
    }, [courses]);

    if (coursesError) {
        return <div>Error: {coursesError.message}</div>
    }

    return (
        <>
            <h3 className="ml-[6%] mt-4">Courses</h3>
            <div className={"min-h-[384px]"}>
                <Carousel
                    value={coursesLoading || !processedCourses.length ? [{}, {}, {}] : [...processedCourses]}
                    numVisible={2}
                    itemTemplate={(item) => 
                        !processedCourses.length ? 
                        <TemplateSkeleton key={Math.random()} /> : 
                        <CourseTemplate key={item.id} course={item} />
                    }
                    responsiveOptions={responsiveOptions} />
            </div>
        </>
    );
}
