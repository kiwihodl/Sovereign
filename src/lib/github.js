const { Octokit } = require("@octokit/rest");
const { throttling } = require("@octokit/plugin-throttling");
const ThrottledOctokit = Octokit.plugin(throttling);

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_GITHUB_ACCESS_KEY;

const octokit = new ThrottledOctokit({
  auth: ACCESS_TOKEN,
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

async function getContributions(username, updateCallback) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sinceDate = sixMonthsAgo.toISOString();

  const contributionData = {};

  try {
    const repos = await octokit.paginate(octokit.repos.listForUser, {
      username,
      per_page: 100,
    });

    console.log(`Fetched ${repos.length} repositories for ${username}`);

    // Call updateCallback immediately after fetching repos
    updateCallback({});

    for (const repo of repos) {
      console.log(`Fetching commits for ${repo.name}`);
      try {
        const commits = await octokit.paginate(octokit.repos.listCommits, {
          owner: repo.owner.login,
          repo: repo.name,
          author: username,
          since: sinceDate,
          per_page: 100,
        });

        console.log(`Fetched ${commits.length} commits for ${repo.name}`);

        commits.forEach(commit => {
          const date = commit.commit.author.date.split('T')[0];
          contributionData[date] = (contributionData[date] || 0) + 1;
          // Call the update callback after processing each commit
          updateCallback({...contributionData});
        });
      } catch (repoError) {
        console.error(`Error fetching commits for ${repo.name}:`, repoError.message);
      }
    }

    console.log('Final contribution data:', contributionData);
    return contributionData;
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    throw error;
  }
}

export { getContributions };

