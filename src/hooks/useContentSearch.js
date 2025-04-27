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
        // Search in title/name
        const searchableTitle = (content?.title || content?.name || '').toLowerCase();
        if (searchableTitle.includes(searchTerm)) return true;
        
        // Search in summary/description
        const searchableDescription = (
          content?.summary ||
          content?.description ||
          ''
        ).toLowerCase();
        if (searchableDescription.includes(searchTerm)) return true;
        
        // Search in topics/tags
        const topics = content?.topics || [];
        return topics.some(topic => topic.toLowerCase().includes(searchTerm));
      });
      
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  return { searchContent, searchResults };
};
