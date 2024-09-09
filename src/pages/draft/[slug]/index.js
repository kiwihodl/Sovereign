import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { hexToNpub } from '@/utils/nostr';
import { nip19, nip04 } from 'nostr-tools';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Button } from 'primereact/button';
import { useToast } from '@/hooks/useToast';
import { Tag } from 'primereact/tag';
import { useNDKContext } from '@/context/NDKContext';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { formatDateTime } from '@/utils/time';
import Image from 'next/image';
import useResponsiveImageDimensions from '@/hooks/useResponsiveImageDimensions';
import 'primeicons/primeicons.css';
import dynamic from 'next/dynamic';
import { validateEvent } from '@/utils/nostr';

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

export default function Draft() {
    const [draft, setDraft] = useState(null);
    const { returnImageProxy } = useImageProxy();
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const { width, height } = useResponsiveImageDimensions();
    const router = useRouter();
    const { showToast } = useToast();
    const { ndk, addSigner } = useNDKContext();

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

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
        try {
            if (!ndk.signer) {
                await addSigner();
            }

            if (draft) {
                const { unsignedEvent, type } = await buildEvent(draft);

                const validationResult = validateEvent(unsignedEvent);
                if (validationResult !== true) {
                    console.error('Invalid event:', validationResult);
                    showToast('error', 'Error', `Invalid event: ${validationResult}`);
                    return;
                }

                console.log('unsignedEvent:', unsignedEvent.validate(), unsignedEvent);
                console.log('unsignedEvent validation:', validationResult);

                if (unsignedEvent) {
                    const published = await unsignedEvent.publish();

                    const saved = await handlePostResource(unsignedEvent);
                    // if successful, delete the draft, redirect to profile
                    if (published && saved) {
                        axios.delete(`/api/drafts/${draft.id}`)
                            .then(res => {
                                if (res.status === 204) {
                                    showToast('success', 'Success', 'Draft deleted successfully.');
                                    router.push(`/profile`);
                                } else {
                                    showToast('error', 'Error', 'Failed to delete draft.');
                                }
                            })
                            .catch(err => {
                                console.error(err);
                            });
                    }
                } else {
                    showToast('error', 'Error', 'Failed to broadcast resource. Please try again.');
                }
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to publish resource.', err.message);
        }
    };

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
            noteId: nAddress,
        };

        const response = await axios.post(`/api/resources`, payload);

        if (response.status !== 201) {
            showToast('error', 'Error', 'Failed to create resource. Please try again.');
            return;
        }

        return response.data;
    };

    const handleDelete = async () => {
        if (draft) {
            await axios.delete(`/api/drafts/${draft.id}`)
                .then(res => {
                    if (res.status === 204) {
                        showToast('success', 'Success', 'Draft deleted successfully.');
                        router.push(`/profile`);
                    } else {
                        showToast('error', 'Error', 'Failed to delete draft.');
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        }
    };

    const buildEvent = async (draft) => {
        const NewDTag = uuidv4();
        const event = new NDKEvent(ndk);
        let type;
        let encryptedContent;

        console.log('Draft:', draft);
        console.log('NewDTag:', NewDTag);

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
                    ['d', NewDTag],
                    ['title', draft.title],
                    ['summary', draft.summary],
                    ['image', draft.image],
                    ...draft.topics.map(topic => ['t', topic]),
                    ['published_at', Math.floor(Date.now() / 1000).toString()],
                    ...(draft?.price ? [['price', draft.price.toString()], ['location', `https://plebdevs.com/details/${draft.id}`]] : []),
                    ...(draft?.additionalLinks ? draft.additionalLinks.map(link => ['r', link]) : []),
                ];

                type = 'resource';
                break;
            case 'workshop':
                if (draft?.price) {
                    // encrypt the content with NEXT_PUBLIC_APP_PRIV_KEY to NEXT_PUBLIC_APP_PUBLIC_KEY
                    encryptedContent = await nip04.encrypt(process.env.NEXT_PUBLIC_APP_PRIV_KEY, process.env.NEXT_PUBLIC_APP_PUBLIC_KEY, draft.content);
                }

                if (draft?.content.includes('.mp4') || draft?.content.includes('.mov') || draft?.content.includes('.avi') || draft?.content.includes('.wmv') || draft?.content.includes('.flv') || draft?.content.includes('.webm')) {
                    // todo update this for dev and prod
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
                    const videoEmbed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;"><video src="${baseUrl}/api/get-video-url?videoKey=${encodeURIComponent(draft.content)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" controls></video></div>`;
                    if (draft?.price) {
                        const encryptedVideoUrl = await nip04.encrypt(process.env.NEXT_PUBLIC_APP_PRIV_KEY, process.env.NEXT_PUBLIC_APP_PUBLIC_KEY, videoEmbed);
                        draft.content = encryptedVideoUrl;
                    } else {
                        draft.content = videoEmbed;
                    }
                }

                event.kind = draft?.price ? 30402 : 30023;
                event.content = draft?.price ? encryptedContent : draft.content;
                event.created_at = Math.floor(Date.now() / 1000);
                event.pubkey = user.pubkey;
                event.tags = [
                    ['d', NewDTag],
                    ['title', draft.title],
                    ['summary', draft.summary],
                    ['image', draft.image],
                    ...draft.topics.map(topic => ['t', topic]),
                    ['published_at', Math.floor(Date.now() / 1000).toString()],
                    ...(draft?.price ? [['price', draft.price.toString()], ['location', `https://plebdevs.com/details/${draft.id}`]] : []),
                    ...(draft?.additionalLinks ? draft.additionalLinks.map(link => ['r', link]) : []),
                ];

                type = 'workshop';
                break;
            default:
                return null;
        }

        return { unsignedEvent: event, type };
    };

    return (
        <div className='w-full px-12 pt-12 mx-auto mt-4'>
            <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
                <i className='pi pi-arrow-left pr-8 cursor-pointer hover:opacity-75' onClick={() => router.push('/')} />
                <div className='w-[75vw] mx-auto flex flex-row items-start justify-between'>
                    <div className='flex flex-col items-start max-w-[45vw] max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                        <div className='pt-2 flex flex-row justify-start w-full'>
                            {draft?.topics && draft.topics.map((topic, index) => {
                                if (topic === "") return;
                                return (
                                    <Tag className='mr-2 text-white' key={index} value={topic}></Tag>
                                )
                            })}
                        </div>
                        <h1 className='text-4xl mt-6'>{draft?.title}</h1>
                        <p className='text-xl mt-6'>{draft?.summary}</p>
                        {draft?.additionalLinks && draft.additionalLinks.length > 0 && (
                            <div className='mt-6'>
                                <h3 className='text-lg font-semibold mb-2'>External links:</h3>
                                <ul className='list-disc list-inside'>
                                    {draft.additionalLinks.map((link, index) => (
                                        <li key={index}>
                                            <a href={link} target="_blank" rel="noopener noreferrer" className='text-blue-500 hover:underline'>
                                                {new URL(link).hostname}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className='flex flex-row w-full mt-6 items-center'>
                            <Image
                                alt="resource thumbnail"
                                src={returnImageProxy(draft?.user?.avatar, draft?.user?.pubkey)}
                                width={50}
                                height={50}
                                className="rounded-full mr-4"
                            />
                            {user && user?.pubkey && (
                                <p className='text-lg'>
                                    Created by{' '}
                                    <a href={`https://nostr.com/${hexToNpub(user?.pubkey)}`} rel='noreferrer noopener' target='_blank' className='text-blue-500 hover:underline'>
                                        {user?.username || user?.name || user?.pubkey.slice(0, 10)}{'... '}
                                    </a>
                                </p>
                            )}
                        </div>
                    <p className="pt-8 text-sm text-gray-400">{draft?.createdAt && formatDateTime(draft?.createdAt)}</p>
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
                <div className='w-fit flex flex-row justify-between'>
                    <Button onClick={handleSubmit} label="Publish" severity='success' outlined className="w-auto m-2" />
                    <Button onClick={() => router.push(`/draft/${draft?.id}/edit`)} label="Edit" severity='warning' outlined className="w-auto m-2" />
                    <Button onClick={handleDelete} label="Delete" severity='danger' outlined className="w-auto m-2 mr-0" />
                </div>
            </div>
            <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                {
                    (
                        draft?.content && <MDDisplay className='p-4 rounded-lg' source={draft.content} />
                    )
                }
            </div>
        </div>
    );
}