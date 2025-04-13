import React from 'react';
import { Tag } from 'primereact/tag';
import { useRouter } from 'next/router';
import GenericButton from '@/components/buttons/GenericButton';
import Image from 'next/image';
import 'primeicons/primeicons.css';

const CourseHeader = ({ 
  course, 
  isMobileView, 
  isCompleted, 
  navbarHeight,
  isNavbarMode = false 
}) => {
  const router = useRouter();

  // Handle back button navigation
  const handleBackNavigation = () => {
    const { active, slug } = router.query;
    
    // If we're on a specific lesson (has active param), remove it and stay on course page
    if (active !== undefined) {
      router.push(`/course/${slug}`, undefined, { shallow: true });
    } else {
      // If we're on the main course page (no active param), go back to previous page
      router.push('/');
    }
  };

  if (!course) return null;

  // Navbar mode - compact version for the top navbar
  if (isNavbarMode) {
    return (
      <div 
        className="flex items-center cursor-pointer hover:opacity-90"
        onClick={() => router.push(`/course/${router.query.slug}`)}
      >
        <GenericButton
          icon="pi pi-arrow-left"
          onClick={(e) => {
            e.stopPropagation();
            router.push('/');
          }}
          className="mr-2 pl-0 p-button-rounded p-button-text text-gray-300 hover:text-white"
          rounded={true}
          text={true}
          aria-label="Go back to home"
        />
        
        {course.image && (
          <div className="relative h-8 w-8 mr-3 rounded-md overflow-hidden flex-shrink-0 border border-gray-700/50">
            <img
              src={course.image}
              alt={course.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        
        <div className="flex items-center">
          <h1 className={`text-white font-semibold truncate ${isMobileView ? 'text-base max-w-[120px]' : 'text-lg max-w-[240px]'}`}>
            {course.name}
          </h1>
          
          {isCompleted && !isMobileView && (
            <Tag severity="success" value="Completed" size="small" className="ml-2 py-0.5 text-xs" />
          )}
        </div>
      </div>
    );
  }

  // Standard mode - for course page content
  return (
    <div 
      className="bg-transparent backdrop-blur-sm mb-0 p-3 px-4 sticky z-20 flex items-center justify-between"
      style={{ top: `${navbarHeight}px` }}
    >
      <div className="flex items-center max-w-[80%]">
        <GenericButton
          icon="pi pi-arrow-left"
          onClick={handleBackNavigation}
          className="mr-3 p-button-rounded p-button-text text-gray-300 hover:text-white"
          tooltip="Go back"
          tooltipOptions={{ position: 'bottom' }}
          rounded={true}
          text={true}
          aria-label="Go back"
        />
        {!isMobileView && course.image && (
          <div className="relative w-8 h-8 mr-3 rounded-md overflow-hidden flex-shrink-0 border border-gray-700/50">
            <img
              src={course.image}
              alt={course.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <h1 className={`font-medium text-gray-100 ${isMobileView ? 'text-sm' : 'text-base'} truncate`}>
          {course.name}
        </h1>
      </div>
      <div className="flex items-center">
        {isCompleted && (
          <Tag severity="success" value="Completed" size="small" className="ml-2 py-1 text-xs" />
        )}
      </div>
    </div>
  );
};

export default CourseHeader; 