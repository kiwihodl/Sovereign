import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useNostr } from '@/hooks/useNostr';
import { parseEvent, findKind0Fields, hexToNpub } from '@/utils/nostr';
import { verifyEvent, nip19 } from 'nostr-tools';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorageWithEffect } from '@/hooks/useLocalStorage';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Button } from 'primereact/button';
import { useToast } from '@/hooks/useToast';
import { Tag } from 'primereact/tag';
import Image from 'next/image';
import useResponsiveImageDimensions from '@/hooks/useResponsiveImageDimensions';
import 'primeicons/primeicons.css';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const MarkdownContent = ({ content }) => {
    return (
        <div>
            <ReactMarkdown rehypePlugins={[rehypeRaw]} className='markdown-content'>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default function Details() {
    const [draft, setDraft] = useState(null);

    const { returnImageProxy } = useImageProxy();
    const { fetchSingleEvent, fetchKind0 } = useNostr();

    const [user] = useLocalStorageWithEffect('user', {});

    const { width, height } = useResponsiveImageDimensions();

    const router = useRouter();

    const { showToast } = useToast();

    const { publishAll } = useNostr();

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            axios.get(`/api/drafts/${slug}`)
                .then(res => {
                    console.log('res:', res.data);
                    setDraft(res.data);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [router.isReady, router.query]);

    const handleSubmit = async () => {
        if (draft) {
            const { unsignedEvent, type } = buildEvent(draft);

            if (unsignedEvent) {
                await publishEvent(unsignedEvent, type);
            }
        } else {
            showToast('error', 'Error', 'Failed to broadcast resource. Please try again.');
        }
    }

    const publishEvent = async (event, type) => {
        const dTag = event.tags.find(tag => tag[0] === 'd')[1];

        const signedEvent = await window.nostr.signEvent(event);

        const eventVerification = await verifyEvent(signedEvent);

        if (!eventVerification) {
            showToast('error', 'Error', 'Event verification failed. Please try again.');
            return;
        }

        const nAddress = nip19.naddrEncode({
            pubkey: signedEvent.pubkey,
            kind: signedEvent.kind,
            identifier: dTag,
        })

        console.log('nAddress:', nAddress);

        const userResponse = await axios.get(`/api/users/${user.pubkey}`)

        if (!userResponse.data) {
            showToast('error', 'Error', 'User not found', 'Please try again.');
            return;
        }

        const payload = {
            id: dTag,
            userId: userResponse.data.id,
            price: draft.price || 0,
            noteId: nAddress,
        }
        const response = await axios.post(`/api/resources`, payload);

        if (response.status !== 201) {
            showToast('error', 'Error', 'Failed to create resource. Please try again.');
            return;
        }

        await publishAll(signedEvent);
    }

    const buildEvent = (draft) => {
        const NewDTag = uuidv4();
        let event = {};
        let type;

        switch (draft?.type) {
            case 'resource':
                event = {
                    kind: draft?.price ? 30402 : 30023, // Determine kind based on if price is present
                    content: draft.content,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [
                        ['d', NewDTag],
                        ['title', draft.title],
                        ['summary', draft.summary],
                        ['image', draft.image],
                        ['t', ...draft.topics],
                        ['published_at', Math.floor(Date.now() / 1000).toString()],
                        // Include price and location tags only if price is present
                        ...(draft?.price ? [['price', draft.price], ['location', `https://plebdevs.com/resource/${draft.id}`]] : []),
                    ]
                };
                type = 'resource';
                break;
            case 'workshop':
                event = {
                    kind: 30023,
                    content: draft.content,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [
                        ['d', NewDTag],
                        ['title', draft.title],
                        ['summary', draft.summary],
                        ['image', draft.image],
                        ['t', ...draft.topics],
                        ['published_at', Math.floor(Date.now() / 1000).toString()],
                    ]
                };
                type = 'workshop';
                break;
            case 'course':
                event = {
                    kind: 30023,
                    content: draft.content,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [
                        ['d', NewDTag],
                        ['title', draft.title],
                        ['summary', draft.summary],
                        ['image', draft.image],
                        ['t', ...draft.topics],
                        ['published_at', Math.floor(Date.now() / 1000).toString()],
                    ]
                };
                type = 'course';
                break;
            default:
                event = null;
                type = 'unknown';
        }

        return { unsignedEvent: event, type };
    };

    return (
        <div className='w-full px-24 pt-12 mx-auto mt-4 max-tab:px-0 max-mob:px-0 max-tab:pt-2 max-mob:pt-2'>
            <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
                {/* <i className='pi pi-arrow-left pl-8 cursor-pointer hover:opacity-75 max-tab:pl-2 max-mob:pl-2' onClick={() => router.push('/')} /> */}
                <div className='w-[75vw] mx-auto flex flex-row items-start justify-between max-tab:flex-col max-mob:flex-col max-tab:w-[95vw] max-mob:w-[95vw]'>
                    <div className='flex flex-col items-start max-w-[45vw] max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                        <div className='pt-2 flex flex-row justify-start w-full'>
                            {/* List out topics */}
                            {draft?.topics && draft.topics.map((topic, index) => {
                                if (topic === "plebdevs") return;
                                return (
                                    <Tag className='mr-2 text-white' key={index} value={topic}></Tag>
                                )
                            })
                            }
                        </div>
                        <h1 className='text-4xl mt-6'>{draft?.title}</h1>
                        <p className='text-xl mt-6'>{draft?.summary}</p>
                        <div className='flex flex-row w-full mt-6 items-center'>
                            <Image
                                alt="resource thumbnail"
                                src={user?.avatar ? returnImageProxy(user.avatar) : `https://secure.gravatar.com/avatar/${user.pubkey}?s=90&d=identicon`}
                                width={50}
                                height={50}
                                className="rounded-full mr-4"
                            />
                            <p className='text-lg'>
                                Created by{' '}
                                <a rel='noreferrer noopener' target='_blank' className='text-blue-500 hover:underline'>
                                    {user?.username}
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-col max-tab:mt-12 max-mob:mt-12'>
                        {draft && (
                            <div style={{ width: width < 768 ? "auto" : width }} onClick={() => router.push(`/details/${draft.id}`)} className="flex flex-col items-center mx-auto cursor-pointer rounded-md shadow-lg">
                                <div style={{ maxWidth: width, minWidth: width }} className="max-tab:h-auto max-mob:h-auto">
                                    <Image
                                        alt="resource thumbnail"
                                        src={returnImageProxy(draft.image)}
                                        quality={100}
                                        width={width}
                                        height={height}
                                        className="w-full h-full object-cover object-center rounded-md"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className='w-[75vw] mx-auto flex flex-row justify-end mt-12'>
                <Button onClick={handleSubmit} label="Publish" severity='success' outlined className="w-auto my-2" />
            </div>
            <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                {
                    draft?.content && <MarkdownContent content={draft.content} />
                }
            </div>
        </div>
    );
}