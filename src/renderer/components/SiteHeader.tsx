import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils.js';

// Panel Left icon
const PanelLeftIcon = (): React.JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

interface SiteHeaderProps {
  onToggleSidebar?: () => void;
}

/**
 * Site header with breadcrumb navigation
 * Displays current page title based on route
 */
export const SiteHeader = ({ onToggleSidebar }: SiteHeaderProps): React.JSX.Element => {
  const location = useLocation();

  // Get page title from path
  const getPageTitle = (): string => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/agents') return 'Agents';
    if (path.startsWith('/agent/')) return 'Agent Details';
    if (path === '/tasks') return 'Tasks';
    if (path === '/tools') return 'Tools';
    if (path === '/models') return 'Models';
    if (path === '/secrets') return 'Secrets';
    if (path === '/context') return 'Context';
    if (path === '/settings') return 'Settings';
    if (path === '/help') return 'Help';
    if (path === '/account') return 'Account';
    return 'Page';
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-sidebar px-4">
      <button
        onClick={onToggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-md -ml-1',
          'text-muted-foreground transition-colors',
          'hover:bg-accent hover:text-foreground'
        )}
      >
        <PanelLeftIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>
      <div className="mx-2 h-4 w-px bg-border" />
      <h1 className="text-sm font-medium text-foreground">{getPageTitle()}</h1>
    </header>
  );
};
