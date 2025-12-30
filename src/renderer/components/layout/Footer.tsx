const APP_VERSION = '0.1.0';
const GITHUB_URL = 'https://github.com/agentage/desktop';
const WEBSITE_URL = 'https://agentage.io';

const openLink = (url: string): void => {
  window.agentage.app.openExternal(url).catch(console.error);
};

/**
 * Application footer component
 * Displays version info and useful links
 */
export const Footer = (): React.JSX.Element => (
  <footer className="flex h-8 items-center justify-between border-t border-border bg-card px-4 text-xs text-muted-foreground">
    <span>Agentage Desktop v{APP_VERSION}</span>
    <div className="flex items-center gap-4">
      <button
        onClick={() => {
          openLink(GITHUB_URL);
        }}
        className="hover:text-foreground transition-colors"
      >
        GitHub
      </button>
      <button
        onClick={() => {
          openLink(WEBSITE_URL);
        }}
        className="hover:text-foreground transition-colors"
      >
        Website
      </button>
    </div>
  </footer>
);
