import React, { useState, useEffect } from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import Image from 'next/image';
import { useImageProxy } from '@/hooks/useImageProxy';

const CourseSidebar = ({
  lessons,
  activeIndex,
  onLessonSelect,
  completedLessons,
  isMobileView,
  onClose,
  sidebarVisible: parentSidebarVisible,
  setSidebarVisible,
  hideToggleButton = false,
}) => {
  const { returnImageProxy } = useImageProxy();
  const [visible, setVisible] = useState(true);

  // Sync with parent state if provided
  useEffect(() => {
    if (typeof parentSidebarVisible !== 'undefined') {
      setVisible(parentSidebarVisible);
    }
  }, [parentSidebarVisible]);

  const handleToggle = () => {
    const newState = !visible;
    setVisible(newState);
    if (setSidebarVisible) {
      setSidebarVisible(newState);
    }
  };

  const LessonItem = ({ lesson, index }) => (
    <li
      className={`
                rounded-lg overflow-hidden transition-all duration-200
                ${
                  activeIndex === index
                    ? 'bg-blue-900/40 border-l-4 border-blue-500'
                    : 'hover:bg-gray-700/50 active:bg-gray-700/80 border-l-4 border-transparent'
                }
                ${isMobileView ? 'mb-3' : 'mb-2'}
            `}
      onClick={() => onLessonSelect(index)}
    >
      <div className={`flex items-start p-3 cursor-pointer ${isMobileView ? 'p-4' : 'p-3'}`}>
        {lesson.image && (
          <div
            className={`relative rounded-md overflow-hidden flex-shrink-0 mr-3 ${isMobileView ? 'w-16 h-16' : 'w-12 h-12'}`}
          >
            <Image
              src={returnImageProxy(lesson.image)}
              alt={`Lesson ${index + 1} thumbnail`}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start w-full">
            <span
              className={`font-medium block mb-1 text-gray-300 ${isMobileView ? 'text-base' : 'text-sm'}`}
            >
              Lesson {index + 1}
            </span>
            {completedLessons.includes(lesson.id) && (
              <Tag severity="success" value="Completed" className="ml-1 py-1 text-xs" />
            )}
          </div>
          <h3
            className={`font-medium leading-tight line-clamp-2 text-[#f8f8ff] ${isMobileView ? 'text-base' : ''}`}
          >
            {lesson.title}
          </h3>
        </div>
      </div>
    </li>
  );

  // Sidebar content component for reuse
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-800 text-[#f8f8ff] px-4 py-4">
      <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-4">
        <h2 className="font-bold text-white text-lg">Course Lessons</h2>
        {visible && !hideToggleButton && !isMobileView && (
          <Button
            icon="pi pi-times"
            onClick={handleToggle}
            className="p-button-rounded p-button-text text-gray-300 hover:text-white p-button-sm"
            tooltip="Close sidebar"
            tooltipOptions={{ position: 'left' }}
          />
        )}
      </div>
      <div className="overflow-y-auto flex-1 pr-2">
        <ul className="space-y-2">
          {lessons.map((lesson, index) => (
            <LessonItem key={index} lesson={lesson} index={index} />
          ))}
        </ul>
      </div>
    </div>
  );

  // Global toggle button container - only shown if hideToggleButton is false
  const SidebarToggle = () => {
    if (visible || hideToggleButton || isMobileView) return null;
    
    return (
      <div 
        style={{
          position: 'fixed',
          right: 0,
          top: '40%',
          zIndex: 99999,
          pointerEvents: 'auto',
          transform: 'translateY(-50%)'
        }}
      >
        <Button 
          icon="pi pi-chevron-left"
          onClick={handleToggle}
          style={{
            borderTopRightRadius: 0, 
            borderBottomRightRadius: 0,
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            width: '3rem',
            height: '5rem'
          }}
          className="shadow-2xl border-0 rounded-r-none rounded-l-xl bg-blue-600 hover:bg-blue-700 pointer-events-auto"
          tooltip="Show lessons"
          tooltipOptions={{ position: 'left' }}
          pt={{
            icon: { className: 'font-bold text-lg' }
          }}
        />
      </div>
    );
  };

  // Mobile content tab
  const MobileLessonsTab = () => (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-md mb-6">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="font-bold text-white text-xl">Course Lessons</h2>
      </div>
      <div className="p-4">
        <ul className="space-y-3">
          {lessons.map((lesson, index) => (
            <LessonItem key={index} lesson={lesson} index={index} />
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Unified button approach for desktop - only if not hidden */}
      {!hideToggleButton && <SidebarToggle />}
      
      {/* Mobile view - direct content instead of sidebar */}
      {isMobileView && visible && (
        <MobileLessonsTab />
      )}
      
      {/* Desktop sidebar */}
      {!isMobileView && (
        <div className="relative flex flex-row-reverse z-[999]">
          <div 
            className={`transition-all duration-500 ease-in-out flex ${
              visible ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="ml-2 w-80 h-[calc(100vh-400px)] sticky top-8 overflow-hidden rounded-lg border border-gray-800 shadow-md bg-gray-900">
              <div className="h-full overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseSidebar;
