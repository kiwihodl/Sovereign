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
    const [decryptedContent, setDecryptedContent] = useState(null);

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
        if (course?.price) {
            setPaidCourse(true);
        }
    }, [course]);

    useEffect(() => {
        const decryptContent = async () => {
            if (session?.user && paidCourse) {
                if (session.user?.purchased?.length > 0) {
                    const purchasedCourse = session.user.purchased.find(purchase => purchase.resourceId === course.d);
                    if (purchasedCourse) {
                        const decryptedContent = await nip04.decrypt(privkey, pubkey, course.content);
                        setDecryptedContent(decryptedContent);
                    }
                } else if (session.user?.role && session.user.role.subscribed) {
                    const decryptedContent = await nip04.decrypt(privkey, pubkey, course.content);
                    setDecryptedContent(decryptedContent);
                }
            }
        }
        decryptContent();
    }, [session, paidCourse, course]);

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

    return (
        <>
            <CourseDetails 
                processedEvent={course} 
                paidCourse={paidCourse}
                decryptedContent={decryptedContent}
                handlePaymentSuccess={handlePaymentSuccess}
                handlePaymentError={handlePaymentError}
            />
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