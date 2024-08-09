import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export function useDraftsQuery() {
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  }, [session]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchDraftsDB = async () => {
    try {
        let allDrafts = [];
      if (!user.id) {
        return [];
      }
      const response = await axios.get(`/api/drafts/all/${user.id}`);
      if (response.status === 200) {
        allDrafts = response.data;
        const courseDrafts = await fetchCourseDrafts();
        allDrafts = [...allDrafts, ...courseDrafts];
      }
      return allDrafts;
    } catch (error) {
      console.error('Error fetching drafts from DB:', error);
      return [];
    }
  };

  const fetchCourseDrafts = async () => {
    try {
      const response = await axios.get(`/api/courses/drafts/${user.id}/all`);
      const drafts = response.data;
      console.log('drafts:', drafts);
      return drafts;
    } catch (error) {
      console.error('Error fetching course drafts from DB:', error);
      return [];
    }
  };

  const { data: drafts, isLoading: draftsLoading, error: draftsError, refetch: refetchDrafts } = useQuery({
    queryKey: ['drafts', isClient],
    queryFn: fetchDraftsDB,
    // staleTime: 1000 * 60 * 30, // 30 minutes
    // refetchInterval: 1000 * 60 * 30, // 30 minutes
    enabled: isClient && !!user.id, // Only enable if client-side and user ID is available
  });

  return { drafts, draftsLoading, draftsError, refetchDrafts };
}
