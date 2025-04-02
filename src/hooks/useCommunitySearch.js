import { useState, useEffect } from 'react';
import { useDiscordQuery } from '@/hooks/communityQueries/useDiscordQuery';
import { useCommunityNotes } from '@/hooks/nostr/useCommunityNotes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchStackerNews = async () => {
  const response = await axios.get('/api/stackernews');
  return response.data.data.items.items;
};

export const useCommunitySearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const { data: discordData } = useDiscordQuery({ page: 1 });
  const { communityNotes: nostrData } = useCommunityNotes();
  const { data: stackerNewsData } = useQuery({
    queryKey: ['stackerNews'],
    queryFn: fetchStackerNews,
  });

  const searchCommunity = term => {
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }

    const lowercaseTerm = term.toLowerCase();

    const filteredDiscord = (discordData || [])
      .filter(message => message.content.toLowerCase().includes(lowercaseTerm))
      .map(message => ({ ...message, type: 'discord' }));

    const filteredNostr = (nostrData || [])
      .filter(message => message.content.toLowerCase().includes(lowercaseTerm))
      .map(message => ({ ...message, type: 'nostr' }));

    const filteredStackerNews = (stackerNewsData || [])
      .filter(item => item.title.toLowerCase().includes(lowercaseTerm))
      .map(item => ({ ...item, type: 'stackernews' }));

    const combinedResults = [...filteredDiscord, ...filteredNostr, ...filteredStackerNews].sort(
      (a, b) => {
        const dateA =
          a.type === 'nostr' ? a.created_at * 1000 : new Date(a.timestamp || a.createdAt);
        const dateB =
          b.type === 'nostr' ? b.created_at * 1000 : new Date(b.timestamp || b.createdAt);
        return dateB - dateA;
      }
    );

    setSearchResults(combinedResults);
  };

  return { searchCommunity, searchResults };
};
