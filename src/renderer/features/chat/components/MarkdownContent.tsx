import MarkdownIt from 'markdown-it';
import { memo, useMemo } from 'react';

// Single markdown-it instance, reused across renders
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
});

interface MarkdownContentProps {
  content: string;
}

/**
 * Simple markdown renderer using markdown-it
 * Renders basic markdown: bold, italic, code, links, lists
 */
export const MarkdownContent = memo(({ content }: MarkdownContentProps): React.JSX.Element => {
  const html = useMemo(() => md.render(content), [content]);

  return (
    <div
      className="markdown-content text-xs leading-relaxed [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_h1]:text-sm [&_h1]:font-bold [&_h1]:my-1.5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:my-1.5 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:my-1 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:my-1 [&_li]:pl-1 [&_pre]:my-1 [&_pre]:p-2 [&_pre]:rounded [&_pre]:bg-background/50 [&_pre]:overflow-x-auto [&_pre]:text-[11px] [&_code]:text-[11px] [&_code]:font-mono [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-background/50 [&_a]:text-primary [&_a:hover]:underline [&_strong]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-2 [&_blockquote]:my-1 [&_blockquote]:italic [&_hr]:my-2 [&_hr]:border-border"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

MarkdownContent.displayName = 'MarkdownContent';
