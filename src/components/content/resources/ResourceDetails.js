import React, { useEffect, useState } from "react";
import { Tag } from "primereact/tag";
import Image from "next/image";
import { useRouter } from "next/router";
import ResourcePaymentButton from "@/components/bitcoinConnect/ResourcePaymentButton";
import ZapDisplay from "@/components/zaps/ZapDisplay";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useZapsSubscription } from "@/hooks/nostrQueries/zaps/useZapsSubscription";
import { getTotalFromZaps } from "@/utils/lightning";
import { useSession } from "next-auth/react";

const lnAddress = process.env.NEXT_PUBLIC_LN_ADDRESS;

const ResourceDetails = ({processedEvent, topics, title, summary, image, price, author, paidResource, decryptedContent, handlePaymentSuccess, handlePaymentError}) => {
    const [zapAmount, setZapAmount] = useState(0);

    const router = useRouter();
    const { returnImageProxy } = useImageProxy();
    const { zaps, zapsLoading, zapsError } = useZapsSubscription({ event: processedEvent });
    const { data: session, status } = useSession();

    useEffect(() => {
        if (zaps.length > 0) {
            const total = getTotalFromZaps(zaps, processedEvent);
            setZapAmount(total);
        }
    }, [zaps, processedEvent]);

    return (
        <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
            <i className='pi pi-arrow-left pr-8 cursor-pointer hover:opacity-75' onClick={() => router.push('/')} />
            <div className='w-[75vw] mx-auto flex flex-row items-start justify-between max-tab:flex-col max-mob:flex-col max-tab:w-[95vw] max-mob:w-[95vw]'>
                <div className='flex flex-col items-start max-w-[45vw] max-tab:max-w-[100vw] max-mob:max-w-[100vw]'>
                    <div className='pt-2 flex flex-row justify-start w-full'>
                        {topics && topics.length > 0 && (
                            topics.map((topic, index) => (
                                <Tag className='mr-2 text-white' key={index} value={topic}></Tag>
                            ))
                        )
                        }
                    </div>
                    <h1 className='text-4xl mt-6'>{title}</h1>
                    <p className='text-xl mt-6'>{summary}</p>
                    <div className='flex flex-row w-full mt-6 items-center'>
                        <Image
                            alt="avatar image"
                            src={returnImageProxy(author?.avatar, author?.username)}
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
                    {image && (
                        <div className='flex flex-col items-center justify-between rounded-lg h-72 p-4 bg-gray-700 drop-shadow-md'>
                            <Image
                                alt="resource thumbnail"
                                src={returnImageProxy(image)}
                                width={344}
                                height={194}
                                className="w-[344px] h-[194px] object-cover object-top rounded-lg"
                            />
                            <div className='w-full flex flex-row justify-between'>
                                {paidResource && !decryptedContent && <ResourcePaymentButton
                                    lnAddress={lnAddress}
                                    amount={price}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                    resourceId={processedEvent.d}
                                />}

                                {/* if the resource has been paid for show a green paid x sats text */}
                                {paidResource && decryptedContent && author && !processedEvent?.pubkey === session?.user?.pubkey && <p className='text-green-500'>Paid {processedEvent.price} sats</p>}

                                {/* if this is the author of the resource show a zap button */}
                                {paidResource && author && processedEvent?.pubkey === session?.user?.pubkey && <p className='text-green-500'>Price {processedEvent.price} sats</p>}

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
    )
}

export default ResourceDetails;