import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNDKContext } from '@/context/NDKContext';

export function useAllContentQuery({ids}) {
    const [isClient, setIsClient] = useState(false);
    const ndk = useNDKContext();

    useEffect(() => {
        setIsClient(true);
    }, []);

const fetchAllContentFromNDK = async (ids) => {
  try {
      console.log('Fetching all content from NDK');
      await ndk.connect();

      const filter = { ids: ids };
      const events = await ndk.fetchEvents(filter);

      if (events && events.size > 0) {
          const eventsArray = Array.from(events);
          return eventsArray;
      }
      return [];
  } catch (error) {
      console.error('Error fetching workshops from NDK:', error);
      return [];
  }
};

const { data: allContent, isLoading: allContentLoading, error: allContentError, refetch: refetchAllContent } = useQuery({
    queryKey: ['allContent', isClient],
    queryFn: () => fetchAllContentFromNDK(ids),
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 30, // 30 minutes
    enabled: isClient,
  })

  return { allContent, allContentLoading, allContentError, refetchAllContent }
}