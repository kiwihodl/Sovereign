import React from 'react';
import { useRouter } from 'next/router';
import GenericButton from '@/components/buttons/GenericButton';
import 'primeicons/primeicons.css';

const CourseHeader = ({ 
  course, 
  isMobileView, 
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
          className="mr-4 p-button-rounded p-button-text text-gray-300 hover:text-white"
          rounded={true}
          text={true}
          aria-label="Go back to home"
        />
        
        <div className="flex items-center pb-1">
          <h2 className={`text-white font-semibold truncate ${isMobileView ? 'text-base max-w-[160px]' : 'text-lg max-w-[300px]'}`}>
            {course.name}
          </h2>
        </div>
      </div>
    );
  }

  // Standard mode - for course page content
  return (
    <div 
      className="bg-transparent backdrop-blur-sm mb-0 p-3 px-4 sticky z-20 flex items-center"
      style={{ top: `${navbarHeight}px` }}
    >
      <div className="flex items-center max-w-[90%]">
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
        <h2 className={`font-medium text-gray-100 ${isMobileView ? 'text-sm' : 'text-base'} truncate`}>
          {course.name}
        </h2>
      </div>
    </div>
  );
};

export default CourseHeader; 