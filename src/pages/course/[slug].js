import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useNostr } from "@/hooks/useNostr";
import { parseCourseEvent, parseEvent, findKind0Fields } from "@/utils/nostr";
import { useImageProxy } from "@/hooks/useImageProxy";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import Image from "next/image";
import CourseDetails from "@/components/CourseDetails";
import { nip19 } from "nostr-tools";
import dynamic from 'next/dynamic';
const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);
const BitcoinConnectPayButton = dynamic(
    () => import('@getalby/bitcoin-connect-react').then((mod) => mod.PayButton),
    {
        ssr: false,
    }
);

const Course = () => {
    const [course, setCourse] = useState(null);
    const [lessonIds, setLessonIds] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [bitcoinConnect, setBitcoinConnect] = useState(false);

    const router = useRouter();
    const { fetchSingleEvent, fetchSingleNaddrEvent, fetchKind0 } = useNostr();
    const { returnImageProxy } = useImageProxy();

    const { slug } = router.query;

    const fetchAuthor = async (pubkey) => {
        const author = await fetchKind0(pubkey);
        const fields = await findKind0Fields(author);
        if (fields) {
            return fields;
        }
    }

    const handleZapEvent = async () => {
        if (!event) return;

        const response = await zapEvent(event);

        console.log('zap response:', response);
    }

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const bitcoinConnectConfig = window.localStorage.getItem('bc:config');

        if (bitcoinConnectConfig) {
            setBitcoinConnect(true);
        }
    }, []);

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
                    console.log("LESSON IDS", lessonIds);
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

    useEffect(() => {
        console.log("AHHHHH", lessons);
    }, [lessons])

    return (
        <>
            <CourseDetails processedEvent={course} />
            {lessons.length > 0 && lessons.map((lesson, index) => (
                    <div key={index} className='w-full px-24 pt-12 mx-auto mt-4 max-tab:px-0 max-mob:px-0 max-tab:pt-2 max-mob:pt-2'>
                        <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
                            <div className='w-[75vw] mx-auto flex flex-row items-start justify-between max-tab:flex-col max-mob:flex-col max-tab:w-[95vw] max-mob:w-[95vw]'>
                                <div className='flex flex-col items-start max-w-[45vw] max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                                    <div className='pt-2 flex flex-row justify-start w-full'>
                                        {lesson && lesson.topics && lesson.topics.length > 0 && (
                                            lesson.topics.map((topic, index) => (
                                                <Tag className='mr-2 text-white' key={index} value={topic}></Tag>
                                            ))
                                        )
                                        }
                                    </div>
                                    <h1 className='text-4xl mt-6'>{lesson?.title}</h1>
                                    <p className='text-xl mt-6'>{lesson?.summary}</p>
                                    <div className='flex flex-row w-full mt-6 items-center'>
                                        <Image
                                            alt="avatar thumbnail"
                                            src={returnImageProxy(lesson.author?.avatar, lesson.author?.pubkey)}
                                            width={50}
                                            height={50}
                                            className="rounded-full mr-4"
                                        />
                                        <p className='text-lg'>
                                            Created by{' '}
                                            <a rel='noreferrer noopener' target='_blank' className='text-blue-500 hover:underline'>
                                                {lesson.author?.username}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                <div className='flex flex-col max-tab:mt-12 max-mob:mt-12'>
                                    {lesson && (
                                        <div className='flex flex-col items-center justify-between rounded-lg h-72 p-4 bg-gray-700 drop-shadow-md'>
                                            <Image
                                                alt="resource thumbnail"
                                                src={returnImageProxy(lesson.image)}
                                                width={344}
                                                height={194}
                                                className="w-[344px] h-[194px] object-cover object-top rounded-lg"
                                            />
                                            {bitcoinConnect ? (
                                                <div>
                                                    <BitcoinConnectPayButton onClick={handleZapEvent} />
                                                </div>
                                            ) : (
                                                <div>
                                                    <Button
                                                        icon="pi pi-bolt"
                                                        label="Zap"
                                                        severity="success"
                                                        outlined
                                                        onClick={handleZapEvent}
                                                        pt={{
                                                            button: {
                                                                icon: ({ context }) => ({
                                                                    className: 'bg-yellow-500'
                                                                })
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                            {
                                lesson?.content && <MDDisplay source={lesson.content} />
                            }
                        </div>
                    </div>
                ))
            }
            <div className="mx-auto my-6">
                {
                    course?.content && <MDDisplay source={course.content} />
                }
            </div>
        </>
    );
}

export default Course;