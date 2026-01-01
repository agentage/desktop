import type { ToolHandler } from '../types.js';

interface FetchUrlInput {
  url: string;
}

type FetchUrlOutput = string | Record<string, unknown>;

/**
 * Fetch content from a URL
 * Returns JSON if content-type is application/json, otherwise text
 */
export const handler: ToolHandler<FetchUrlInput, FetchUrlOutput> = async (input) => {
  const res = await fetch(input.url, {
    headers: {
      'User-Agent': 'Agentage-Desktop',
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${String(res.status)} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await res.json()) as Record<string, unknown>;
  }

  return res.text();
};
