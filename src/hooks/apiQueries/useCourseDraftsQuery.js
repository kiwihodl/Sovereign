import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export function useCourseDraftsQuery() {
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

  const fetchCourseDrafts = async () => {
    try {
      if (!user?.id) {
        return [];
      }
      const response = await axios.get(`/api/courses/drafts/${user.id}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course drafts:', error);
      return [];
    }
  };

  const { 
    data: courseDrafts, 
    isLoading: courseDraftsLoading, 
    error: courseDraftsError, 
    refetch: refetchCourseDrafts 
  } = useQuery({
    queryKey: ['courseDrafts', isClient],
    queryFn: fetchCourseDrafts,
    enabled: isClient && !!user?.id, // Only enable if client-side and user ID is available
  });

  return { courseDrafts, courseDraftsLoading, courseDraftsError, refetchCourseDrafts };
}
