import React, { useState, useEffect } from 'react';
import VideoLesson from '@/components/content/courses/lessons/VideoLesson';
import DocumentLesson from '@/components/content/courses/lessons/DocumentLesson';
import CombinedLesson from '@/components/content/courses/lessons/CombinedLesson';
import MarkdownDisplay from '@/components/markdown/MarkdownDisplay';

/**
 * Component to display course content including lessons
 */
const CourseContent = ({ 
  lessons, 
  activeIndex, 
  course, 
  paidCourse, 
  decryptedLessonIds, 
  setCompleted 
}) => {
  const [lastActiveIndex, setLastActiveIndex] = useState(activeIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);

  // Initialize current lesson and handle updates when lessons or activeIndex change
  useEffect(() => {
    if (lessons.length > 0 && activeIndex < lessons.length) {
      setCurrentLesson(lessons[activeIndex]);
    } else {
      setCurrentLesson(null);
    }
  }, [lessons, activeIndex]);

  // Handle smooth transitions between lessons
  useEffect(() => {
    if (activeIndex !== lastActiveIndex) {
      // Start transition
      setIsTransitioning(true);
      
      // After a short delay, update the current lesson
      const timer = setTimeout(() => {
        setCurrentLesson(lessons[activeIndex] || null);
        setLastActiveIndex(activeIndex);
        
        // End transition with a slight delay to ensure content is ready
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 300); // Match this with CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [activeIndex, lastActiveIndex, lessons]);

  const renderLesson = (lesson) => {
    if (!lesson) return null;
    
    // Check if this specific lesson is decrypted
    const lessonDecrypted = !paidCourse || decryptedLessonIds[lesson.id] || false;
    
    if (lesson.topics?.includes('video') && lesson.topics?.includes('document')) {
      return (
        <CombinedLesson
          key={`combined-${lesson.id}`}
          lesson={lesson}
          course={course}
          decryptionPerformed={lessonDecrypted}
          isPaid={paidCourse}
          setCompleted={setCompleted}
        />
      );
    } else if (lesson.type === 'video' || lesson.topics?.includes('video')) {
      return (
        <VideoLesson
          key={`video-${lesson.id}`}
          lesson={lesson}
          course={course}
          decryptionPerformed={lessonDecrypted}
          isPaid={paidCourse}
          setCompleted={setCompleted}
        />
      );
    } else if (lesson.type === 'document' || lesson.topics?.includes('document')) {
      return (
        <DocumentLesson
          key={`doc-${lesson.id}`}
          lesson={lesson}
          course={course}
          decryptionPerformed={lessonDecrypted}
          isPaid={paidCourse}
          setCompleted={setCompleted}
        />
      );
    }
    
    return null;
  };

  return (
    <>
      {lessons.length > 0 && currentLesson ? (
        <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div 
            key={`lesson-container-${currentLesson.id}`}
            className={`transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          >
            {renderLesson(currentLesson)}
          </div>
        </div>
      ) : (
        <div className={`text-center bg-gray-800 rounded-lg p-8 transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <p>Select a lesson from the sidebar to begin learning.</p>
        </div>
      )}

      {course?.content && (
        <div className="mt-8 bg-gray-800 rounded-lg shadow-sm">
          <MarkdownDisplay content={course.content} className="p-4 rounded-lg" />
        </div>
      )}
    </>
  );
};

export default CourseContent; 