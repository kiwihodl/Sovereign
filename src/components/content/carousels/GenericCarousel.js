import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { VideoTemplate } from '@/components/content/carousels/templates/VideoTemplate';
import { DocumentTemplate } from '@/components/content/carousels/templates/DocumentTemplate';
import { CourseTemplate } from '@/components/content/carousels/templates/CourseTemplate';
import { CombinedTemplate } from '@/components/content/carousels/templates/CombinedTemplate';

export default function GenericCarousel({items, selectedTopic, title}) {
    const [lessons, setLessons] = useState([]);

    useEffect(() => {
        axios.get('/api/lessons').then(res => {
            if (res.data) {
                res.data.forEach(lesson => {
                    setLessons(prev => [...prev, lesson?.resourceId]);
                });
            }
        }).catch(err => {
            console.error('err', err);
        });
    }, []);

    const renderItem = (item) => {
        if (!item) return <TemplateSkeleton key={Math.random()} />;
        
        if (item.topics?.includes('video') && item.topics?.includes('document')) {
            return <CombinedTemplate key={item.id} resource={item} isLesson={lessons.includes(item?.d)} />;
        } else if (item.type === 'document') {
            return <DocumentTemplate key={item.id} document={item} isLesson={lessons.includes(item?.d)} />;
        } else if (item.type === 'video') {
            return <VideoTemplate key={item.id} video={item} isLesson={lessons.includes(item?.d)} />;
        } else if (item.type === 'course') {
            return <CourseTemplate key={item.id} course={item} />;
        }
        return <TemplateSkeleton key={Math.random()} />;
    };

    return (
        <div className="w-full px-4 mb-4">
            <div className="grid grid-cols-2 gap-4 max-w-full max-tab:grid-cols-1 lg:grid-cols-3">
                {items.map((item, index) => (
                    <div key={item?.id || index} className="w-full min-w-0">
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        </div>
    );
}
