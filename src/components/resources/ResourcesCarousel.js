
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';
import { useSelector } from 'react-redux';
import { parseResourceEvent } from '@/utils/nostr';

export default function ResourcesCarousel() {
    const resources = useSelector((state) => state.events.resources);

    console.log('Resources:', resources);

    const resourceTemplate = (resource) => {
        const { content, title, summary, image, published_at } = parseResourceEvent(resource);
        return (
            <div className="flex flex-col items-center w-full px-4">
                <div className="w-86 h-60 bg-gray-200 overflow-hidden rounded-md shadow-lg">
                    <img src={image} alt={title} className="w-full h-full object-cover object-center" />
                </div>
                <div className='text-center'>
                    <h4 className="mb-1 font-bold text-center">{title}</h4>
                    <p className="text-center">{summary}</p>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <Button icon="pi pi-search" rounded />
                        <Button icon="pi pi-star-fill" rounded severity="success" />
                    </div>
                    <p className="text-center mt-2">Published on {published_at}</p>
                </div>
            </div>
        );
    };    

    return (
        <>
            <h1 className="text-2xl font-bold ml-[6%] my-4">Resources</h1>
            <Carousel value={resources} numVisible={3}  itemTemplate={resourceTemplate} />
        </>
    )
}
        