import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { OverlayPanel } from 'primereact/overlaypanel';
import ContentDropdownItem from '@/components/content/dropdowns/ContentDropdownItem';
import MessageDropdownItem from '@/components/content/dropdowns/MessageDropdownItem';
import { useContentSearch } from '@/hooks/useContentSearch';
import { useCommunitySearch } from '@/hooks/useCommunitySearch';
import { useRouter } from 'next/router';
import useWindowWidth from '@/hooks/useWindowWidth';
import { useNDKContext } from '@/context/NDKContext';
import { ProgressSpinner } from 'primereact/progressspinner';

const SearchBar = ({ isMobileSearch, isDesktopNav, onCloseSearch }) => {
  const { searchContent, searchResults: contentResults } = useContentSearch();
  const { searchCommunity, searchResults: communityResults } = useCommunitySearch();
  const router = useRouter();
  const windowWidth = useWindowWidth();
  const [selectedSearchOption, setSelectedSearchOption] = useState({
    name: 'Content',
    code: 'content',
    icon: 'pi pi-video',
  });
  const searchOptions = [
    { name: 'Content', code: 'content', icon: 'pi pi-video' },
    { name: 'Community', code: 'community', icon: 'pi pi-users' },
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const op = useRef(null);
  const { ndk, reInitializeNDK } = useNDKContext();
  const searchTimeout = useRef(null);

  const selectedOptionTemplate = (option, props) => {
    if (isDesktopNav) {
      // For desktop nav bar, just show the icon
      return (
        <div className="flex items-center justify-center">
          <i className={option.icon + ' text-white text-lg'} />
        </div>
      );
    }

    if (!props?.placeholder) {
      return (
        <div className="flex items-center">
          <i className={option.icon + ' mr-2'}></i>
          <span>{option.code}</span>
        </div>
      );
    }
    return <i className={option.icon + ' text-transparent text-xs'} />;
  };

  const handleSearch = e => {
    const term = e.target.value;
    setSearchTerm(term);

    // Clear any existing timeout to avoid unnecessary API calls
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set loading state if term length is sufficient
    if (term.length > 2) {
      setIsSearching(true);
    }

    // Set a timeout to avoid searching on each keystroke
    searchTimeout.current = setTimeout(() => {
      if (term.length > 2) {
        if (selectedSearchOption.code === 'content') {
          searchContent(term);
        } else if (selectedSearchOption.code === 'community' && ndk) {
          searchCommunity(term);
        }
      } else {
        setIsSearching(false);
      }
    }, 300);

    if (!isMobileSearch && term.length > 2) {
      op.current.show(e);
    } else if (!isMobileSearch) {
      op.current.hide();
    }
  };

  useEffect(() => {
    if (selectedSearchOption.code === 'content') {
      setSearchResults(contentResults);
    } else if (selectedSearchOption.code === 'community') {
      setSearchResults(communityResults);
    }
    
    // Once we have results, set isSearching to false
    if (searchTerm.length > 2) {
      setIsSearching(false);
    }
  }, [selectedSearchOption, contentResults, communityResults, searchTerm]);

  // Cleanup the timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleError = event => {
      if (event.message && event.message.includes('wss://relay.devs.tools')) {
        console.warn('Nostr relay connection error detected, reinitializing NDK');
        reInitializeNDK();
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [reInitializeNDK]);

  const handleContentSelect = content => {
    if (selectedSearchOption.code === 'content') {
      if (content?.type === 'course') {
        router.push(`/course/${content?.d || content?.id}`);
      } else {
        router.push(`/details/${content.id}`);
      }
    } else if (selectedSearchOption.code === 'community') {
      if (content.type === 'discord') {
        router.push('/feed?channel=discord');
      } else if (content.type === 'nostr') {
        router.push('/feed?channel=nostr');
      } else if (content.type === 'stackernews') {
        router.push('/feed?channel=stackernews');
      } else {
        router.push('/feed?channel=global');
      }
    }

    setSearchTerm('');
    searchContent('');
    searchCommunity('');
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
    if (searchResults.length === 0 && searchTerm.length > 2) {
      return <div className="p-4 text-center text-gray-400">No results found</div>;
    }

    return searchResults.map((item, index) =>
      item.type === 'discord' || item.type === 'nostr' || item.type === 'stackernews' ? (
        <MessageDropdownItem key={index} message={item} onSelect={handleContentSelect} />
      ) : (
        <ContentDropdownItem key={index} content={item} onSelect={handleContentSelect} />
      )
    );
  };

  // When search option changes, trigger search with current term
  const handleSearchOptionChange = e => {
    setSelectedSearchOption(e.value);
    
    // If there's a search term, run the search again with the new option
    if (searchTerm.length > 2) {
      setIsSearching(true);
      if (e.value.code === 'content') {
        searchContent(searchTerm);
      } else if (e.value.code === 'community' && ndk) {
        searchCommunity(searchTerm);
      }
    }
  };

  return (
    <>
      <div className={`${isDesktopNav ? 'w-full max-w-md' : 'w-full'}`}>
        {isDesktopNav ? (
          // Desktop navbar search with integrated dropdown
          <div className="flex items-center bg-gray-900/55 rounded-lg">
            <div className="relative flex-1 flex items-center">
              <i className="pi pi-search text-gray-400 absolute left-4 z-10" />
              <InputText
                className="w-full bg-transparent pl-10"
                value={searchTerm}
                onChange={handleSearch}
                placeholder={`Search ${selectedSearchOption.name.toLowerCase()}`}
                pt={{
                  root: {
                    className: 'border-none focus:ring-0 rounded-lg',
                  },
                }}
              />
            </div>

            <div className="flex items-center px-2 border-l border-gray-700 h-full">
              <Dropdown
                pt={{
                  root: {
                    className: 'border-none bg-transparent',
                  },
                  input: {
                    className: 'mx-0 px-0',
                  },
                  trigger: {
                    className: 'p-0',
                  },
                  panel: {
                    className: 'min-w-[150px]',
                  },
                }}
                value={selectedSearchOption}
                onChange={handleSearchOptionChange}
                options={searchOptions}
                optionLabel="name"
                dropdownIcon={<i className="pi pi-chevron-down text-gray-400 ml-1" />}
                valueTemplate={selectedOptionTemplate}
                itemTemplate={option => (
                  <div className="flex items-center py-1">
                    <i className={option.icon + ' mr-2 text-lg'}></i>
                    <span>{option.name}</span>
                  </div>
                )}
              />
            </div>
          </div>
        ) : (
          // Original search for other views
          <div className={`flex flex-col ${isMobileSearch ? 'gap-4' : ''}`}>
            <div
              className={`relative flex items-center ${isMobileSearch ? 'bg-gray-800 rounded-lg p-2' : ''}`}
            >
              <i className="pi pi-search text-gray-400 absolute left-4 z-10" />
              <InputText
                className={`
                                    ${windowWidth > 845 ? 'w-[300px]' : isMobileSearch || windowWidth <= 600 ? 'w-full' : 'w-[160px]'}
                                    ${isMobileSearch ? 'bg-transparent border-none pl-12 text-lg' : ''}
                                `}
                value={searchTerm}
                onChange={handleSearch}
                placeholder={`Search ${selectedSearchOption.name.toLowerCase()}`}
                pt={{
                  root: {
                    className: `${isMobileSearch ? 'focus:ring-0' : 'border-none rounded-tr-none rounded-br-none focus:border-none focus:ring-0 pr-0'}`,
                  },
                }}
              />
            </div>

            {isMobileSearch && (
              <div className="flex items-center gap-2 mb-3">
                {searchOptions.map(option => (
                  <button
                    key={option.code}
                    onClick={() => handleSearchOptionChange({ value: option })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      selectedSearchOption.code === option.code
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <i className={option.icon} />
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            )}

            {!isMobileSearch && (
              <Dropdown
                pt={{
                  root: {
                    className:
                      'border-none rounded-tl-none rounded-bl-none bg-gray-900/55 hover:bg-gray-900/30',
                  },
                  input: {
                    className: 'mx-0 px-0 shadow-lg',
                  },
                }}
                value={selectedSearchOption}
                onChange={handleSearchOptionChange}
                options={searchOptions}
                optionLabel="name"
                placeholder="Search"
                dropdownIcon={
                  <div className="w-full pr-2 flex flex-row items-center justify-between">
                    <i className={selectedSearchOption.icon + ' text-white'} />
                    <i className="pi pi-chevron-down" />
                  </div>
                }
                valueTemplate={selectedOptionTemplate}
                itemTemplate={selectedOptionTemplate}
                required
              />
            )}
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
      {isMobileSearch && searchTerm.length > 2 && (
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
