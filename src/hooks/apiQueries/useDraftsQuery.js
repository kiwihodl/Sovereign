import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocalStorageWithEffect } from '@/hooks/useLocalStorage';

export function useDraftsQuery() {
  const [isClient, setIsClient] = useState(false);
  const [user] = useLocalStorageWithEffect('user', {});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchDraftsDB = async () => {
    try {
      if (!user.id) {
        return [];
      }
      const response = await axios.get(`/api/drafts/all/${user.id}`);
      const drafts = response.data;
      console.log('drafts:', drafts);
      return drafts;
    } catch (error) {
      console.error('Error fetching drafts from DB:', error);
      return [];
    }
  };

  const { data: drafts, isLoading: draftsLoading, error: draftsError, refetch: refetchDrafts } = useQuery({
    queryKey: ['drafts', isClient],
    queryFn: fetchDraftsDB,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 30, // 30 minutes
    enabled: isClient && !!user.id, // Only enable if client-side and user ID is available
  });

  return { drafts, draftsLoading, draftsError, refetchDrafts };
}
