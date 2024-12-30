import { useQuery } from '@tanstack/react-query';
import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";

const ThrottledOctokit = Octokit.plugin(throttling);

export function useFetchGithubRepos(accessToken) {
  return useQuery({
    queryKey: ['githubRepos', accessToken],
    queryFn: async () => {
      if (!accessToken) return [];
      
      const octokit = new ThrottledOctokit({
        auth: accessToken,
        throttle: {
          onRateLimit: (retryAfter, options, octokit, retryCount) => {
            if (retryCount < 2) return true;
          },
          onSecondaryRateLimit: (retryAfter, options, octokit) => true,
        },
      });

      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100
      });

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!accessToken
  });
}