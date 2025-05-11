import React from 'react';
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
  const renderLesson = (lesson) => {
    if (!lesson) return null;
    
    // Check if this specific lesson is decrypted
    const lessonDecrypted = !paidCourse || decryptedLessonIds[lesson.id] || false;
    
    if (lesson.topics?.includes('video') && lesson.topics?.includes('document')) {
      return (
        <CombinedLesson
          lesson={lesson}
          course={course}
          decryptionPerformed={lessonDecrypted}
          isPaid={paidCourse}
          setCompleted={setCompleted}
        />
      );
    } else if (lesson.type === 'video' && !lesson.topics?.includes('document')) {
      return (
        <VideoLesson
          lesson={lesson}
          course={course}
          decryptionPerformed={lessonDecrypted}
          isPaid={paidCourse}
          setCompleted={setCompleted}
        />
      );
    } else if (lesson.type === 'document' && !lesson.topics?.includes('video')) {
      return (
        <DocumentLesson
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
      {lessons.length > 0 && lessons[activeIndex] ? (
        <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div key={`lesson-${lessons[activeIndex].id}`}>
            {renderLesson(lessons[activeIndex])}
          </div>
        </div>
      ) : (
        <div className="text-center bg-gray-800 rounded-lg p-8">
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