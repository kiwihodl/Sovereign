import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Tag } from 'primereact/tag';
import GenericButton from '@/components/buttons/GenericButton';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { nip04, nip19 } from 'nostr-tools';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { useNDKContext } from "@/context/NDKContext";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { findKind0Fields } from '@/utils/nostr';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/utils/time';
import { validateEvent } from '@/utils/nostr';
import { defaultRelayUrls } from "@/context/NDKContext";
import 'primeicons/primeicons.css';

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

export default function DraftCourseDetails({ processedEvent, draftId, lessons }) {
    const [author, setAuthor] = useState(null);
    const [user, setUser] = useState(null);
    const [processedLessons, setProcessedLessons] = useState([]);
    const hasRunEffect = useRef(false);

    const { showToast } = useToast();
    const { returnImageProxy } = useImageProxy();
    const { data: session, status } = useSession();
    const router = useRouter();
    const { ndk, addSigner } = useNDKContext();

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
        console.log('lessons in comp', lessons);
    }, [lessons]);

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
        axios.delete(`/api/courses/drafts/${processedEvent.id}`)
            .then(() => {
                showToast('success', 'Success', 'Draft Course deleted successfully');
                router.push('/');
            })
            .catch((error) => {
                showToast('error', 'Error', 'Failed to delete draft course');
            });
    }

    const handlePostLesson = async (lesson) => {
        console.log('lesson in handlePostLesson', lesson);
        let payload;


        if (lesson.d) {
            payload = {
                resourceId: lesson.d,
                index: lesson.index
            }
        } else if (lesson.draftId) {
            payload = {
                draftId: lesson.draftId,
                index: lesson.index
            }
        }

        const response = await axios.post(`/api/lessons`, payload);
        return response.data;
    }

    const handlePostResource = async (resource) => {
        console.log('resourceeeeee:', resource.tags);
        const dTag = resource.tags.find(tag => tag[0] === 'd')[1];
        let price

        try {
            price = resource.tags.find(tag => tag[0] === 'price')[1];
        } catch (err) {
            price = 0;
        }

        const nAddress = nip19.naddrEncode({
            pubkey: resource.pubkey,
            kind: resource.kind,
            identifier: dTag,
            relayUrls: defaultRelayUrls
        });

        const userResponse = await axios.get(`/api/users/${user.pubkey}`);

        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }

        const payload = {
            id: dTag,
            userId: userResponse.data.id,
            price: Number(price),
            noteId: nAddress
        };

        const response = await axios.post(`/api/resources`, payload);

        if (response.status !== 201) {
            showToast('error', 'Error', 'Failed to create resource. Please try again.');
            return;
        }

        return response.data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newCourseId = uuidv4();

        try {
            // Step 0: Add signer if not already added
            if (!ndk.signer) {
                await addSigner();
            }
            // Step 1: Process lessons
            const createdLessons = [];
            for (const lesson of processedLessons) {
                let savedLesson;
                if (lesson.unpublished) {
                    const validationResult = validateEvent(lesson.unpublished);
                    if (validationResult !== true) {
                        console.error('Invalid event:', validationResult);
                        showToast('error', 'Error', `Invalid event: ${validationResult}`);
                        return;
                    }

                    const published = await lesson.unpublished.publish();
                    savedLesson = await handlePostResource(lesson.unpublished);

                    if (published && savedLesson) {
                        const deleted = await axios.delete(`/api/drafts/${lesson.d}`);
                        if (deleted && deleted.status === 204) {
                            const savedLesson = await handlePostLesson(lesson);
                            if (savedLesson) {
                                createdLessons.push(savedLesson);
                            }
                        }
                    }
                } else {
                    const savedLesson = await handlePostLesson(lesson);
                    if (savedLesson) {
                        createdLessons.push(savedLesson);
                    }
                }
            }

            console.log('createdLessons', createdLessons);

            // Step 2: Create and publish course
            const courseEvent = createCourseEvent(newCourseId, processedEvent.title, processedEvent.summary, processedEvent.image, processedLessons, processedEvent.price);
            const published = await courseEvent.publish();

            if (!published) {
                throw new Error('Failed to publish course');
            }

            // Step 3: Save course to db
            const courseData = {
                id: newCourseId,
                lessons: {
                    connect: createdLessons.map(lesson => ({ id: lesson.id }))
                },
                noteId: courseEvent.id,
                user: {
                    connect: { id: user.id }
                },
                price: processedEvent?.price || 0
            };

            const createdCourse = await axios.post('/api/courses', courseData);

            // Step 4: Update all lessons to have the course id
            await Promise.all(createdLessons.map(lesson => axios.put(`/api/lessons/${lesson.id}`, { courseId: newCourseId })));

            // Step 5: Delete draft
            await axios.delete(`/api/courses/drafts/${processedEvent.id}`);

            // Step 6: Show success message and redirect
            showToast('success', 'Success', 'Course created successfully');
            router.push("/");

        } catch (error) {
            console.error('Error creating course:', error);
            showToast('error', 'Error', error.message || 'Failed to create course. Please try again.');
        }
    };

    const createCourseEvent = (courseId, title, summary, coverImage, lessons, price) => {
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
            ['price', price.toString()],
            // map out the lessons by order of the index property which is on each lesson
            ...lessons.sort((a, b) => a.index - b.index).map((lesson) => ['a', `${lesson.kind}:${lesson.pubkey}:${lesson.d}`]),
        ];
        return event;
    };

    useEffect(() => {
        async function buildEvent(draft) {
            if (!draft) {
                console.error('Draft is null or undefined');
                return null;
            }

            const event = new NDKEvent(ndk);
            let type;
            let encryptedContent;

            console.log('Draft:', draft);

            switch (draft?.type) {
                case 'document':
                    if (draft?.price) {
                        // encrypt the content with NEXT_PUBLIC_APP_PRIV_KEY to NEXT_PUBLIC_APP_PUBLIC_KEY
                        encryptedContent = await nip04.encrypt(process.env.NEXT_PUBLIC_APP_PRIV_KEY, process.env.NEXT_PUBLIC_APP_PUBLIC_KEY, draft.content);
                    }

                    event.kind = draft?.price ? 30402 : 30023; // Determine kind based on if price is present
                    event.content = draft?.price ? encryptedContent : draft.content;
                    event.created_at = Math.floor(Date.now() / 1000);
                    event.pubkey = user.pubkey;
                    event.tags = [
                        ['d', draft.id],
                        ['title', draft.title],
                        ['summary', draft.summary],
                        ['image', draft.image],
                        ...draft.topics.map(topic => ['t', topic]),
                        ['published_at', Math.floor(Date.now() / 1000).toString()],
                        ...(draft?.price ? [['price', draft.price.toString()], ['location', `https://plebdevs.com/details/${draft.id}`]] : []),
                        ...(draft?.additionalLinks ? draft.additionalLinks.map(link => ['r', link]) : []),
                    ];

                    type = 'document';
                    break;
                case 'video':
                    if (draft?.price) {
                        // encrypt the content with NEXT_PUBLIC_APP_PRIV_KEY to NEXT_PUBLIC_APP_PUBLIC_KEY
                        encryptedContent = await nip04.encrypt(process.env.NEXT_PUBLIC_APP_PRIV_KEY, process.env.NEXT_PUBLIC_APP_PUBLIC_KEY, draft.content);
                    }

                    event.kind = draft?.price ? 30402 : 30023;
                    event.content = draft?.price ? encryptedContent : draft.content;
                    event.created_at = Math.floor(Date.now() / 1000);
                    event.pubkey = user.pubkey;
                    event.tags = [
                        ['d', draft.id],
                        ['title', draft.title],
                        ['summary', draft.summary],
                        ['image', draft.image],
                        ...draft.topics.map(topic => ['t', topic]),
                        ['published_at', Math.floor(Date.now() / 1000).toString()],
                        ...(draft?.price ? [['price', draft.price.toString()], ['location', `https://plebdevs.com/details/${draft.id}`]] : []),
                        ...(draft?.additionalLinks ? draft.additionalLinks.map(link => ['r', link]) : []),
                    ];

                    type = 'video';
                    break;
                default:
                    return null;
            }

            return { unsignedEvent: event, type };
        }

        async function buildDraftEvent(lesson) {
            if (!lesson) {
                console.error('Lesson is null or undefined');
                return null;
            }

            const result = await buildEvent(lesson);
            if (!result) {
                console.error('Failed to build event');
                return null;
            }

            const { unsignedEvent, type } = result;
            return unsignedEvent;
        }

        if (!hasRunEffect.current && lessons.length > 0 && user && author) {
            hasRunEffect.current = true;
            
            lessons.forEach(async (lesson) => {
                if (!lesson) {
                    console.error('Lesson is null or undefined');
                    return;
                }

                const isDraft = !lesson?.pubkey;
                if (isDraft) {
                    const unsignedEvent = await buildDraftEvent(lesson);
                    if (unsignedEvent) {
                        setProcessedLessons(prev => [...prev, {
                            d: lesson?.id,
                            kind: lesson?.price ? 30402 : 30023,
                            pubkey: unsignedEvent.pubkey,
                            index: lesson.index,
                            unpublished: unsignedEvent
                        }]);
                    }
                } else {
                    setProcessedLessons(prev => [...prev, {
                        d: lesson?.d,
                        kind: lesson?.price ? 30402 : 30023,
                        pubkey: lesson.pubkey,
                        index: lesson.index
                    }]);
                }
            });
        }
    }, [lessons, user, author, ndk]);

    useEffect(() => {
        console.log('processedLessons', processedLessons);
    }, [processedLessons]);

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
                        {processedEvent?.price && processedEvent?.price !== 0 ? (
                            <p className='text-lg mt-6'>Price: {processedEvent.price} sats</p>
                        ) : null}
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
                        <p className="pt-8 text-sm text-gray-400">{processedEvent?.createdAt && formatDateTime(processedEvent?.createdAt)}</p>
                    </div>
                    <div className='flex flex-col max-tab:mt-12 max-mob:mt-12'>
                        {processedEvent && (
                            <div className='flex flex-col items-center justify-between rounded-lg h-72 p-4 bg-gray-700 drop-shadow-md'>
                                <Image
                                    alt="course thumbnail"
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
                    <GenericButton onClick={handleSubmit} label="Publish" severity='success' outlined className="w-auto m-2" />
                    <GenericButton onClick={() => router.push(`/course/${draftId}/draft/edit`)} label="Edit" severity='warning' outlined className="w-auto m-2" />
                    <GenericButton onClick={handleDelete} label="Delete" severity='danger' outlined className="w-auto m-2 mr-0" />
                </div>
            </div>
            <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                {
                    processedEvent?.content && <MDDisplay className='p-4 rounded-lg' source={processedEvent.content} />
                }
            </div>
        </div>
    );
}
