import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useImageProxy } from '@/hooks/useImageProxy';
import { parseEvent } from '@/utils/nostr';
import { formatTimestampToHowLongAgo } from '@/utils/time';

export default function WorkshopsCarousel() {
    const workshops = useSelector((state) => state.events.resources);
    const [processedWorkshops, setProcessedWorkshops] = useState([]);
    const { returnImageProxy } = useImageProxy();

    const router = useRouter();

    useEffect(() => {
        const processWorkshops = workshops.map(workshop => {
            const { id, content, title, summary, image, published_at } = parseEvent(workshop);
            return { id, content, title, summary, image, published_at };
        });
        setProcessedWorkshops(processWorkshops);
    }, [workshops]);

    const workshopTemplate = (workshop) => {
        return (
            <div onClick={() => router.push(`/details/${workshop.id}`)} className="flex flex-col items-center w-full mx-auto px-4 cursor-pointer mt-8">
                <div className="w-86 h-60 bg-gray-200 overflow-hidden rounded-md shadow-lg">
                    <Image
                        alt="resource thumbnail"
                        src={returnImageProxy(workshop.image)}
                        width={344}
                        height={194}
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                <div className='flex flex-col justify-start max-w-[426px]'>
                    <h4 className="mb-1 font-bold text-xl">{workshop.title}</h4>
                    <p className='truncate'>{workshop.summary}</p>
                    <p className="text-sm mt-1 text-gray-400">Published: {formatTimestampToHowLongAgo(workshop.published_at)}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            <h1 className="text-2xl ml-[6%] mt-4">workshops</h1>
            <Carousel value={processedWorkshops} numVisible={2} itemTemplate={workshopTemplate} />
        </>
    );
}
