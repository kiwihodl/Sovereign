import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { parseEvent, findKind0Fields } from "@/utils/nostr";
import DraftCourseDetails from "@/components/content/courses/DraftCourseDetails";
import DraftCourseLesson from "@/components/content/courses/DraftCourseLesson";
import { useNDKContext } from "@/context/NDKContext";
import { useSession } from "next-auth/react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { ProgressSpinner } from 'primereact/progressspinner';

const DraftCourse = () => {
    const { data: session, status } = useSession();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [lessonsWithAuthors, setLessonsWithAuthors] = useState([]);
    const { isAdmin, isLoading } = useIsAdmin();

    const router = useRouter();
    const {ndk, addSigner} = useNDKContext();
    const { slug } = router.query;

    useEffect(() => {
        if (isLoading) return;

        if (!isAdmin) {
            router.push('/');
        }
    }, [isAdmin, router, isLoading]);

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
                    setCourse(res.data);
                    setLessons(res.data.draftLessons);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        const fetchLessonDetails = async () => {
            if (lessons.length > 0 && status === "authenticated") {
                await ndk.connect();

                const newLessonsWithAuthors = await Promise.all(lessons.map(async (lesson) => {
                    // figure out if it is a resource or a draft
                    const isDraft = !lesson?.resource;
                    if (isDraft) {
                        const parsedLessonObject = {
                            ...lesson?.draft,
                            index: lesson.index,
                            author: session?.user || null // Use optional chaining and provide a fallback
                        }
                        return parsedLessonObject;
                    } else {
                        const filter = {
                            "#d": [lesson?.resource?.id]
                        };
                        
                        const event = await ndk.fetchEvent(filter);
                        if (event) {
                            const author = await fetchAuthor(event.pubkey);
                            return {
                                ...parseEvent(event),
                                index: lesson.index,
                                author
                            };
                        }
                    }
                        
                    return lesson; // Fallback to the original lesson if no event found
                }));

                setLessonsWithAuthors(newLessonsWithAuthors);
            }
        };

        fetchLessonDetails();
    }, [lessons, ndk, fetchAuthor, session, status]);

    if (status === "loading") {
        return <div className='w-full h-full flex items-center justify-center'><ProgressSpinner /></div>;
    }

    return (
        <>
            <DraftCourseDetails processedEvent={course} draftId={slug} lessons={lessonsWithAuthors} />
            {lessonsWithAuthors.length > 0 && lessonsWithAuthors.map((lesson, index) => (
                <DraftCourseLesson key={lesson.id} lesson={lesson} course={course} />
            ))}
        </>
    );
}

export default DraftCourse;
