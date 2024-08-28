import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import ResourceTemplate from '@/components/content/carousels/templates/ResourceTemplate';
import CourseTemplate from '@/components/content/carousels/templates/CourseTemplate';
import WorkshopTemplate from '@/components/content/carousels/templates/WorkshopTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';

const responsiveOptions = [
    {
        breakpoint: '3000px',
        numVisible: 3,
    },
    {
        breakpoint: '1462px',
        numVisible: 2,
    },
    {
        breakpoint: '575px',
        numVisible: 1,
    }
];

export default function GenericCarousel({items, selectedTopic}) {
    const [carousels, setCarousels] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            let itemsPerCarousel = 3;

            if (width <= 1462) {
                itemsPerCarousel = 2;
            }
            if (width <= 575) {
                itemsPerCarousel = 1;
            }

            const filteredItems = selectedTopic === 'All' 
                ? items 
                : items.filter(item => 
                    item.topics && 
                    (item.topics.includes(selectedTopic) || item.type === selectedTopic.toLowerCase())
                );

            const newCarousels = [];
            for (let i = 0; i < filteredItems.length; i += itemsPerCarousel) {
                newCarousels.push(filteredItems.slice(i, i + itemsPerCarousel));
            }
            setCarousels(newCarousels);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [items, selectedTopic]);
    return (
        <>
            {carousels.map((carouselItems, index) => (
                <Carousel 
                    key={index}
                    value={carouselItems}
                    itemTemplate={(item) => {
                        if (carouselItems.length > 0) {
                            if (item.type === 'resource') {
                                return <ResourceTemplate key={item.id} resource={item} />;
                            } else if (item.type === 'workshop') {
                                return <WorkshopTemplate key={item.id} workshop={item} />;
                            } else if (item.type === 'course') {
                                return <CourseTemplate key={item.id} course={item} />;
                            }
                        }
                        return <TemplateSkeleton key={Math.random()} />;
                    }}
                    responsiveOptions={responsiveOptions}
                    className="mb-4"
                    pt={{
                        previousButton: { className: 'hidden' },
                        nextButton: { className: 'hidden' }
                    }}
                />
            ))}
        </>
    );
}
