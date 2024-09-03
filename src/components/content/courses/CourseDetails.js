import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useImageProxy } from '@/hooks/useImageProxy';
import ZapDisplay from '@/components/zaps/ZapDisplay';
import { getTotalFromZaps } from '@/utils/lightning';
import { Tag } from 'primereact/tag';
import { nip19, nip04 } from 'nostr-tools';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ZapThreadsWrapper from '@/components/ZapThreadsWrapper';
import { useNDKContext } from "@/context/NDKContext";
import { useZapsSubscription } from '@/hooks/nostrQueries/zaps/useZapsSubscription';
import { findKind0Fields } from '@/utils/nostr';
import 'primeicons/primeicons.css';
import CoursePaymentButton from "@/components/bitcoinConnect/CoursePaymentButton";
import { ProgressSpinner } from 'primereact/progressspinner';

const MDDisplay = dynamic(
    () => import("@uiw/react-markdown-preview"),
    {
        ssr: false,
    }
);

export default function CourseDetails({ processedEvent, paidCourse, lessons, decryptionPerformed, handlePaymentSuccess, handlePaymentError }) {
    const [author, setAuthor] = useState(null);
    const [nAddress, setNAddress] = useState(null);    
    const [zapAmount, setZapAmount] = useState(0);
    const [user, setUser] = useState(null);
    const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: processedEvent });
    const { returnImageProxy } = useImageProxy();
    const { data: session, status } = useSession();
    const router = useRouter();
    const {ndk, addSigner} = useNDKContext();

    const lnAddress = process.env.NEXT_PUBLIC_LN_ADDRESS;

    useEffect(() => {
        console.log("processedEvent", processedEvent);
    }, [processedEvent]);

    useEffect(() => {
        console.log("lessons", lessons);
    }, [lessons]);

    useEffect(() => {
        console.log("zaps", zaps);
    }, [zaps]);

    useEffect(() => {
        console.log("paidCourse", paidCourse);
    }, [paidCourse]);

    useEffect(() => {
        console.log("decryptionPerformed", decryptionPerformed);
    }, [decryptionPerformed]);

    useEffect(() => {
        if (session) {
            setUser(session.user);
        }
    }, [session]);

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
            fetchAuthor(processedEvent.pubkey);
        }
    }, [fetchAuthor, processedEvent]);

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
        if (zaps.length > 0) {
            const total = getTotalFromZaps(zaps, processedEvent);
            setZapAmount(total);
        }
    }, [zaps, processedEvent]);

    if (!processedEvent || !author) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className='w-full px-24 pt-12 mx-auto mt-4 max-tab:px-0 max-mob:px-0 max-tab:pt-2 max-mob:pt-2'>
            <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
            <i className='pi pi-arrow-left pr-8 cursor-pointer hover:opacity-75' onClick={() => router.push('/')} />
                <div className='w-[75vw] mx-auto flex flex-row items-start justify-between max-tab:flex-col max-mob:flex-col max-tab:w-[95vw] max-mob:w-[95vw]'>
                    <div className='flex flex-col items-start max-w-[45vw] max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                        <div className='pt-2 flex flex-row justify-start w-full'>
                            {processedEvent && processedEvent.topics && processedEvent.topics.length > 0 && (
                                processedEvent.topics.map((topic, index) => (
                                    <Tag className='mr-2 text-white' key={index} value={topic}></Tag>
                                ))
                            )}
                        </div>
                        <h1 className='text-4xl mt-6'>{processedEvent?.name}</h1>
                        <p className='text-xl mt-6'>{processedEvent?.description}</p>
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
                                    alt="course thumbnail"
                                    src={returnImageProxy(processedEvent.image)}
                                    width={344}
                                    height={194}
                                    className="w-[344px] h-[194px] object-cover object-top rounded-lg"
                                />
                                <div className='w-full flex justify-between items-center'>
                                    {paidCourse && !decryptionPerformed && (
                                        <CoursePaymentButton
                                            lnAddress={lnAddress}
                                            amount={processedEvent.price}
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                            resourceId={processedEvent.d}
                                        />
                                    )}
                                    {paidCourse && decryptionPerformed && author && processedEvent?.pubkey !== session?.user?.pubkey && (
                                        <p className='text-green-500'>Paid {processedEvent.price} sats</p>
                                    )}
                                    {paidCourse && author && processedEvent?.pubkey === session?.user?.pubkey && (
                                        <p className='text-green-500'>Price {processedEvent.price} sats</p>
                                    )}
                                    <ZapDisplay 
                                        zapAmount={zapAmount} 
                                        event={processedEvent} 
                                        zapsLoading={zapsLoading && zapAmount === 0} 
                                    />
                                </div>
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
                    processedEvent?.content && <MDDisplay className='p-4 rounded-lg' source={processedEvent.content} />
                }
            </div>
        </div>
    );
}