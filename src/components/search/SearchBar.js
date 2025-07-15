import React, { useState, useRef, useEffect, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import ContentDropdownItem from '@/components/content/dropdowns/ContentDropdownItem';
import { useContentSearch } from '@/hooks/useContentSearch';
import { useRouter } from 'next/router';
import useWindowWidth from '@/hooks/useWindowWidth';
import { ProgressSpinner } from 'primereact/progressspinner';

const SEARCH_DELAY = 300; // ms
const MIN_SEARCH_LENGTH = 3;

const SearchBar = ({ isMobileSearch, isDesktopNav, onCloseSearch }) => {
  const { searchContent, searchResults: contentResults } = useContentSearch();
  const router = useRouter();
  const windowWidth = useWindowWidth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const op = useRef(null);
  const searchTimeout = useRef(null);

  // Handle search input changes
  const handleSearch = e => {
    const term = e.target.value;
    setSearchTerm(term);

    // Clear any existing timeout to avoid unnecessary API calls
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set loading state if term length is sufficient
    if (term.length >= MIN_SEARCH_LENGTH) {
      setIsSearching(true);
    }

    // Set a timeout to avoid searching on each keystroke
    searchTimeout.current = setTimeout(() => {
      if (term.length >= MIN_SEARCH_LENGTH) {
        searchContent(term);
      } else {
        setIsSearching(false);
      }
    }, SEARCH_DELAY);

    // Show/hide overlay panel based on search term length
    if (!isMobileSearch && term.length >= MIN_SEARCH_LENGTH) {
      op.current.show(e);
    } else if (!isMobileSearch) {
      op.current.hide();
    }
  };

  // Update search results when results change
  useEffect(() => {
    setSearchResults(contentResults);

    // Once we have results, set isSearching to false
    if (searchTerm.length >= MIN_SEARCH_LENGTH) {
      setIsSearching(false);
    }
  }, [contentResults, searchTerm]);

  // Cleanup the timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Handle item selection from search results
  const handleContentSelect = content => {
    if (content?.type === 'course') {
      if (content?.naddress) {
        // Use naddress for course if available
        router.push(`/course/${content.naddress}`);
      } else {
        // Fallback to d or id
        router.push(`/course/${content?.d || content?.id}`);
      }
    } else if (content?.naddress) {
      // Use naddress for other content if available
      router.push(`/details/${content.naddress}`);
    } else {
      // Fallback to ID if naddress is not available
      router.push(`/details/${content.id}`);
    }

    // Reset search state
    resetSearch();
  };

  // Reset search state
  const resetSearch = () => {
    setSearchTerm('');
    searchContent('');
    setSearchResults([]);
    setIsSearching(false);

    if (op.current) {
      op.current.hide();
    }

    if (isMobileSearch && onCloseSearch) {
      onCloseSearch();
    } else if (isMobileSearch && window.parent) {
      const navbar = document.querySelector('.navbar-mobile-search');
      if (navbar) {
        const closeButton = navbar.querySelector('button');
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  };

  // Render search results
  const renderSearchResults = () => {
    // Show loading spinner while searching
    if (isSearching) {
      return (
        <div className="flex items-center justify-center p-6">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
        </div>
      );
    }

    // Show no results message
    if (searchResults.length === 0 && searchTerm.length >= MIN_SEARCH_LENGTH) {
      return <div className="p-4 text-center text-gray-400">No results found</div>;
    }

    // Render content items
    return searchResults.map((item, index) => (
      <ContentDropdownItem key={index} content={item} onSelect={handleContentSelect} />
    ));
  };

  // Derived styles based on screen size
  const searchWidth = useMemo(() => {
    if (windowWidth > 845) return 'w-[300px]';
    if (isMobileSearch || windowWidth <= 600) return 'w-full';
    return 'w-[160px]';
  }, [windowWidth, isMobileSearch]);

  return (
    <>
      <div className={`${isDesktopNav ? 'w-full max-w-md' : 'w-full'}`}>
        {isDesktopNav ? (
          // Desktop navbar search - simplified without dropdown
          <div className="flex items-center bg-gray-900/55 rounded-lg">
            <div className="relative flex-1 flex items-center">
              <i className="pi pi-search text-gray-400 absolute left-4 z-10" />
              <InputText
                className="w-full bg-transparent pl-10 pr-4"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search content"
                pt={{
                  root: {
                    className: 'border-none focus:ring-0 rounded-lg',
                  },
                }}
              />
            </div>
          </div>
        ) : (
          // Original search for other views - simplified without dropdown
          <div className={`flex flex-col ${isMobileSearch ? 'gap-4' : ''}`}>
            <div
              className={`relative flex items-center ${isMobileSearch ? 'bg-gray-800 rounded-lg p-2' : ''}`}
            >
              <i className="pi pi-search text-gray-400 absolute left-4 z-10" />
              <InputText
                className={`
                  ${searchWidth}
                  ${isMobileSearch ? 'bg-transparent border-none pl-12 text-lg' : ''}
                `}
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search content"
                pt={{
                  root: {
                    className: `${isMobileSearch ? 'focus:ring-0' : 'border-none rounded-lg focus:border-none focus:ring-0'}`,
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Search Results */}
      {!isMobileSearch && (
        <OverlayPanel ref={op} className="w-[600px] max-h-[70vh] overflow-y-auto">
          {renderSearchResults()}
        </OverlayPanel>
      )}

      {/* Mobile Search Results */}
      {isMobileSearch && searchTerm.length >= MIN_SEARCH_LENGTH && (
        <div
          className="fixed inset-x-0 bottom-0 top-[165px] bg-gray-900 overflow-y-auto"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="pb-20">{renderSearchResults()}</div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
