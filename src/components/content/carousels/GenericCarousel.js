import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import ResourceTemplate from '@/components/content/carousels/templates/ResourceTemplate';
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

export default function GenericCarousel({items}) {
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

            const newCarousels = [];
            for (let i = 0; i < items.length; i += itemsPerCarousel) {
                newCarousels.push(items.slice(i, i + itemsPerCarousel));
            }
            setCarousels(newCarousels);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [items]);

    return (
        <>
            {carousels.map((carouselItems, index) => (
                <Carousel 
                    key={index}
                    value={carouselItems}
                    itemTemplate={(item) => 
                        carouselItems.length > 0 ? 
                        <ResourceTemplate key={item.id} resource={item} /> : 
                        <TemplateSkeleton key={Math.random()} />
                    }
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
