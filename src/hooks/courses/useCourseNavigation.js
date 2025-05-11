import { useState, useEffect, useMemo } from 'react';

/**
 * Hook to manage course navigation and tab logic
 * @param {Object} router - Next.js router instance 
 * @param {Boolean} isMobileView - Whether the current view is mobile
 * @returns {Object} Navigation state and functions
 */
const useCourseNavigation = (router, isMobileView) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // Default to overview tab

  // Memoized function to get the tab map based on view mode
  const tabMap = useMemo(() => {
    const baseTabMap = ['overview', 'content', 'qa'];
    if (isMobileView) {
      const mobileTabMap = [...baseTabMap];
      mobileTabMap.splice(2, 0, 'lessons');
      return mobileTabMap;
    }
    return baseTabMap;
  }, [isMobileView]);

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
  }, [router.isReady, router.query, isMobileView]);

  // Function to handle lesson selection
  const handleLessonSelect = (index) => {
    setActiveIndex(index);
    
    // Update URL without causing a page reload (for bookmarking purposes)
    const newUrl = `/course/${router.query.slug}?active=${index}`;
    window.history.replaceState({ url: newUrl, as: newUrl, options: { shallow: true } }, '', newUrl);

    // On mobile, switch to content tab after selection
    if (isMobileView) {
      setActiveTab('content');
      setSidebarVisible(false);
    }
  };

  // Function to toggle tab
  const toggleTab = (index) => {
    const tabName = tabMap[index];
    setActiveTab(tabName);
    
    // Only show/hide sidebar on mobile - desktop keeps sidebar visible
    if (isMobileView) {
      setSidebarVisible(tabName === 'lessons');
    }
  };

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Map active tab name back to index for MenuTab
  const getActiveTabIndex = () => {
    return tabMap.indexOf(activeTab);
  };

  // Create tab items for MenuTab
  const getTabItems = () => {
    const items = [
      {
        label: 'Overview',
        icon: 'pi pi-home',
      },
      {
        label: 'Content',
        icon: 'pi pi-book',
      }
    ];
    
    // Add lessons tab only on mobile
    if (isMobileView) {
      items.push({
        label: 'Lessons',
        icon: 'pi pi-list',
      });
    }
    
    items.push({
      label: 'Comments',
      icon: 'pi pi-comments',
    });
    
    return items;
  };

  // Add keyboard navigation support for tabs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        const currentIndex = getActiveTabIndex();
        const nextIndex = (currentIndex + 1) % tabMap.length;
        toggleTab(nextIndex);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = getActiveTabIndex();
        const prevIndex = (currentIndex - 1 + tabMap.length) % tabMap.length;
        toggleTab(prevIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, tabMap]);

  return {
    activeIndex,
    setActiveIndex,
    activeTab,
    setActiveTab,
    sidebarVisible,
    setSidebarVisible,
    handleLessonSelect,
    toggleTab,
    toggleSidebar,
    getActiveTabIndex,
    getTabItems,
    tabMap
  };
};

export default useCourseNavigation; 