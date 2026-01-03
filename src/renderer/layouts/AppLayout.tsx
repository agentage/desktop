import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import type { WidgetPlacement } from '../../shared/types/widget.types.js';
import { ChatPanel } from '../features/chat/index.js';
import { Sidebar, SiteFooter, SiteHeader, TitleBar } from './components/index.js';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingWidgetOrder, setPendingWidgetOrder] = useState<WidgetPlacement[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccessTrigger, setSaveSuccessTrigger] = useState(0);
  const location = useLocation();

  // Check if we're on the dashboard page
  const isDashboard = location.pathname === '/';

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

  const toggleChat = (): void => {
    setIsChatOpen((prev) => !prev);
  };

  const toggleEditMode = (): void => {
    setIsEditMode((prev) => !prev);
  };

  const handleLayoutChange = (widgets: WidgetPlacement[], hasChanges: boolean): void => {
    setPendingWidgetOrder(widgets);
    setHasChanges(hasChanges);
  };

  const handleSaveLayout = async (): Promise<void> => {
    try {
      await window.agentage.widgets.saveLayout('home', pendingWidgetOrder);
      setSaveSuccessTrigger((prev) => prev + 1);
      setIsEditMode(false);
      setHasChanges(false);
      // Optionally show a success message
      console.log('Layout saved successfully');
    } catch (error) {
      console.error('Failed to save layout:', error);
      // Optionally show an error message
    }
  };

  const handleSaveLayoutClick = (): void => {
    void handleSaveLayout();
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Title bar at top */}
      <TitleBar title="" showLogo={true} dark={true} />

      {/* Main content area: sidebar + content + chat panel */}
      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed || isMobile}
          onToggle={toggleSidebar}
          onChatToggle={toggleChat}
        />

        {/* Content area */}
        <section className="flex flex-1 flex-col overflow-hidden">
          {/* Site header with breadcrumbs */}
          <SiteHeader
            onToggleSidebar={toggleSidebar}
            isEditMode={isEditMode}
            onEditModeToggle={toggleEditMode}
            onSaveLayout={handleSaveLayoutClick}
            showEditButton={isDashboard}
            hasChanges={hasChanges}
          />

          {/* Main content */}
          <div className="flex-1 overflow-auto p-6">
            <Outlet
              context={{ isEditMode, onLayoutChange: handleLayoutChange, saveSuccessTrigger }}
            />
          </div>
        </section>

        {/* Chat panel on the right */}
        <ChatPanel isOpen={isChatOpen} onClose={toggleChat} />
      </main>

      {/* Footer at bottom - full width */}
      <SiteFooter />
    </div>
  );
};
