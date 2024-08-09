import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { parseCourseEvent, parseEvent, findKind0Fields } from "@/utils/nostr";
import CourseDetails from "@/components/course/CourseDetails";
import CourseLesson from "@/components/course/CourseLesson";
import dynamic from 'next/dynamic';
import { useNDKContext } from "@/context/NDKContext";

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
    const ndk = useNDKContext();

    const fetchAuthor = useCallback(async (pubkey) => {
        const author = await ndk.getUser({ pubkey });
        const profile = await author.fetchProfile();
        const fields = await findKind0Fields(profile);
        if (fields) {
            return fields;
        }
    }, [ndk]);

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            const fetchCourse = async (slug) => {
                try {
                    await ndk.connect();

                    const filter = {
                        ids: [slug]
                    }

                    const event = await ndk.fetchEvent(filter);

                    if (event) {
                        const author = await fetchAuthor(event.pubkey);
                        const aTags = event.tags.filter(tag => tag[0] === 'a');
                        const lessonIds = aTags.map(tag => tag[1].split(':')[2]);
                        setLessonIds(lessonIds);
                        const parsedCourse = {
                            ...parseCourseEvent(event),
                            author
                        };
                        setCourse(parsedCourse);
                    }
                } catch (error) {
                    console.error('Error fetching event:', error);
                }
            };
            if (ndk) {
                fetchCourse(slug);
            }
        }
    }, [router.isReady, router.query, ndk, fetchAuthor]);

    useEffect(() => {
        if (lessonIds.length > 0) {

            const fetchLesson = async (lessonId) => {
                try {
                    await ndk.connect();

                    const filter = {
                        "#d": [lessonId]
                    }

                    const event = await ndk.fetchEvent(filter);

                    if (event) {
                        const author = await fetchAuthor(event.pubkey);
                        const parsedLesson = {
                            ...parseEvent(event),
                            author
                        };
                        setLessons(prev => [...prev, parsedLesson]);
                    }
                } catch (error) {
                    console.error('Error fetching event:', error);
                }
            };

            lessonIds.forEach(lessonId => fetchLesson(lessonId));
        }
    }, [lessonIds, ndk, fetchAuthor]);

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