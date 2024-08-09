import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { parseEvent, findKind0Fields } from "@/utils/nostr";
import DraftCourseDetails from "@/components/course/DraftCourseDetails";
import DraftCourseLesson from "@/components/course/DraftCourseLesson";
import dynamic from 'next/dynamic';
import { useNDKContext } from "@/context/NDKContext";

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

const DraftCourse = () => {
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [lessonsWithAuthors, setLessonsWithAuthors] = useState([]);

    const router = useRouter();
    const ndk = useNDKContext();

    const fetchAuthor = useCallback(async (pubkey) => {
        if (!pubkey) return;
        const author = await ndk.getUser({ pubkey });
        const profile = await author.fetchProfile();
        const fields = await findKind0Fields(profile);
        if (fields) {
            return fields;
        }
        return null; // Return null if no fields found
    }, [ndk]);

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            axios.get(`/api/courses/drafts/${slug}`)
                .then(res => {
                    console.log('res:', res.data);
                    setCourse(res.data);
                    setLessons(res.data.resources); // Set the raw lessons
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        const fetchLessonDetails = async () => {
            if (lessons.length > 0) {
                await ndk.connect();

                const newLessonsWithAuthors = await Promise.all(lessons.map(async (lesson) => {
                    const filter = {
                        "#d": [lesson.id]
                    };

                    const event = await ndk.fetchEvent(filter);
                    if (event) {
                        const author = await fetchAuthor(event.pubkey);
                        return {
                            ...parseEvent(event),
                            author
                        };
                    }
                    return lesson; // Fallback to the original lesson if no event found
                }));

                setLessonsWithAuthors(newLessonsWithAuthors);
            }
        };

        fetchLessonDetails();
    }, [lessons, ndk, fetchAuthor]);

    return (
        <>
            <DraftCourseDetails processedEvent={course} lessons={lessonsWithAuthors} />
            {lessonsWithAuthors.length > 0 && lessonsWithAuthors.map((lesson, index) => (
                <DraftCourseLesson key={lesson.id} lesson={lesson} course={course} />
            ))}
        </>
    );
}

export default DraftCourse;
