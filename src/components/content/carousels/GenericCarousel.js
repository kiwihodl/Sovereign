import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateSkeleton from '@/components/content/carousels/skeletons/TemplateSkeleton';
import { VideoTemplate } from '@/components/content/carousels/templates/VideoTemplate';
import { DocumentTemplate } from '@/components/content/carousels/templates/DocumentTemplate';
import { CourseTemplate } from '@/components/content/carousels/templates/CourseTemplate';
import { CombinedTemplate } from '@/components/content/carousels/templates/CombinedTemplate';

export default function GenericCarousel({ items, selectedTopic, title }) {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    axios
      .get('/api/lessons')
      .then(res => {
        if (res.data) {
          res.data.forEach(lesson => {
            setLessons(prev => [...prev, lesson?.resourceId]);
          });
        }
      })
      .catch(err => {
        console.error('err', err);
      });
  }, []);

  const generateUniqueTemplateKey = (item, index, type) => {
    if (!item) return `${type}-${index}`;
    const baseKey = item.id || item.d || `${type}-${index}`;
    return `${type}-${baseKey}-${index}`;
  };

  // todo: max sizing for single peice of content being shown
  const renderItem = (item, index) => {
    if (!item) return <TemplateSkeleton key={generateUniqueTemplateKey(item, index, 'skeleton')} />;

    if (item.topics?.includes('video') && item.topics?.includes('document')) {
      return (
        <CombinedTemplate
          key={generateUniqueTemplateKey(item, index, 'combined')}
          resource={item}
          isLesson={lessons.includes(item?.d)}
        />
      );
    } else if (item.type === 'document') {
      return (
        <DocumentTemplate
          key={generateUniqueTemplateKey(item, index, 'document')}
          document={item}
          isLesson={lessons.includes(item?.d)}
        />
      );
    } else if (item.type === 'video') {
      return (
        <VideoTemplate
          key={generateUniqueTemplateKey(item, index, 'video')}
          video={item}
          isLesson={lessons.includes(item?.d)}
        />
      );
    } else if (item.type === 'course') {
      return (
        <CourseTemplate key={generateUniqueTemplateKey(item, index, 'course')} course={item} />
      );
    }
    return <TemplateSkeleton key={generateUniqueTemplateKey(item, index, 'fallback')} />;
  };

  return (
    <div className="w-full mb-4">
      <div className="grid grid-cols-2 gap-4 max-w-full max-tab:grid-cols-1 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={generateUniqueTemplateKey(item, index, 'container')} className="w-full min-w-0">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
