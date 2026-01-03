import type { ToolHandler } from '../types.js';

interface FetchUrlInput {
  url: string;
}

interface FetchUrlOutput {
  title: string;
  content: string;
  url: string;
  byline?: string;
  excerpt?: string;
  truncated: boolean;
}

/**
 * Maximum content length to prevent context window exhaustion (~12k tokens)
 */
const MAX_CONTENT_LENGTH = 50000;

/**
 * Fetch content from a URL and extract clean, readable text
 * Uses Mozilla Readability for content extraction
 */
export const handler: ToolHandler<FetchUrlInput, FetchUrlOutput> = async (input) => {
  const res = await fetch(input.url, {
    headers: {
      'User-Agent': 'Agentage-Desktop/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${String(res.status)} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') ?? '';

  // Handle JSON responses directly
  if (contentType.includes('application/json')) {
    const json = (await res.json()) as Record<string, unknown>;
    const content = JSON.stringify(json, null, 2);
    return {
      title: 'JSON Response',
      content: content.slice(0, MAX_CONTENT_LENGTH),
      url: input.url,
      truncated: content.length > MAX_CONTENT_LENGTH,
    };
  }

  const html = await res.text();

  // Dynamic imports for Electron ESM compatibility
  // Using linkedom instead of jsdom to avoid ESM/CJS compatibility issues
  const [{ parseHTML }, { Readability }] = await Promise.all([
    import('linkedom'),
    import('@mozilla/readability'),
  ]);

  const { document } = parseHTML(html);
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article) {
    // Fallback: return truncated raw text
    const text = document.body.textContent;
    const cleanText = text.replace(/\s+/g, ' ').trim();
    return {
      title: document.title,
      content: cleanText.slice(0, MAX_CONTENT_LENGTH),
      url: input.url,
      truncated: cleanText.length > MAX_CONTENT_LENGTH,
    };
  }

  const content = article.textContent ?? '';
  return {
    title: article.title ?? '',
    content: content.slice(0, MAX_CONTENT_LENGTH),
    url: input.url,
    byline: article.byline ?? undefined,
    excerpt: article.excerpt ?? undefined,
    truncated: content.length > MAX_CONTENT_LENGTH,
  };
};
