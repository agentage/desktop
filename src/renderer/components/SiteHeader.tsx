import { useLocation } from 'react-router-dom';

/**
 * Site header with breadcrumb navigation
 * Displays current page title based on route
 */
export const SiteHeader = (): React.JSX.Element => {
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
      <div className="h-4 w-px bg-border" />
      <h1 className="text-sm font-medium text-foreground">{getPageTitle()}</h1>
    </header>
  );
};
