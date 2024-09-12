import React, { useEffect, useState } from "react";
import { Tag } from "primereact/tag";
import Image from "next/image";
import { useRouter } from "next/router";
import ResourcePaymentButton from "@/components/bitcoinConnect/ResourcePaymentButton";
import ZapDisplay from "@/components/zaps/ZapDisplay";
import GenericButton from "@/components/buttons/GenericButton";
import { useImageProxy } from "@/hooks/useImageProxy";
import { useZapsSubscription } from "@/hooks/nostrQueries/zaps/useZapsSubscription";
import { getTotalFromZaps } from "@/utils/lightning";
import { useSession } from "next-auth/react";

const lnAddress = process.env.NEXT_PUBLIC_LIGHTNING_ADDRESS;

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

    const renderPaymentMessage = () => {
        if (session?.user && session.user?.role?.subscribed && decryptedContent) {
            return <GenericButton tooltipOptions={{position: 'top'}} tooltip={`You are subscribed so you can access all paid content`} icon="pi pi-check" label="Subscribed" severity="success" outlined size="small" className="cursor-default hover:opacity-100 hover:bg-transparent focus:ring-0" />
        }
        
        if (paidResource && decryptedContent && author && processedEvent?.pubkey !== session?.user?.pubkey && !session?.user?.role?.subscribed) {
            return <GenericButton tooltipOptions={{position: 'top'}} tooltip={`Pay ${processedEvent.price} sats to access this content or subscribe to get access to all content`} icon="pi pi-check" label={`Paid ${processedEvent.price} sats`} severity="success" outlined size="small" className="cursor-default hover:opacity-100 hover:bg-transparent focus:ring-0" />
        }
        
        if (paidResource && author && processedEvent?.pubkey === session?.user?.pubkey) {
            return <GenericButton tooltipOptions={{position: 'top'}} tooltip={`You created this paid content, users must pay ${processedEvent.price} sats to access it`} icon="pi pi-check" label={`Price ${processedEvent.price} sats`} severity="success" outlined size="small" className="cursor-default hover:opacity-100 hover:bg-transparent focus:ring-0" />
        }
        
        return null;
    };

    return (
        <div className='w-full flex flex-row justify-between max-tab:flex-col max-mob:flex-col'>
            <i className='pi pi-arrow-left pr-8 cursor-pointer hover:opacity-75 max-tab:pl-2 max-tab:my-4' onClick={() => router.push('/')} />
            <div className='w-[75vw] mx-auto flex flex-row items-start justify-between max-tab:flex-col max-mob:flex-col max-tab:w-[100vw] max-mob:w-[100vw] max-tab:px-2 max-mob:px-2'>
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
                        <div className='flex flex-col items-center justify-between rounded-lg h-72 p-4 bg-gray-700 drop-shadow-md max-tab:w-full max-tab:mx-auto max-tab:h-auto'>
                            <Image
                                alt="resource thumbnail"
                                src={returnImageProxy(image)}
                                width={344}
                                height={194}
                                className="w-[344px] h-[194px] object-cover object-top rounded-lg max-tab:w-full max-tab:h-auto"
                            />
                            <div className='w-full flex flex-row justify-between'>
                                {paidResource && !decryptedContent && <ResourcePaymentButton
                                    lnAddress={lnAddress}
                                    amount={price}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                    resourceId={processedEvent.d}
                                />}

                                {renderPaymentMessage()}

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