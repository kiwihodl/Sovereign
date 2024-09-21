import { useQuery } from '@tanstack/react-query';
import { getAllCommits } from '@/lib/github';

export function useFetchGithubCommits(username) {
  const fetchCommits = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const commits = [];
    for await (const commit of getAllCommits(username, sixMonthsAgo)) {
      commits.push(commit);
    }
    return commits;
  };

  return useQuery({
    queryKey: ['githubCommits', username],
    queryFn: fetchCommits,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 30, // 30 minutes
  });
}