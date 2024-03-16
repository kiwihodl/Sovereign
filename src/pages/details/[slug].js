import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useNostr } from '@/hooks/useNostr';
import { parseEvent } from '@/utils/nostr';
import { useImageProxy } from '@/hooks/useImageProxy';
import Image from 'next/image';
import 'primeicons/primeicons.css';

export default function Details() {
    const [event, setEvent] = useState(null);
    const [processedEvent, setProcessedEvent] = useState({});

    const { returnImageProxy } = useImageProxy();
    const { fetchSingleEvent } = useNostr();

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
        if (event) {
            const { id, content, title, summary, image, published_at } = parseEvent(event);
            setProcessedEvent({ id, content, title, summary, image, published_at });
        }
    }, [event]);

    return (
        <div className='flex flex-row justify-between m-4'>
            <i className='pi pi-arrow-left cursor-pointer hover:opacity-75' onClick={() => router.push('/')} />
            <div className='flex flex-col'>
                {
                    processedEvent && (
                        <>
                            <Image
                                alt="resource thumbnail"
                                src={returnImageProxy(processedEvent.image)}
                                width={344}
                                height={194}
                                className="w-full h-full object-cover object-center rounded-lg"
                            />
                            <h2>{processedEvent.title}</h2>
                            <p>{processedEvent.summary}</p>
                        </>
                    )
                }
            </div>
        </div>
    );
}