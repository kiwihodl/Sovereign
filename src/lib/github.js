import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";

const ThrottledOctokit = Octokit.plugin(throttling);

const octokit = new ThrottledOctokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_ACCESS_KEY,
  throttle: {
    onRateLimit: (retryAfter, options, octokit, retryCount) => {
      octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
      if (retryCount < 2) {
        octokit.log.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      octokit.log.warn(`Secondary rate limit hit for request ${options.method} ${options.url}`);
      return true;
    },
  },
});

export async function* getAllCommits(username, since) {
    let page = 1;

    while (true) {
        try {
            const { data: repos } = await octokit.repos.listForUser({
                username,
                per_page: 100,
                page,
            });

            if (repos.length === 0) break;

            const repoPromises = repos.map(repo => 
                octokit.repos.listCommits({
                    owner: username,
                    repo: repo.name,
                    since: since.toISOString(),
                    per_page: 100,
                })
            );

            const repoResults = await Promise.allSettled(repoPromises);

            for (const result of repoResults) {
                if (result.status === 'fulfilled') {
                    for (const commit of result.value.data) {
                        yield commit;
                    }
                } else {
                    console.warn(`Error fetching commits: ${result.reason}`);
                }
            }

            page++;
        } catch (error) {
            console.error("Error fetching repositories:", error.message);
            break;
        }
    }
}

