import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Carousel } from 'primereact/carousel';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { VideoTemplate } from '@/components/content/carousels/newTemplates/VideoTemplate';
import { DocumentTemplate } from '@/components/content/carousels/newTemplates/DocumentTemplate';
import { CourseTemplate } from '@/components/content/carousels/newTemplates/CourseTemplate';
import debounce from 'lodash/debounce';

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

export default function GenericCarousel({items, selectedTopic, title}) {
    const [carousels, setCarousels] = useState([]);

    const memoizedItems = useMemo(() => items, [items]);

    useEffect(() => {
        console.log("carousel update", carousels);
    }, [carousels]);

    const getItemsPerCarousel = useCallback(() => {
        const width = window.innerWidth;
        if (width <= 575) return 1;
        if (width <= 1462) return 2;
        return 3;
    }, []);

    const updateCarousels = useCallback(() => {
        const itemsPerCarousel = getItemsPerCarousel();
        const newCarousels = [];
        for (let i = 0; i < memoizedItems.length; i += itemsPerCarousel) {
            newCarousels.push(memoizedItems.slice(i, i + itemsPerCarousel));
        }
        setCarousels(newCarousels);
    }, [memoizedItems, getItemsPerCarousel]);

    useEffect(() => {
        updateCarousels();
        const debouncedHandleResize = debounce(updateCarousels, 250);
        window.addEventListener('resize', debouncedHandleResize);

        return () => {
            window.removeEventListener('resize', debouncedHandleResize);
        };
    }, [updateCarousels, memoizedItems]);

    return (
        <>
            {carousels.map((carouselItems, index) => (
                <Carousel 
                    key={index}
                    value={carouselItems}
                    itemTemplate={(item) => {
                        if (carouselItems.length > 0) {
                            if (item.type === 'resource') {
                                return <DocumentTemplate key={item.id} document={item} />;
                            } else if (item.type === 'workshop') {
                                return <VideoTemplate key={item.id} video={item} />;
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
