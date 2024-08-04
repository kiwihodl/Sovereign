import React, { useState, useEffect, use } from 'react';
import { Carousel } from 'primereact/carousel';
import { parseCourseEvent } from '@/utils/nostr';
import { useZapsQuery } from '@/hooks/nostrQueries/useZapsQuery';
import CourseTemplate from '@/components/content/carousels/templates/CourseTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useCoursesQuery } from '@/hooks/nostrQueries/useCoursesQuery';

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
    const { courses, coursesLoading, coursesError, refetchCourses } = useCoursesQuery()
    const { zaps, zapsLoading, zapsError, refetchZaps } = useZapsQuery({ events: courses })

    useEffect(() => {
        refetchZaps(courses)
    }, [courses, refetchZaps]);

    useEffect(() => {
        const fetch = async () => {
            try {
                if (courses && courses.length > 0 && zaps) {
                    const processedCourses = courses.map(course => parseCourseEvent(course));

                    let coursesWithZaps = processedCourses.map(course => {
                        let collectedZaps = []
                        zaps.forEach(zap => {
                            if (zap.tags.find(tag => tag[0] === "e" && tag[1] === course.id) || zap.tags.find(tag => tag[0] === "a" && tag[1] === `${course.kind}:${course.id}:${course.d}`)) {
                                collectedZaps.push(zap)
                            }
                        })
                        return { ...course, zaps: collectedZaps }
                    })

                    setProcessedCourses(coursesWithZaps);
                } else {
                    console.log('No courses fetched or empty array returned');
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        fetch();
    }, [courses, zaps]);

    if (coursesError) {
        return <div>Error: {coursesError.message}</div>
    }

    if (coursesLoading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <h2 className="ml-[6%] mt-4">Courses</h2>
            <div className={"min-h-[384px]"}>
                <Carousel
                    value={!processedCourses.length > 0 ? [{}, {}, {}] : [...processedCourses]}
                    numVisible={2}
                    itemTemplate={(item) => 
                        processedCourses.length > 0 ? 
                        <CourseTemplate key={item.id} course={item} /> : 
                        <TemplateSkeleton key={Math.random()} />
                    }
                    responsiveOptions={responsiveOptions} />
            </div>
        </>
    );
}
