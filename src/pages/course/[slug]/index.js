import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { parseCourseEvent, parseEvent, findKind0Fields } from "@/utils/nostr";
import CourseDetailsNew from "@/components/content/courses/CourseDetailsNew";
import VideoLesson from "@/components/content/courses/VideoLesson";
import DocumentLesson from "@/components/content/courses/DocumentLesson";
import { useNDKContext } from "@/context/NDKContext";
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';
import { nip04, nip19 } from 'nostr-tools';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Accordion, AccordionTab } from 'primereact/accordion';
import dynamic from 'next/dynamic';

const MDDisplay = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

const useCourseData = (ndk, fetchAuthor, router) => {
    const [course, setCourse] = useState(null);
    const [lessonIds, setLessonIds] = useState([]);

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;
            const { data } = nip19.decode(slug);
            if (!data) {
                showToast('error', 'Error', 'Course not found');
                return;
            }
            const id = data?.identifier;
            const fetchCourse = async (id) => {
                try {
                    await ndk.connect();
                    const filter = { ids: [id] };
                    const event = await ndk.fetchEvent(filter);
                    if (event) {
                        const author = await fetchAuthor(event.pubkey);
                        const aTags = event.tags.filter(tag => tag[0] === 'a');
                        const lessonIds = aTags.map(tag => tag[1].split(':')[2]);
                        setLessonIds(lessonIds);
                        const parsedCourse = { ...parseCourseEvent(event), author };
                        setCourse(parsedCourse);
                    }
                } catch (error) {
                    console.error('Error fetching event:', error);
                }
            };
            if (ndk && id) {
                fetchCourse(id);
            }
        }
    }, [router.isReady, router.query, ndk, fetchAuthor]);

    return { course, lessonIds };
};

const useLessons = (ndk, fetchAuthor, lessonIds) => {
    const [lessons, setLessons] = useState([]);
    const [uniqueLessons, setUniqueLessons] = useState([]);

    useEffect(() => {
        if (lessonIds.length > 0) {
            const fetchLesson = async (lessonId) => {
                try {
                    await ndk.connect();
                    const filter = { "#d": [lessonId] };
                    const event = await ndk.fetchEvent(filter);
                    if (event) {
                        const author = await fetchAuthor(event.pubkey);
                        const parsedLesson = { ...parseEvent(event), author };
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
        const uniqueLessonSet = new Set(lessons.map(JSON.stringify));
        const newUniqueLessons = Array.from(uniqueLessonSet).map(JSON.parse);
        setUniqueLessons(newUniqueLessons);
    }, [lessons]);

    return { lessons, uniqueLessons, setLessons };
};

const useDecryption = (session, paidCourse, course, lessons, setLessons) => {
    const [decryptionPerformed, setDecryptionPerformed] = useState(false);
    const [loading, setLoading] = useState(true);
    const privkey = process.env.NEXT_PUBLIC_APP_PRIV_KEY;
    const pubkey = process.env.NEXT_PUBLIC_APP_PUBLIC_KEY;

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
    }, [session, paidCourse, course, lessons, privkey, pubkey, decryptionPerformed, setLessons]);

    return { decryptionPerformed, loading };
};

const Course = () => {
    const router = useRouter();
    const { ndk, addSigner } = useNDKContext();
    const { data: session, update } = useSession();
    const { showToast } = useToast();
    const [paidCourse, setPaidCourse] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);

    const fetchAuthor = useCallback(async (pubkey) => {
        const author = await ndk.getUser({ pubkey });
        const profile = await author.fetchProfile();
        const fields = await findKind0Fields(profile);
        return fields;
    }, [ndk]);

    const { course, lessonIds } = useCourseData(ndk, fetchAuthor, router);
    const { lessons, uniqueLessons, setLessons } = useLessons(ndk, fetchAuthor, lessonIds);
    const { decryptionPerformed, loading } = useDecryption(session, paidCourse, course, lessons, setLessons);

    useEffect(() => {
        if (course?.price && course?.price > 0) {
            setPaidCourse(true);
        }
    }, [course]);

    useEffect(() => {
        if (router.isReady) {
            const { active } = router.query;
            if (active !== undefined) {
                setExpandedIndex(parseInt(active, 10));
            } else {
                setExpandedIndex(null);
            }
        }
    }, [router.isReady, router.query]);

    const handleAccordionChange = (e) => {
        const newIndex = e.index === expandedIndex ? null : e.index;
        setExpandedIndex(newIndex);
        
        if (newIndex !== null) {
            router.push(`/course/${router.query.slug}?active=${newIndex}`, undefined, { shallow: true });
        } else {
            router.push(`/course/${router.query.slug}`, undefined, { shallow: true });
        }
    };

    const handlePaymentSuccess = async (response) => {
        if (response && response?.preimage) {
            const updated = await update();
            console.log("session after update", updated);
            showToast('success', 'Payment Success', 'You have successfully purchased this course');
            router.reload();
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
            <CourseDetailsNew 
                processedEvent={course} 
                paidCourse={paidCourse}
                lessons={uniqueLessons}
                decryptionPerformed={decryptionPerformed}
                handlePaymentSuccess={handlePaymentSuccess}
                handlePaymentError={handlePaymentError}
            />
            <Accordion 
                activeIndex={expandedIndex} 
                onTabChange={handleAccordionChange}
                className="mt-4 px-4"
            >
                {uniqueLessons.length > 0 && uniqueLessons.map((lesson, index) => (
                    <AccordionTab 
                        key={index}
                        pt={{
                            root: { className: 'border-none' },
                            header: { className: 'border-none' },
                            headerAction: { className: 'border-none' },
                            content: { className: 'border-none' },
                            accordiontab: { className: 'border-none' },
                        }}
                        header={
                            <div className="flex align-items-center justify-content-between w-full">
                                <span id={`lesson-${index}`} className="font-bold text-xl">{`Lesson ${index + 1}: ${lesson.title}`}</span>
                            </div>
                        }
                    >
                        <div className="w-full py-4 rounded-b-lg">
                            {lesson.type === 'workshop' ? 
                                <VideoLesson lesson={lesson} course={course} decryptionPerformed={decryptionPerformed} isPaid={paidCourse} /> : 
                                <DocumentLesson lesson={lesson} course={course} decryptionPerformed={decryptionPerformed} isPaid={paidCourse} />
                            }
                        </div>
                    </AccordionTab>
                ))}
            </Accordion>
            <div className="mx-auto my-6">
                {course?.content && <MDDisplay className='p-4 rounded-lg' source={course.content} />}
            </div>
        </>
    );
}

export default Course;