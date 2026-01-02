import type { ToolHandler } from '../types.js';

interface SearchGithubInput {
  query: string;
  limit?: number;
}

interface RepoResult {
  name: string;
  stars: number;
  url: string;
  description: string | null;
}

/**
 * Search GitHub repositories by query
 */
export const handler: ToolHandler<SearchGithubInput, RepoResult[]> = async (input) => {
  const limit = input.limit ?? 10;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(input.query)}&per_page=${String(limit)}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Agentage-Desktop',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${String(res.status)} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    items: {
      full_name: string;
      stargazers_count: number;
      html_url: string;
      description: string | null;
    }[];
  };

  return data.items.map((repo) => ({
    name: repo.full_name,
    stars: repo.stargazers_count,
    url: repo.html_url,
    description: repo.description,
  }));
};
