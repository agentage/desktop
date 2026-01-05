import { useEffect, useRef, useState } from 'react';
import { ChatPage, type ChatPageHandle } from '../pages/index.js';
import { InfoPanel, Sidebar, SiteFooter, TitleBar } from './components/index.js';

// Mobile breakpoint (matches Tailwind's 'md')
const MOBILE_BREAKPOINT = 768;

/**
 * Main application layout for authenticated users
 *
 * Structure: TitleBar (top) + Sidebar (left) + ChatPage (center) + InfoPanel (right)
 * Chat is the primary interface, InfoPanel shows contextual info from navigation
 * Sidebar auto-collapses on mobile screens
 */
export const AppLayout = (): React.JSX.Element => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [infoPanelTitle, setInfoPanelTitle] = useState('Info');
  const chatPageRef = useRef<ChatPageHandle>(null);

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

  const handleNewChat = (): void => {
    // Clear the current conversation
    chatPageRef.current?.clearChat();
  };

  const handleLoadConversation = (conversationId: string): void => {
    // Load the conversation in the chat page
    void chatPageRef.current?.loadConversation(conversationId);
  };

  const handleNavigate = (title: string): void => {
    // Update info panel title based on navigation
    setInfoPanelTitle(title);
    // Open info panel when navigating
    if (!isInfoPanelOpen) {
      setIsInfoPanelOpen(true);
    }
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
          onChatToggle={handleNewChat}
          onLoadConversation={handleLoadConversation}
          onNavigate={handleNavigate}
        />

        {/* Chat page - primary interface */}
        <ChatPage
          ref={chatPageRef}
          onToggleInfoPanel={toggleInfoPanel}
          onToggleSidebar={toggleSidebar}
          isInfoPanelOpen={isInfoPanelOpen}
        />

        {/* Info panel on the right - contextual info from navigation */}
        <InfoPanel
          isOpen={isInfoPanelOpen}
          onClose={toggleInfoPanel}
          title={infoPanelTitle}
        />
      </main>

      {/* Footer at bottom - full width */}
      <SiteFooter />
    </div>
  );
};
