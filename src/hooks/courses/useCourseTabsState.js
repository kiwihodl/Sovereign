import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * Base hook for tab state management with no router or side-effects
 * This pure hook manages the tab state and sidebar visibility
 * 
 * @param {Object} options - Configuration options
 * @param {Array} options.tabMap - Optional custom tab map to use
 * @param {boolean} options.initialSidebarVisible - Initial sidebar visibility state
 * @param {boolean} options.isMobileView - Whether the current view is mobile
 * @returns {Object} Pure tab management utilities and state
 */
const useCourseTabsState = (options = {}) => {
  const { 
    tabMap: customTabMap, 
    initialSidebarVisible,
    isMobileView = false
  } = options;
  
  // Tab management state
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarVisible, setSidebarVisible] = useState(
    initialSidebarVisible !== undefined ? initialSidebarVisible : !isMobileView
  );
  
  // Track if we've initialized yet
  const initialized = useRef(false);
  
  // Get tab map based on view mode
  const tabMap = useMemo(() => {
    const baseTabMap = customTabMap || ['overview', 'content', 'qa'];
    if (isMobileView) {
      const mobileTabMap = [...baseTabMap];
      // Insert lessons tab before qa in mobile view
      if (!mobileTabMap.includes('lessons')) {
        mobileTabMap.splice(2, 0, 'lessons');
      }
      return mobileTabMap;
    }
    return baseTabMap;
  }, [isMobileView, customTabMap]);
  
  // Auto-update sidebar visibility based on mobile/desktop
  useEffect(() => {
    if (initialized.current) {
      // Only auto-update sidebar visibility if we're initialized
      // and the view mode changes
      setSidebarVisible(!isMobileView);
    } else {
      initialized.current = true;
    }
  }, [isMobileView]);
  
  // Get active tab index
  const getActiveTabIndex = useCallback(() => {
    return tabMap.indexOf(activeTab);
  }, [activeTab, tabMap]);
  
  // Pure toggle between tabs with no side effects
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
    toggleTab,
    toggleSidebar,
    getActiveTabIndex,
    getTabItems,
    tabMap
  };
};

export default useCourseTabsState; 