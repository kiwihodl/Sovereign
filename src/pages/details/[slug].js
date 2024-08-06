import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { parseEvent, findKind0Fields, hexToNpub } from '@/utils/nostr';
import { useImageProxy } from '@/hooks/useImageProxy';
import { getSatAmountFromInvoice } from '@/utils/lightning';
import ZapDisplay from '@/components/zaps/ZapDisplay';
import { Tag } from 'primereact/tag';
import { nip19 } from 'nostr-tools';
import { useLocalStorageWithEffect } from '@/hooks/useLocalStorage';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';
import { useNDKContext } from '@/context/NDKContext';
import { useZapsSubscription } from '@/hooks/nostrQueries/zaps/useZapsSubscription';
import 'primeicons/primeicons.css';
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

export default function Details() {
    const [event, setEvent] = useState(null);
    const [processedEvent, setProcessedEvent] = useState({});
    const [author, setAuthor] = useState(null);
    const [bitcoinConnect, setBitcoinConnect] = useState(false);
    const [nAddress, setNAddress] = useState(null);
    const [zapAmount, setZapAmount] = useState(null);

    const ndk = useNDKContext();
    const [user] = useLocalStorageWithEffect('user', {});
    const { returnImageProxy } = useImageProxy();
    const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: processedEvent });

    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const bitcoinConnectConfig = window.localStorage.getItem('bc:config');

        if (bitcoinConnectConfig) {
            setBitcoinConnect(true);
        }
    }, []);

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;

            const fetchEvent = async (slug) => {
                try {
                    await ndk.connect();

                    const filter = {
                        ids: [slug]
                    }

                    const event = await ndk.fetchEvent(filter);

                    if (event) {
                        setEvent(event);
                    }
                } catch (error) {
                    console.error('Error fetching event:', error);
                }
            };
            if (ndk) {
                fetchEvent(slug);
            }
        }
    }, [router.isReady, router.query, ndk]);

    useEffect(() => {
        const fetchAuthor = async (pubkey) => {
            try {
                await ndk.connect();

                const filter = {
                    kinds: [0],
                    authors: [pubkey]
                }

                const author = await ndk.fetchEvent(filter);
                if (author) {
                    const fields = await findKind0Fields(JSON.parse(author.content));
                    setAuthor(fields);
                }
            } catch (error) {
                console.error('Error fetching author:', error);
            }
        }
        if (event && ndk) {
            fetchAuthor(event.pubkey);
        }
    }, [ndk, event]);

    useEffect(() => {
        if (event) {
            const parsedEvent = parseEvent(event);
            setProcessedEvent(parsedEvent);
        }
    }, [event]);

    useEffect(() => {
        if (processedEvent?.d) {
            const naddr = nip19.naddrEncode({
                pubkey: processedEvent.pubkey,
                kind: processedEvent.kind,
                identifier: processedEvent.d,
            });
            setNAddress(naddr);
        }
    }, [processedEvent]);

    useEffect(() => {
        if (!zaps) return;

        let total = 0;
        zaps.forEach((zap) => {
            const bolt11Tag = zap.tags.find(tag => tag[0] === "bolt11");
            const invoice = bolt11Tag ? bolt11Tag[1] : null;
            if (invoice) {
                const amount = getSatAmountFromInvoice(invoice);
                total += amount;
            }
        });

        setZapAmount(total);
    }, [zaps]);

    return (
        <div className='w-full px-24 pt-12 mx-auto mt-4 max-tab:px-0 max-mob:px-0 max-tab:pt-2 max-mob:pt-2'>
            <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
                <i className='pi pi-arrow-left pl-8 cursor-pointer hover:opacity-75 max-tab:pl-2 max-mob:pl-2' onClick={() => router.push('/')} />
                <div className='w-[75vw] mx-auto flex flex-row items-start justify-between max-tab:flex-col max-mob:flex-col max-tab:w-[95vw] max-mob:w-[95vw]'>
                    <div className='flex flex-col items-start max-w-[45vw] max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                        <div className='pt-2 flex flex-row justify-start w-full'>
                            {processedEvent && processedEvent.topics && processedEvent.topics.length > 0 && (
                                processedEvent.topics.map((topic, index) => (
                                    <Tag className='mr-2 text-white' key={index} value={topic}></Tag>
                                ))
                            )
                            }
                        </div>
                        <h1 className='text-4xl mt-6'>{processedEvent?.title}</h1>
                        <p className='text-xl mt-6'>{processedEvent?.summary}</p>
                        <div className='flex flex-row w-full mt-6 items-center'>
                            <Image
                                alt="avatar image"
                                src={returnImageProxy(author?.avatar, author?.pubkey)}
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
                    <div className='flex flex-col max-tab:mt-12 max-mob:mt-12'>
                        {processedEvent && (
                            <div className='flex flex-col items-center justify-between rounded-lg h-72 p-4 bg-gray-700 drop-shadow-md'>
                                <Image
                                    alt="resource thumbnail"
                                    src={returnImageProxy(processedEvent.image)}
                                    width={344}
                                    height={194}
                                    className="w-[344px] h-[194px] object-cover object-top rounded-lg"
                                />
                                {bitcoinConnect ? (
                                    <div>
                                        <BitcoinConnectPayButton onClick={handleZapEvent} />
                                    </div>
                                ) : (
                                    <div className="w-full flex justify-end">
                                        <ZapDisplay zapAmount={zapAmount} event={processedEvent} zapsLoading={zapsLoading} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {typeof window !== 'undefined' && nAddress !== null && (
                <div className='px-24'>
                    <ZapThreadsWrapper
                        anchor={nAddress}
                        user={user?.pubkey || null}
                        relays="wss://nos.lol/, wss://relay.damus.io/, wss://relay.snort.social/, wss://relay.nostr.band/, wss://nostr.mutinywallet.com/, wss://relay.mutinywallet.com/, wss://relay.primal.net/"
                        disable=""
                    />
                </div>
            )}
            <div className='w-[75vw] mx-auto mt-12 p-12 border-t-2 border-gray-300 max-tab:p-0 max-mob:p-0 max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                {
                    processedEvent?.content && <MDDisplay source={processedEvent.content} />
                }
            </div>
        </div>
    );
}