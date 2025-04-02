import { useQuery } from '@tanstack/react-query';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';

const ThrottledOctokit = Octokit.plugin(throttling);

export function useFetchGithubRepos(accessToken) {
  return useQuery({
    queryKey: ['githubRepos', accessToken],
    queryFn: async () => {
      if (!accessToken) {
        console.log('No access token provided');
        return [];
      }

      try {
        const octokit = new ThrottledOctokit({
          auth: accessToken,
          throttle: {
            onRateLimit: (retryAfter, options, octokit, retryCount) => {
              console.log(`Rate limit exceeded, retrying after ${retryAfter} seconds`);
              if (retryCount < 2) return true;
              return false;
            },
            onSecondaryRateLimit: (retryAfter, options, octokit) => {
              console.log(`Secondary rate limit hit, retrying after ${retryAfter} seconds`);
              return true;
            },
          },
        });

        console.log('Fetching repositories...');
        const { data } = await octokit.repos.listForAuthenticatedUser({
          sort: 'updated',
          per_page: 100,
        });
        console.log(`Found ${data.length} repositories`);

        return data.map(repo => ({
          id: repo.id,
          name: repo.name,
          html_url: repo.html_url,
        }));
      } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!accessToken,
    retry: 3,
  });
}
