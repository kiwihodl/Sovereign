import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import { formatTimestampToHowLongAgo } from '@/utils/time';

export default function WorkshopsCarousel() {
    const resources = useSelector((state) => state.events.resources);
    const [processedResources, setProcessedResources] = useState([]);
    const { returnImageProxy } = useImageProxy();

    const router = useRouter();

    useEffect(() => {
        const processResources = resources.map(resource => {
            const { id, content, title, summary, image, published_at } = parseEvent(resource);
            return { id, content, title, summary, image, published_at };
        });
        setProcessedResources(processResources);
    }, [resources]);

    const resourceTemplate = (resource) => {
        return (
            <div onClick={() => router.push(`/resource/${resource.id}`)} className="flex flex-col items-center w-full px-4 cursor-pointer mt-8">
                <div className="w-86 h-60 bg-gray-200 overflow-hidden rounded-md shadow-lg">
                    <Image
                        alt="resource thumbnail"
                        src={returnImageProxy(resource.image)}
                        width={344}
                        height={194}
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                <div className='flex flex-col justify-start w-[426px]'>
                    <h4 className="mb-1 font-bold text-xl">{resource.title}</h4>
                    <p className='truncate'>{resource.summary}</p>
                    <p className="text-sm mt-1 text-gray-400">Published: {formatTimestampToHowLongAgo(resource.published_at)}</p>
                    {/* <div className="flex flex-row items-center justify-center gap-2">
                        <Button icon="pi pi-search" rounded />
                        <Button icon="pi pi-star-fill" rounded severity="success" />
                    </div> */}
                </div>
            </div>
        );
    };

    return (
        <>
            <h1 className="text-2xl ml-[6%] mt-4">workshops</h1>
            <Carousel value={processedResources} numVisible={3} itemTemplate={resourceTemplate} />
        </>
    );
}
