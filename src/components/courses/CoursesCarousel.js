
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';

export default function BasicDemo() {
    const [courses, setCourses] = useState([
        {
            "title": "Lightning Wallet Frontend",
            "description": "Write your first code and learn Frontend from scratch to build a simple lightning wallet using HTML/CSS, Javascript, and React",
            "thumbnail": 'https://emeralize.s3.amazonaws.com/course/cover_images/plebdev2_750__422_px_1200__630_px.jpg',
            "price": 45000
        },
        {
            "title": "Lightning Wallet Backend",
            "description": "Learn Backend from scratch and build a simple Lightning Wallet backend with a server, API, Database, and Lightning node using NodeJS",
            "thumbnail": 'https://emeralize.s3.amazonaws.com/course/cover_images/plebdevs-thumbnail.png',
            "price": 70000
        },
        {
            "title": "Lightning Wallet Frontend",
            "description": "Write your first code and learn Frontend from scratch to build a simple lightning wallet using HTML/CSS, Javascript, and React",
            "thumbnail": 'https://emeralize.s3.amazonaws.com/course/cover_images/plebdev2_750__422_px_1200__630_px.jpg',
            "price": 45000
        },
        {
            "title": "Lightning Wallet Backend",
            "description": "Learn Backend from scratch and build a simple Lightning Wallet backend with a server, API, Database, and Lightning node using NodeJS",
            "thumbnail": 'https://emeralize.s3.amazonaws.com/course/cover_images/plebdevs-thumbnail.png',
            "price": 70000
        },
        {
            "title": "Lightning Wallet Frontend",
            "description": "Write your first code and learn Frontend from scratch to build a simple lightning wallet using HTML/CSS, Javascript, and React",
            "thumbnail": 'https://emeralize.s3.amazonaws.com/course/cover_images/plebdev2_750__422_px_1200__630_px.jpg',
            "price": 45000
        },
        {
            "title": "Lightning Wallet Backend",
            "description": "Learn Backend from scratch and build a simple Lightning Wallet backend with a server, API, Database, and Lightning node using NodeJS",
            "thumbnail": 'https://emeralize.s3.amazonaws.com/course/cover_images/plebdevs-thumbnail.png',
            "price": 70000
        }
    ]);

    const productTemplate = (course) => {
        return (
            <div className="flex flex-col items-center w-full px-4">
                <div className="w-86 h-60 bg-gray-200 overflow-hidden rounded-md shadow-lg">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover object-center" />
                </div>
                <div className='text-center'>
                    <h4 className="mb-1 text-center">{course.title}</h4>
                    <h6 className="mt-0 mb-3 text-center">{course.price} sats</h6>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <Button icon="pi pi-search" rounded />
                        <Button icon="pi pi-star-fill" rounded severity="success" />
                    </div>
                </div>
            </div>
        );
    };    

    return (
        <>
            <h1 className="text-2xl font-bold ml-[6%] my-4">Courses</h1>
            <Carousel value={courses} numVisible={3}  itemTemplate={productTemplate} />
        </>
    )
}
        