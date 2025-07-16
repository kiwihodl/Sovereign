import React from 'react';
import { Tag } from 'primereact/tag';
import CourseDetails from '../details/CourseDetails';
import GenericButton from '@/components/buttons/GenericButton';
import Image from 'next/image';

/**
 * Component to display course overview with details
 */
const CourseOverview = ({ 
  course,
  paidCourse,
  lessons,
  decryptionPerformed,
  handlePaymentSuccess,
  handlePaymentError,
  isMobileView,
  completedLessons,
  onLessonSelect,
  toggleToContentTab
}) => {
  // Determine if course is completed
  const isCompleted = lessons && lessons.length > 0 && completedLessons.length === lessons.length;
  
  return (
    <>
    <div className={`bg-gray-800 rounded-lg border border-gray-800 shadow-md ${isMobileView ? 'p-4' : 'p-6'}`}>
      {isMobileView && course && (
        <div className="mb-2">
          {/* Completed tag above image in mobile view */}
          {isCompleted && (
            <div className="mb-2">
              <Tag severity="success" value="Completed" />
            </div>
          )}
          
          {/* Course image */}
          {course.image && (
            <div className="w-full h-48 relative rounded-lg overflow-hidden mb-3">
              <Image 
                src={course.image} 
                alt={course.title} 
                width={200}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}
      <CourseDetails
        processedEvent={course}
        paidCourse={paidCourse}
        lessons={lessons}
        decryptionPerformed={decryptionPerformed}
        handlePaymentSuccess={handlePaymentSuccess}
        handlePaymentError={handlePaymentError}
        isMobileView={isMobileView}
        showCompletedTag={!isMobileView}
        completedLessons={completedLessons}
        onLessonSelect={onLessonSelect}
        toggleToContentTab={toggleToContentTab}
      />
    </div>
    </>
  );
};

export default CourseOverview; 