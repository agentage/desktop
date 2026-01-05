import { useEffect, useState } from 'react';
import { ChatPage } from '../pages/ChatPage.js';
import { InfoPanel } from '../features/info/index.js';
import { Sidebar, SiteFooter, TitleBar } from './components/index.js';

// Mobile breakpoint (matches Tailwind's 'md')
const MOBILE_BREAKPOINT = 768;

/**
 * Main application layout for authenticated users
 *
 * Structure: TitleBar (top) + Sidebar (left) + Chat Page (center) + Info Panel (right)
 * Contains the main navigation and chat interface with contextual info panel
 * Sidebar auto-collapses on mobile screens
 */
export const AppLayout = (): React.JSX.Element => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);

  // Handle responsive sidebar collapse
  useEffect(() => {
    const checkMobile = (): void => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return (): void => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleSidebar = (): void => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleInfoPanel = (): void => {
    setIsInfoPanelOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Title bar at top */}
      <TitleBar title="" showLogo={true} dark={true} />

      {/* Main content area: sidebar + chat page + info panel */}
      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed || isMobile}
          onToggle={toggleSidebar}
          onInfoPanelToggle={toggleInfoPanel}
        />

        {/* Chat page as main content */}
        <section className="flex flex-1 flex-col overflow-hidden">
          <ChatPage />
        </section>

        {/* Info panel on the right */}
        <InfoPanel isOpen={isInfoPanelOpen} onClose={toggleInfoPanel} />
      </main>

      {/* Footer at bottom - full width */}
      <SiteFooter />
    </div>
  );
};
