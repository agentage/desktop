import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SiteHeader, TitleBar } from '../components/index.js';

/**
 * Main application layout for authenticated users
 *
 * Structure: TitleBar (top) + Sidebar (left) + Content area (right)
 * Contains the main navigation and content rendering area
 */
export const AppLayout = (): React.JSX.Element => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = (): void => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Title bar at top */}
      <TitleBar title="" showLogo={true} dark={true} />

      {/* Main content area: sidebar + content */}
      <main className="flex flex-1 overflow-hidden">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

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
    </div>
  );
};
