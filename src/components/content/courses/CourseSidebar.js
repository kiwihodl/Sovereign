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
        {visible && (
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

  // Toggle button (used for both desktop and mobile)
  const ToggleButton = () => (
    <div className="fixed right-0 top-1/3 z-50 m-0 p-0">
      <Button 
        icon="pi pi-chevron-left" 
        onClick={handleToggle}
        className="shadow-md border-0 rounded-r-none rounded-l-md bg-blue-600 hover:bg-blue-700"
        tooltip="Show lessons"
        tooltipOptions={{ position: 'left' }}
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      />
    </div>
  );

  // Desktop implementation with integrated toggle button
  if (!isMobileView) {
    return (
      <>
        {/* Sidebar content */}
        <div className="relative flex flex-row-reverse">
          <div 
            className={`transition-all duration-300 flex ${
              visible ? 'w-80' : 'w-0 overflow-hidden'
            }`}
          >
            <div className="w-80 h-[calc(100vh-400px)] sticky top-8 overflow-hidden rounded-lg border border-gray-800 shadow-md bg-gray-900">
              <div className="h-full overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
        
        {/* Detached toggle button when sidebar is closed */}
        {!visible && <ToggleButton />}
      </>
    );
  }

  // Mobile implementation with PrimeReact's Sidebar
  return (
    <>
      {/* Mobile toggle button - only shown when sidebar is closed */}
      {!visible && (
        <div className="fixed right-0 top-20 z-40 m-0 p-0">
          <Button 
            icon="pi pi-list" 
            onClick={handleToggle}
            className="shadow-md bg-blue-600 hover:bg-blue-700 border-0 rounded-r-none rounded-l-md"
            tooltip="Show lessons"
            tooltipOptions={{ position: 'left' }}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          />
        </div>
      )}
      
      {/* Mobile sidebar */}
      <Sidebar 
        visible={visible}
        position="right"
        onHide={handleToggle}
        className="bg-gray-900 p-0 shadow-lg"
        style={{ width: '85vw', maxWidth: '350px' }}
        showCloseIcon={false}
        modal={false}
      >
        <div className="bg-gray-800 p-5 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-bold text-white text-xl">Course Lessons</h2>
          <Button 
            icon="pi pi-times" 
            onClick={handleToggle}
            className="p-button-rounded p-button-text text-gray-300 hover:text-white"
          />
        </div>
        
        <div className="overflow-y-auto h-full p-4 bg-gray-900">
          <ul className="space-y-3">
            {lessons.map((lesson, index) => (
              <LessonItem key={index} lesson={lesson} index={index} />
            ))}
          </ul>
        </div>
      </Sidebar>
    </>
  );
};

export default CourseSidebar;
