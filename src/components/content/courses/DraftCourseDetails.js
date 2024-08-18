import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
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
import 'primeicons/primeicons.css';

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

function validateEvent(event) {
    if (typeof event.kind !== "number") return "Invalid kind";
    if (typeof event.content !== "string") return "Invalid content";
    if (typeof event.created_at !== "number") return "Invalid created_at";
    if (typeof event.pubkey !== "string") return "Invalid pubkey";
    if (!event.pubkey.match(/^[a-f0-9]{64}$/)) return "Invalid pubkey format";

    if (!Array.isArray(event.tags)) return "Invalid tags";
    for (let i = 0; i < event.tags.length; i++) {
        const tag = event.tags[i];
        if (!Array.isArray(tag)) return "Invalid tag structure";
        for (let j = 0; j < tag.length; j++) {
            if (typeof tag[j] === "object") return "Invalid tag value";
        }
    }

    return true;
}

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
            for (const lesson of processedLessons) {
                // publish any draft lessons and delete draft lessons
                const unpublished = lesson?.unpublished;
                if (unpublished && Object.keys(unpublished).length > 0) {
                    const validationResult = validateEvent(unpublished);
                    if (validationResult !== true) {
                        console.error('Invalid event:', validationResult);
                        showToast('error', 'Error', `Invalid event: ${validationResult}`);
                        return;
                    }

                    const published = await unpublished.publish();

                    const saved = await handlePostResource(unpublished);

                    console.log('saved', saved);

                    if (published && saved) {
                        axios.delete(`/api/drafts/${lesson?.d}`)
                            .then(res => {
                                if (res.status === 204) {
                                    showToast('success', 'Success', 'Draft deleted successfully.');
                                } else {
                                    showToast('error', 'Error', 'Failed to delete draft.');
                                }
                            })
                            .catch(err => {
                                console.error(err);
                            });
                    }
                }
            }

            // Step 2: Create and publish course
            const courseEvent = createCourseEvent(newCourseId, processedEvent.title, processedEvent.summary, processedEvent.image, processedLessons, processedEvent.price);
            const published = await courseEvent.publish();

            console.log('published', published);

            if (!published) {
                throw new Error('Failed to publish course');
            }

            // Step 3: Save course to db
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
            showToast('success', 'Success', 'Course created successfully');
            router.push(`/course/${courseEvent.id}`);

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
            ...lessons.map((lesson) => ['a', `${lesson.kind}:${lesson.pubkey}:${lesson.d}`]),
        ];
        return event;
    };

    useEffect(() => {
        async function buildEvent(draft) {
            const event = new NDKEvent(ndk);
            let type;
            let encryptedContent;

            console.log('Draft:', draft);

            switch (draft?.type) {
                case 'resource':
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
                    ];

                    type = 'resource';
                    break;
                case 'workshop':
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
                    ];

                    type = 'workshop';
                    break;
                default:
                    return null;
            }

            return { unsignedEvent: event, type };
        }

        async function buildDraftEvent(lesson) {
            const { unsignedEvent, type } = await buildEvent(lesson);
            return unsignedEvent
        }

        if (!hasRunEffect.current && lessons.length > 0 && user && author) {
            hasRunEffect.current = true;
            
            lessons.forEach(async (lesson) => {
                const isDraft = !lesson?.pubkey;
                if (isDraft) {
                    const unsignedEvent = await buildDraftEvent(lesson);
                    setProcessedLessons(prev => [...prev, {
                        d: lesson?.id,
                        kind: lesson?.price ? 30402 : 30023,
                        pubkey: unsignedEvent.pubkey,
                        unpublished: unsignedEvent
                    }]);
                } else {
                    setProcessedLessons(prev => [...prev, {
                        d: lesson?.d,
                        kind: lesson?.price ? 30402 : 30023,
                        pubkey: lesson.pubkey
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
                    <Button onClick={() => router.push(`/course/${draftId}/draft/edit`)} label="Edit" severity='warning' outlined className="w-auto m-2" />
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
