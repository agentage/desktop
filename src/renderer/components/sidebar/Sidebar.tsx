import { useLocation, useNavigate } from 'react-router-dom';
import { navigationConfig } from '../../config/navigation.config.js';
import { cn } from '../../lib/utils.js';
import { NavUser } from './NavUser.js';
import { WorkspaceSwitcher } from './WorkspaceSwitcher.js';

// Icon components for navigation
const icons: Record<string, React.JSX.Element> = {
  home: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  bot: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  ),
  'list-checks': (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  ),
  wrench: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  brain: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  ),
  key: (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  ),
  'file-text': (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  ),
  'message-square': (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const NavIcon = ({ name }: { name: string }): React.JSX.Element | null => icons[name] ?? null;

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onChatToggle?: () => void;
}

/**
 * Left sidebar navigation component
 *
 * Purpose: Main navigation for the application
 * Features:
 *   - Workspace switcher at top
 *   - Navigation groups from config
 *   - User section at bottom
 *   - Collapsible via external toggle (SiteHeader)
 */
export const Sidebar = ({ isCollapsed = false, onChatToggle }: SidebarProps): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavItemClick = (path: string): void => {
    // Handle special paths like #chat
    if (path === '#chat') {
      onChatToggle?.();
      return;
    }
    void navigate(path);
  };

  const isActive = (path: string): boolean => {
    if (path === '#chat') return false;
    return location.pathname === path;
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border',
        'transition-all duration-200 select-none',
        isCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Header - Workspace Switcher */}
      <div className="border-b border-sidebar-border p-2">
        <WorkspaceSwitcher isCollapsed={isCollapsed} />
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-2">
        {navigationConfig.groups.map((group) => (
          <div key={group.id} className="px-2 py-1">
            {group.label && !isCollapsed && (
              <div className="pl-4 pr-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <nav className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavItemClick(item.path);
                  }}
                  disabled={item.disabled}
                  title={isCollapsed ? item.title : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-md py-1.5 text-xs',
                    isCollapsed ? 'px-2' : 'pl-4 pr-2',
                    'transition-colors',
                    'focus:outline-none',
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <NavIcon name={item.icon} />
                  {!isCollapsed && item.title}
                  {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
                    <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer - User */}
      <div className="border-t border-sidebar-border p-2">
        <NavUser isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};
