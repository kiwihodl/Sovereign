import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { useNDKContext } from "@/context/NDKContext";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { findKind0Fields } from '@/utils/nostr';
import { useToast } from '@/hooks/useToast';
import 'primeicons/primeicons.css';

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

export default function DraftCourseDetails({ processedEvent, lessons }) {
    const [author, setAuthor] = useState(null);
    const [user, setUser] = useState(null);

    const { showToast } = useToast();
    const { returnImageProxy } = useImageProxy();
    const { data: session, status } = useSession();
    const router = useRouter();
    const ndk = useNDKContext();

    const fetchAuthor = useCallback(async (pubkey) => {
        if (!pubkey) return;
        const author = await ndk.getUser({ pubkey });
        const profile = await author.fetchProfile();
        const fields = await findKind0Fields(profile);
        if (fields) {
            setAuthor(fields);
        }
    }, [ndk]);

    useEffect(() => {
        if (processedEvent) {
            fetchAuthor(processedEvent?.user?.pubkey);
        }
    }, [fetchAuthor, processedEvent]);

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

    const handleDelete = () => {
        console.log('delete');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newCourseId = uuidv4();
        const processedLessons = [];

        try {
            // Step 1: Process lessons
            for (const lesson of lessons) {
                processedLessons.push({ 
                    d: lesson?.d, 
                    kind: lesson?.price ? 30402 : 30023,
                    pubkey: lesson.pubkey
                });
            }

            // Step 2: Create and publish course
            const courseEvent = createCourseEvent(newCourseId, processedEvent.title, processedEvent.summary, processedEvent.image, processedLessons);
            const published = await courseEvent.publish();

            console.log('published', published);

            if (!published) {
                throw new Error('Failed to publish course');
            }

            // Step 3: Save course to db
            console.log('processedLessons:', processedLessons);
            await axios.post('/api/courses', {
                id: newCourseId,
                resources: {
                    connect: processedLessons.map(lesson => ({ id: lesson?.d }))
                },
                noteId: courseEvent.id,
                user: {
                    connect: { id: user.id }
                },
                price: processedEvent?.price || 0
            });

            // step 4: Update all resources to have the course id
            await Promise.all(processedLessons.map(lesson => axios.put(`/api/resources/${lesson?.d}`, { courseId: newCourseId })));

            // Step 5: Delete draft
            await axios.delete(`/api/courses/drafts/${processedEvent.id}`);

            // Step 6: Show success message and redirect
            showToast('success', 'Course created successfully');
            router.push(`/course/${courseEvent.id}`);

        } catch (error) {
            console.error('Error creating course:', error);
            showToast('error', error.message || 'Failed to create course. Please try again.');
        }
    };

    const createCourseEvent = (courseId, title, summary, coverImage, lessons) => {
        const event = new NDKEvent(ndk);
        event.kind = 30004;
        event.content = "";
        event.tags = [
            ['d', courseId],
            ['name', title],
            ['picture', coverImage],
            ['image', coverImage],
            ['description', summary],
            ['l', "Education"],
            ...lessons.map((lesson) => ['a', `${lesson.kind}:${lesson.pubkey}:${lesson.d}`]),
        ];
        return event;
    };

    return (
        <div className='w-full px-24 pt-12 mx-auto mt-4 max-tab:px-0 max-mob:px-0 max-tab:pt-2 max-mob:pt-2'>
            <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
                <div className='w-[75vw] mx-auto flex flex-row items-start justify-between max-tab:flex-col max-mob:flex-col max-tab:w-[95vw] max-mob:w-[95vw]'>
                    <div className='flex flex-col items-start max-w-[45vw] max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                        <div className='pt-2 flex flex-row justify-start w-full'>
                            {processedEvent && processedEvent.topics && processedEvent.topics.length > 0 && (
                                processedEvent.topics.map((topic, index) => (
                                    <Tag className='mr-2 text-white' key={index} value={topic}></Tag>
                                ))
                            )}
                        </div>
                        <h1 className='text-4xl mt-6'>{processedEvent?.title}</h1>
                        <p className='text-xl mt-6'>{processedEvent?.summary}</p>
                        <div className='flex flex-row w-full mt-6 items-center'>
                            <Image
                                alt="avatar thumbnail"
                                src={returnImageProxy(author?.avatar, author?.pubkey)}
                                width={50}
                                height={50}
                                className="rounded-full mr-4"
                            />
                            <p className='text-lg'>
                                Created by{' '}
                                <a rel='noreferrer noopener' target='_blank' className='text-blue-500 hover:underline'>
                                    {author?.username || author?.name || author?.pubkey}
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-col max-tab:mt-12 max-mob:mt-12'>
                        {processedEvent && (
                            <div className='flex flex-col items-center justify-between rounded-lg h-72 p-4 bg-gray-700 drop-shadow-md'>
                                <Image
                                    alt="resource thumbnail"
                                    src={returnImageProxy(processedEvent.image)}
                                    width={344}
                                    height={194}
                                    className="w-[344px] h-full object-cover object-top rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className='w-[75vw] mx-auto flex flex-row justify-end mt-12'>
                <div className='w-fit flex flex-row justify-between'>
                    <Button onClick={handleSubmit} label="Publish" severity='success' outlined className="w-auto m-2" />
                    <Button onClick={() => router.push(`/draft/${draft?.id}/edit`)} label="Edit" severity='warning' outlined className="w-auto m-2" />
                    <Button onClick={handleDelete} label="Delete" severity='danger' outlined className="w-auto m-2 mr-0" />
                </div>
            </div>
            <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                {
                    processedEvent?.content && <MDDisplay source={processedEvent.content} />
                }
            </div>
        </div>
    );
}
