import type { ToolHandler } from '../types.js';

interface WebSearchInput {
  query: string;
  limit?: number;
  region?: string;
  timeRange?: 'd' | 'w' | 'm' | 'y';
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface WebSearchOutput {
  results: WebSearchResult[];
  query: string;
}

/**
 * DuckDuckGo HTML endpoint
 */
const DUCKDUCKGO_URL = 'https://html.duckduckgo.com/html/';

/**
 * Maximum number of results to return
 */
const MAX_RESULTS = 20;

/**
 * Parse DuckDuckGo HTML response to extract search results
 */
const parseDuckDuckGoResults = async (html: string, limit: number): Promise<WebSearchResult[]> => {
  // Using linkedom instead of jsdom to avoid ESM/CJS compatibility issues
  const { parseHTML } = await import('linkedom');
  const { document: doc } = parseHTML(html);

  const results: WebSearchResult[] = [];
  const resultElements = doc.querySelectorAll('.result');

  for (const resultEl of Array.from(resultElements).slice(0, limit)) {
    const linkEl = resultEl.querySelector<HTMLAnchorElement>('.result__a');
    const snippetEl = resultEl.querySelector('.result__snippet');

    if (!linkEl) continue;

    // DuckDuckGo wraps URLs in redirect, extract actual URL
    const href = linkEl.getAttribute('href') ?? '';
    let url: string;

    try {
      const urlObj = new URL(href, DUCKDUCKGO_URL);
      const uddg = urlObj.searchParams.get('uddg');
      url = uddg ? decodeURIComponent(uddg) : href;
    } catch {
      url = href;
    }

    // Skip ad results and internal links
    if (url.includes('duckduckgo.com') || !url.startsWith('http')) {
      continue;
    }

    const titleText = linkEl.textContent;
    const snippetText = snippetEl?.textContent;
    results.push({
      title: titleText ? titleText.trim() : '',
      url,
      snippet: snippetText ? snippetText.trim() : '',
    });
  }

  return results;
};

/**
 * Search the web using DuckDuckGo
 * Returns list of URLs with titles and snippets
 */
export const handler: ToolHandler<WebSearchInput, WebSearchOutput> = async (input) => {
  const limit = Math.min(input.limit ?? 10, MAX_RESULTS);

  const formData = new URLSearchParams({
    q: input.query,
    kl: input.region ?? 'wt-wt', // worldwide by default
  });

  // Add time range filter if specified
  if (input.timeRange) {
    formData.append('df', input.timeRange);
  }

  const res = await fetch(DUCKDUCKGO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Agentage-Desktop/1.0',
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${String(res.status)} ${res.statusText}`);
  }

  const html = await res.text();
  const results = await parseDuckDuckGoResults(html, limit);

  return { results, query: input.query };
};
