/**
 * Mock for linkedom module
 * Required for Jest tests that use HTML parsing
 */

interface MockElement {
  textContent: string | null;
  getAttribute: (name: string) => string | null;
  querySelector: <T>(selector: string) => T | null;
  querySelectorAll: (selector: string) => MockElement[];
}

interface MockDocument {
  title: string;
  body: MockElement | null;
  querySelectorAll: (selector: string) => MockElement[];
}

interface ParseHTMLResult {
  document: MockDocument;
}

/**
 * Parse HTML string into a mock document
 */
export const parseHTML = (html: string): ParseHTMLResult => {
  // Extract title from HTML
  const titleMatch = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  const title = titleMatch ? titleMatch[1] : 'Mock Title';

  // Extract text content (strip HTML tags)
  const textContent = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const mockElement: MockElement = {
    textContent,
    getAttribute: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
  };

  return {
    document: {
      title,
      body: mockElement,
      querySelectorAll: () => [],
    },
  };
};
