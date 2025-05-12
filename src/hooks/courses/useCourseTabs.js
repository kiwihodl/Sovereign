import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import useWindowWidth from '../useWindowWidth';
import useCourseTabsState from './useCourseTabsState';

/**
 * @deprecated Use useCourseTabsState for pure state or useCourseNavigation for router integration
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
  
  // Use the base hook for core tab state functionality
  const {
    activeTab,
    setActiveTab,
    sidebarVisible,
    setSidebarVisible,
    tabMap,
    getActiveTabIndex,
    getTabItems,
    toggleSidebar
  } = useCourseTabsState({
    tabMap: options.tabMap,
    initialSidebarVisible: options.initialSidebarVisible,
    isMobileView
  });
  
  // Update tabs and sidebar based on router query
  useEffect(() => {
    if (router.isReady) {
      const { active, tab } = router.query;
      
      // If tab is specified in the URL, use that
      if (tab && tabMap.includes(tab)) {
        setActiveTab(tab);
      } else if (active !== undefined) {
        // If we have an active lesson, switch to content tab
        setActiveTab('content');
      } else {
        // Default to overview tab when no parameters
        setActiveTab('overview');
      }
    }
  }, [router.isReady, router.query, tabMap, setActiveTab]);
  
  // Toggle between tabs with router integration
  const toggleTab = useCallback((indexOrName) => {
    const tabName = typeof indexOrName === 'number' 
      ? tabMap[indexOrName] 
      : indexOrName;
    
    setActiveTab(tabName);
    
    // Only show/hide sidebar on mobile - desktop keeps sidebar visible
    if (isMobileView) {
      setSidebarVisible(tabName === 'lessons');
    }
    
    // Sync URL with tab change using shallow routing
    const newQuery = {
      ...router.query,
      tab: tabName === 'overview' ? undefined : tabName
    };
    router.push(
      { pathname: router.pathname, query: newQuery },
      undefined,
      { shallow: true }
    );
  }, [tabMap, isMobileView, router, setActiveTab, setSidebarVisible]);
  
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