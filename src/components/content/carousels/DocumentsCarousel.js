import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Carousel } from 'primereact/carousel';
import { parseEvent } from '@/utils/nostr';
import { DocumentTemplate } from '@/components/content/carousels/templates/DocumentTemplate';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { useDocuments } from '@/hooks/nostr/useDocuments';
import useWindowWidth from '@/hooks/useWindowWidth';
import { nip19 } from 'nostr-tools';
import { Divider } from 'primereact/divider';
const responsiveOptions = [
    {
        breakpoint: '3000px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '1462px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
];

export default function DocumentsCarousel() {
    const [processedDocuments, setProcessedDocuments] = useState([]);
    const [paidLessons, setPaidLessons] = useState([]);
    const [freeLessons, setFreeLessons] = useState([]);
    const [zapAmounts, setZapAmounts] = useState({});
    const { documents, documentsLoading, documentsError } = useDocuments()
    const windowWidth = useWindowWidth();
    const isMobileView = windowWidth <= 450;

    const handleZapAmountChange = useCallback((documentId, amount) => {
        setZapAmounts(prev => ({ ...prev, [documentId]: amount }));
    }, []);

    // todo: cache this in react query
    useEffect(() => {
        axios.get('/api/lessons').then(res => {
            if (res.data) {
                res.data.forEach(lesson => {
                    if (lesson?.resource?.price > 0) {
                        setPaidLessons(prev => [...prev, lesson?.resourceId]);
                    } else {
                        setFreeLessons(prev => [...prev, lesson?.resourceId]);
                    }
                });
            }
        }).catch(err => {
            console.log('err', err);
        });
    }, []);

    useEffect(() => {
        const fetch = async () => {
            try {
                if (documents && documents.length > 0 && paidLessons.length > 0) {
                    const processedDocuments = documents.map(document => parseEvent(document));
                    // Filter out documents that are in the paid lessons array
                    const filteredDocuments = processedDocuments.filter(document => !paidLessons.includes(document?.d));
                    setProcessedDocuments(filteredDocuments);
                } else {
                    console.log('No documents fetched or empty array returned');
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };        
        fetch();
    }, [documents, paidLessons]);

    useEffect(() => {
        if (Object.keys(zapAmounts).length === processedDocuments.length) {
            const sortedDocuments = [...processedDocuments].sort((a, b) => 
                (zapAmounts[b.id] || 0) - (zapAmounts[a.id] || 0)
            );
            setProcessedDocuments(sortedDocuments);
        }
    }, [zapAmounts, processedDocuments]);

    if (documentsError) {
        return <div>Error: {documentsError.message}</div>
    }

    return (
        <>
            <h3 className={`ml-[6%] mt-4 max-mob:text-3xl max-mob:ml-10`}>Documents</h3>
            <Divider className={`${isMobileView ? '' : 'hidden'}`} />
            <Carousel 
                value={documentsLoading || !processedDocuments.length ? [{}, {}, {}] : [...processedDocuments]}
                numVisible={2}
                pt={{
                    previousButton: {
                        className: isMobileView ? 'm-0' : ''
                    },
                    nextButton: {
                        className: isMobileView ? 'm-0' : ''
                    }
                }}
                itemTemplate={(item) => 
                        processedDocuments.length > 0 ? 
                        <DocumentTemplate key={item.id} document={item} isLesson={freeLessons.includes(item.d)} handleZapAmountChange={handleZapAmountChange} /> : 
                        <TemplateSkeleton key={Math.random()} />
                }
                responsiveOptions={responsiveOptions} />
        </>
    );
}
