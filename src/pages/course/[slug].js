import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useNostr } from "@/hooks/useNostr";
import { parseCourseEvent, parseEvent, findKind0Fields } from "@/utils/nostr";
import CourseDetails from "@/components/course/CourseDetails";
import CourseLesson from "@/components/course/CourseLesson";
import dynamic from 'next/dynamic';
const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

const Course = () => {
    const [course, setCourse] = useState(null);
    const [lessonIds, setLessonIds] = useState([]);
    const [lessons, setLessons] = useState([]);

    const router = useRouter();
    const { fetchSingleEvent, fetchSingleNaddrEvent, fetchKind0 } = useNostr();

    const { slug } = router.query;

    const fetchAuthor = async (pubkey) => {
        const author = await fetchKind0(pubkey);
        const fields = await findKind0Fields(author);
        if (fields) {
            return fields;
        }
    }

    useEffect(() => {
        const getCourse = async () => {
            if (slug) {
                const fetchedCourse = await fetchSingleEvent(slug);
                const formattedCourse = parseCourseEvent(fetchedCourse);
                const aTags = formattedCourse.tags.filter(tag => tag[0] === 'a');
                setCourse(formattedCourse);
                if (aTags.length > 0) {
                    const lessonIds = aTags.map(tag => tag[1]);
                    setLessonIds(lessonIds);
                }
            }
        };

        if (slug && !course) {
            getCourse();
        }
    }, [slug]);

    useEffect(() => {
        if (lessonIds.length > 0) {

            const fetchLesson = async (lessonId) => {
                try {
                    const l = await fetchSingleNaddrEvent(lessonId.split(':')[2]);
                    const author = await fetchAuthor(l.pubkey);
                    const parsedLesson = parseEvent(l);
                    const lessonObj = {
                        ...parsedLesson,
                        author
                    }
                    setLessons(prev => [...prev, lessonObj]);
                } catch (error) {
                    console.error('Error fetching lesson:', error);
                }
            }

            lessonIds.forEach(lessonId => fetchLesson(lessonId));
        }
    }, [lessonIds]);

    return (
        <>
            <CourseDetails processedEvent={course} />
            {lessons.length > 0 && lessons.map((lesson, index) => (
                <CourseLesson key={index} lesson={lesson} course={course} />
            ))}
            <div className="mx-auto my-6">
                {
                    course?.content && <MDDisplay source={course.content} />
                }
            </div>
        </>
    );
}

export default Course;