import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useNostr } from '@/hooks/useNostr';
import { parseEvent, findKind0Fields, hexToNpub } from '@/utils/nostr';
import { useImageProxy } from '@/hooks/useImageProxy';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import Image from 'next/image';
import 'primeicons/primeicons.css';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const MarkdownContent = ({ content }) => {
    console.log('content:', content);
    return (
        <div>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default function Details() {
    const [event, setEvent] = useState(null);
    const [processedEvent, setProcessedEvent] = useState({});
    const [author, setAuthor] = useState(null);

    const { returnImageProxy } = useImageProxy();
    const { fetchSingleEvent, fetchKind0 } = useNostr();

    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            const fetchEvent = async (slug) => {
                const event = await fetchSingleEvent(slug);
                if (event) {
                    setEvent(event);
                }
            };

            fetchEvent(slug);
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        const fetchAuthor = async (pubkey) => {
            const author = await fetchKind0([{ authors: [pubkey], kinds: [0] }], {});
            const fields = await findKind0Fields(author);
            console.log('fields:', fields);
            if (fields) {
                setAuthor(fields);
            }
        }
        if (event) {
            fetchAuthor(event.pubkey);
        }
    }, [event]);

    useEffect(() => {
        if (event) {
            const { id, pubkey, content, title, summary, image, published_at } = parseEvent(event);
            setProcessedEvent({ id, pubkey, content, title, summary, image, published_at });
        }
    }, [event]);

    return (
        <div className='w-full px-24 pt-12 mx-auto mt-4'>
            <div className='w-full flex flex-row justify-between'>
                <i className='pi pi-arrow-left pl-8 cursor-pointer hover:opacity-75' onClick={() => router.push('/')} />
                <div className='w-[75vw] mx-auto flex flex-row items-start justify-between'>
                    <div className='flex flex-col items-start max-w-[45vw]'>
                        <div className='pt-2 flex flex-row justify-start w-full'>
                            <Tag className='mr-2' value="Primary"></Tag>
                            <Tag className='mr-2' severity="success" value="Success"></Tag>
                            <Tag className='mr-2' severity="info" value="Info"></Tag>
                            <Tag className='mr-2' severity="warning" value="Warning"></Tag>
                            <Tag className='mr-2' severity="danger" value="Danger"></Tag>
                        </div>
                        <h1 className='text-4xl mt-6'>{processedEvent?.title}</h1>
                        <p className='text-xl mt-6'>{processedEvent?.summary}</p>
                        <div className='flex flex-row w-full mt-6 items-center'>
                            <Image
                                alt="resource thumbnail"
                                src={returnImageProxy(author?.avatar)}
                                width={50}
                                height={50}
                                className="rounded-full mr-4"
                            />
                            <p className='text-lg'>
                                Created by{' '}
                                <a rel='noreferrer noopener' target='_blank' className='text-blue-500 hover:underline'>
                                    {author?.username}
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        {processedEvent && (
                            <div className='flex flex-col items-center justify-between rounded-lg h-72 p-4 bg-gray-700 drop-shadow-md'>
                                <Image
                                    alt="resource thumbnail"
                                    src={returnImageProxy(processedEvent.image)}
                                    width={344}
                                    height={194}
                                    className="object-cover object-center rounded-lg"
                                />
                                <Button
                                    icon="pi pi-bolt"
                                    label="100 sats"
                                    severity="success"
                                    outlined
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
                </div>
            </div>
            <div className='w-[75vw] mx-auto mt-32 p-12 border-t-2 border-gray-300'>
            {
                    processedEvent?.content && <MarkdownContent content={processedEvent.content} />
                }
            </div>
        </div>
    );
}