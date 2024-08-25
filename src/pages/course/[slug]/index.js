import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { parseCourseEvent, parseEvent, findKind0Fields } from "@/utils/nostr";
import CourseDetails from "@/components/content/courses/CourseDetails";
import CourseLesson from "@/components/content/courses/CourseLesson";
import dynamic from 'next/dynamic';
import { useNDKContext } from "@/context/NDKContext";
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import { nip04 } from 'nostr-tools';
import { ProgressSpinner } from 'primereact/progressspinner';

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
    const [paidCourse, setPaidCourse] = useState(false);
    const [decryptionPerformed, setDecryptionPerformed] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const {ndk, addSigner} = useNDKContext();
    const { data: session, update } = useSession();
    const { showToast } = useToast();

    const privkey = process.env.NEXT_PUBLIC_APP_PRIV_KEY;
    const pubkey = process.env.NEXT_PUBLIC_APP_PUBLIC_KEY;

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

    useEffect(() => {
        console.log('lessons', lessons);
    }, [lessons]);

    useEffect(() => {
        console.log('lessonIds', lessonIds);
    }, [lessonIds]);

    useEffect(() => {
        if (course?.price && course?.price > 0) {
            setPaidCourse(true);
        }
    }, [course]);

    useEffect(() => {
        const decryptContent = async () => {
            if (session?.user && paidCourse && !decryptionPerformed) {
                setLoading(true);
                const canAccess = 
                    session.user.purchased?.some(purchase => purchase.courseId === course?.d) ||
                    session.user?.role?.subscribed ||
                    session.user?.pubkey === course?.pubkey;

                if (canAccess && lessons.length > 0) {
                    try {
                        const decryptedLessons = await Promise.all(lessons.map(async (lesson) => {
                            const decryptedContent = await nip04.decrypt(privkey, pubkey, lesson.content);
                            return { ...lesson, content: decryptedContent };
                        }));
                        setLessons(decryptedLessons);
                        setDecryptionPerformed(true);
                    } catch (error) {
                        console.error('Error decrypting lessons:', error);
                    }
                }
                setLoading(false);
            }
            setLoading(false);
        }
        decryptContent();
    }, [session, paidCourse, course, lessons, privkey, pubkey, decryptionPerformed]);

    useEffect(() => {
        if (course && lessons.length > 0 && (!paidCourse || decryptionPerformed)) {
            setLoading(false);
        }
    }, [course, lessons, paidCourse, decryptionPerformed]);

    const handlePaymentSuccess = async (response, newCourse) => {
        if (response && response?.preimage) {
            console.log("newCourse", newCourse);
            const updated = await update();
            console.log("session after update", updated);
        } else {
            showToast('error', 'Error', 'Failed to purchase course. Please try again.');
        }
    }

    const handlePaymentError = (error) => {
        showToast('error', 'Payment Error', `Failed to purchase course. Please try again. Error: ${error}`);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <>
            <CourseDetails 
                processedEvent={course} 
                paidCourse={paidCourse}
                lessons={lessons}
                decryptionPerformed={decryptionPerformed}
                handlePaymentSuccess={handlePaymentSuccess}
                handlePaymentError={handlePaymentError}
            />
            {lessons.length > 0 && lessons.map((lesson, index) => (
                <CourseLesson key={index} lesson={lesson} course={course} />
            ))}
            <div className="mx-auto my-6">
                {course?.content && <MDDisplay source={course.content} />}
            </div>
        </>
    );
}

export default Course;