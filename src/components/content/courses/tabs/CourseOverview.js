import React from 'react';
import { Tag } from 'primereact/tag';
import CourseDetails from '../details/CourseDetails';

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
  completedLessons 
}) => {
  // Determine if course is completed
  const isCompleted = completedLessons.length > 0;
  
  return (
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
              <img 
                src={course.image} 
                alt={course.title} 
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
      />
    </div>
  );
};

export default CourseOverview; 