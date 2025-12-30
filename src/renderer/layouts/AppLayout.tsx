import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer, Sidebar, SiteHeader, TitleBar } from '../components/index.js';

// Mobile breakpoint (matches Tailwind's 'md')
const MOBILE_BREAKPOINT = 768;

/**
 * Main application layout for authenticated users
 *
 * Structure: TitleBar (top) + Sidebar (left) + Content area (right)
 * Contains the main navigation and content rendering area
 * Sidebar auto-collapses on mobile screens
 */
export const AppLayout = (): React.JSX.Element => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleSidebar = (): void => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Title bar at top */}
      <TitleBar title="" showLogo={true} dark={true} />

      {/* Main content area: sidebar + content */}
      <main className="flex flex-1 overflow-hidden">
        <Sidebar isCollapsed={isSidebarCollapsed || isMobile} onToggle={toggleSidebar} />

        {/* Content area */}
        <section className="flex flex-1 flex-col overflow-hidden">
          {/* Site header with breadcrumbs */}
          <SiteHeader onToggleSidebar={toggleSidebar} />

          {/* Main content */}
          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </section>
      </main>

      {/* Footer at bottom - full width */}
      <Footer />
    </div>
  );
};
