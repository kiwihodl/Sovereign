import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export function useDraftsQuery() {
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session]);

  const fetchDraftsDB = async () => {
    try {
      if (!user?.id) {
        return [];
      }
      const response = await axios.get(`/api/drafts/all/${user.id}`);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching drafts from DB:', error);
      return [];
    }
  };

  const { data: drafts, isLoading: draftsLoading, error: draftsError, refetch: refetchDrafts } = useQuery({
    queryKey: ['drafts', isClient, user?.id],
    queryFn: fetchDraftsDB,
    enabled: isClient && !!user?.id,
  });

  return { drafts, draftsLoading, draftsError, refetchDrafts };
}
