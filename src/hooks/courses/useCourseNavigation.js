import { useState, useEffect, useCallback } from 'react';
import useCourseTabsState from './useCourseTabsState';

/**
 * Hook to manage course navigation and tab logic
 * @param {Object} router - Next.js router instance 
 * @param {Boolean} isMobileView - Whether the current view is mobile
 * @returns {Object} Navigation state and functions
 */
const useCourseNavigation = (router, isMobileView) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Use the base hook for core tab state functionality
  const {
    activeTab,
    setActiveTab,
    sidebarVisible,
    setSidebarVisible,
    tabMap,
    getActiveTabIndex,
    getTabItems,
    toggleSidebar: baseToggleSidebar
  } = useCourseTabsState({
    isMobileView
  });

  // Initialize navigation state based on router
  useEffect(() => {
    if (router.isReady) {
      const { active } = router.query;
      if (active !== undefined) {
        setActiveIndex(parseInt(active, 10));
        // If we have an active lesson, switch to content tab
        setActiveTab('content');
      } else {
        setActiveIndex(0);
        // Default to overview tab when no active parameter
        setActiveTab('overview');
      }

      // Auto-open sidebar on desktop, close on mobile
      setSidebarVisible(!isMobileView);
    }
  }, [router.isReady, router.query, isMobileView, setActiveTab, setSidebarVisible]);

  // Function to handle lesson selection
  const handleLessonSelect = useCallback((index) => {
    setActiveIndex(index);
    
    // Update URL without causing a page reload (for bookmarking purposes)
    const newUrl = `/course/${router.query.slug}?active=${index}`;
    window.history.replaceState({ url: newUrl, as: newUrl, options: { shallow: true } }, '', newUrl);

    // On mobile, switch to content tab after selection
    if (isMobileView) {
      setActiveTab('content');
      setSidebarVisible(false);
    }
  }, [router.query.slug, isMobileView, setActiveTab, setSidebarVisible]);

  // Function to toggle tab with lesson state integration
  const toggleTab = useCallback((index) => {
    const tabName = tabMap[index];
    setActiveTab(tabName);
    
    // Only show/hide sidebar on mobile - desktop keeps sidebar visible
    if (isMobileView) {
      setSidebarVisible(tabName === 'lessons');
    }
  }, [tabMap, isMobileView, setActiveTab, setSidebarVisible]);

  return {
    activeIndex,
    setActiveIndex,
    activeTab,
    setActiveTab,
    sidebarVisible,
    setSidebarVisible,
    handleLessonSelect,
    toggleTab,
    toggleSidebar: baseToggleSidebar,
    getActiveTabIndex,
    getTabItems,
    tabMap
  };
};

export default useCourseNavigation; 