import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import useWindowWidth from '../useWindowWidth';

/**
 * Hook to manage course tabs, navigation, and sidebar visibility
 * @param {Object} options - Configuration options
 * @param {Array} options.tabMap - Optional custom tab map to use
 * @param {boolean} options.initialSidebarVisible - Initial sidebar visibility state
 * @returns {Object} Tab management utilities and state
 */
const useCourseTabs = (options = {}) => {
  const router = useRouter();
  const windowWidth = useWindowWidth();
  const isMobileView = typeof windowWidth === 'number' ? windowWidth <= 968 : false;
  // Tab management state
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarVisible, setSidebarVisible] = useState(
    options.initialSidebarVisible !== undefined ? options.initialSidebarVisible : !isMobileView
  );
  
  // Get tab map based on view mode
  const tabMap = useMemo(() => {
    const baseTabMap = options.tabMap || ['overview', 'content', 'qa'];
    if (isMobileView) {
      const mobileTabMap = [...baseTabMap];
      // Insert lessons tab before qa in mobile view
      if (!mobileTabMap.includes('lessons')) {
        mobileTabMap.splice(2, 0, 'lessons');
      }
      return mobileTabMap;
    }
    return baseTabMap;
  }, [isMobileView, options.tabMap]);
  
  // Update tabs and sidebar based on router query
  useEffect(() => {
    if (router.isReady) {
      const { active } = router.query;
      if (active !== undefined) {
        // If we have an active lesson, switch to content tab
        setActiveTab('content');
      } else {
        // Default to overview tab when no active parameter
        setActiveTab('overview');
      }

      // Auto-open sidebar on desktop, close on mobile
      setSidebarVisible(!isMobileView);
    }
  }, [router.isReady, router.query, isMobileView]);
  
  // Get active tab index
  const getActiveTabIndex = useCallback(() => {
    return tabMap.indexOf(activeTab);
  }, [activeTab, tabMap]);
  
  // Toggle between tabs
  const toggleTab = useCallback((indexOrName) => {
    const tabName = typeof indexOrName === 'number' 
      ? tabMap[indexOrName] 
      : indexOrName;
    
    setActiveTab(tabName);
    
    // Only show/hide sidebar on mobile - desktop keeps sidebar visible
    if (isMobileView) {
      setSidebarVisible(tabName === 'lessons');
    }
  }, [tabMap, isMobileView]);
  
  // Toggle sidebar visibility
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);
  
  // Generate tab items for MenuTab component
  const getTabItems = useCallback(() => {
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
  }, [isMobileView]);
  
  // Setup keyboard navigation for tabs
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
  }, [getActiveTabIndex, tabMap, toggleTab]);
  
  return {
    activeTab,
    setActiveTab,
    sidebarVisible,
    setSidebarVisible,
    isMobileView,
    toggleTab,
    toggleSidebar,
    getActiveTabIndex,
    getTabItems,
    tabMap
  };
};

export default useCourseTabs; 