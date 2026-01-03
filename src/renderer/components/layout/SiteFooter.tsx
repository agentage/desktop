import { cn } from '../../lib/utils.js';

const APP_VERSION = '0.1.0';
const GITHUB_URL = 'https://github.com/agentage/desktop';
const WEBSITE_URL = 'https://agentage.io';

// External link icon
const ExternalLinkIcon = (): React.JSX.Element => (
  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const openLink = (url: string): void => {
  window.agentage.app.openExternal(url).catch(console.error);
};

/**
 * Application footer component
 * Displays version info and useful links
 */
export const SiteFooter = (): React.JSX.Element => (
  <footer className="flex h-7 items-center justify-between border-t border-border bg-sidebar px-3">
    <span className="text-[10px] text-muted-foreground">Agentage Desktop v{APP_VERSION}</span>
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          openLink(GITHUB_URL);
        }}
        className={cn(
          'flex items-center gap-1 text-[10px] text-muted-foreground',
          'hover:text-foreground transition-colors',
          'focus:outline-none focus:text-foreground'
        )}
      >
        <span>GitHub</span>
        <ExternalLinkIcon />
      </button>
      <button
        onClick={() => {
          openLink(WEBSITE_URL);
        }}
        className={cn(
          'flex items-center gap-1 text-[10px] text-muted-foreground',
          'hover:text-foreground transition-colors',
          'focus:outline-none focus:text-foreground'
        )}
      >
        <span>Website</span>
        <ExternalLinkIcon />
      </button>
    </div>
  </footer>
);
