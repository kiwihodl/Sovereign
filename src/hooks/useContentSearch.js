import { useState, useEffect } from 'react';
import { useContentIdsQuery } from '@/hooks/apiQueries/useContentIdsQuery';
import { useNDKContext } from '@/context/NDKContext';
import { parseEvent, parseCourseEvent } from '@/utils/nostr';
import appConfig from '@/config/appConfig';

export const useContentSearch = () => {
  const [allContent, setAllContent] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const { contentIds } = useContentIdsQuery();
  const { ndk } = useNDKContext();

  const fetchAllEvents = async ids => {
    try {
      await ndk.connect();
      const filter = {
        authors: appConfig.authorPubkeys,
        kinds: [30004, 30023, 30402],
        '#d': ids,
      };
      const events = await ndk.fetchEvents(filter);

      const parsedEvents = [];
      events.forEach(event => {
        let parsed;
        if (event.kind === 30004) {
          parsed = parseCourseEvent(event);
        } else {
          parsed = parseEvent(event);
        }
        parsedEvents.push(parsed);
      });
      setAllContent(parsedEvents);
    } catch (error) {
      console.error('error', error);
    }
  };

  useEffect(() => {
    if (contentIds) {
      fetchAllEvents(contentIds);
    }
  }, [contentIds]);

  const searchContent = term => {
    if (term.length > 2) {
      const searchTerm = term.toLowerCase();
      const filtered = allContent.filter(content => {
        // Prepare fields to search in
        const searchableTitle = (content?.title || content?.name || '').toLowerCase();
        const searchableDescription = (content?.summary || content?.description || '').toLowerCase();
        
        // Find matches in title
        const titleMatch = searchableTitle.includes(searchTerm);
        
        // Find matches in description
        const descriptionMatch = searchableDescription.includes(searchTerm);
        
        // Store match information (only for title and description)
        if (titleMatch || descriptionMatch) {
          content._matches = {
            title: titleMatch ? {
              text: content?.title || content?.name || '',
              term: searchTerm
            } : null,
            description: descriptionMatch ? {
              text: content?.summary || content?.description || '',
              term: searchTerm
            } : null
          };
          return true;
        }
        
        return false;
      });
      
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  return { searchContent, searchResults };
};
