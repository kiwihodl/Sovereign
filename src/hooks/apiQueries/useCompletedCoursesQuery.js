import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export function useCompletedCoursesQuery() {
  const { data: session } = useSession();
  const [retryCount, setRetryCount] = useState(0);

  const fetchCompletedCourses = async () => {
    if (!session?.user?.id) return [];
    
    try {
      const response = await axios.get('/api/courses/completed', {
        params: {
          userId: session.user.id
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching completed courses:', error);
      throw error; // Let React Query handle the retry
    }
  };

  return useQuery({
    queryKey: ['completedCourses', session?.user?.id],
    queryFn: fetchCompletedCourses,
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}