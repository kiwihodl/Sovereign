import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useContentIdsQuery() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchContentIdsDB = async () => {
    try {
      const response = await axios.get(`/api/content/all`);
      const contentIds = response.data;
      return contentIds;
    } catch (error) {
      console.error('Error fetching contentIds from DB:', error);
      return [];
    }
  };

  const { data: contentIds, isLoading: contentIdsLoading, error: contentIdsError, refetch: refetchContentIds } = useQuery({
    queryKey: ['contentIds', isClient],
    queryFn: fetchContentIdsDB,
    // staleTime: 1000 * 60 * 30, // 30 minutes
    // refetchInterval: 1000 * 60 * 30, // 30 minutes
    enabled: isClient
  });

  return { contentIds, contentIdsLoading, contentIdsError, refetchContentIds };
}
