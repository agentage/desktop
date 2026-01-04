import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChatPanel, type ChatPanelHandle } from '../features/chat/index.js';
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
  const chatPanelRef = useRef<ChatPanelHandle>(null);

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

  const handleNewChat = (): void => {
    // Clear the current conversation
    chatPanelRef.current?.clearChat();
    // Open the chat panel
    setIsChatOpen(true);
  };

  const handleLoadConversation = (conversationId: string): void => {
    // Load the conversation in the chat panel
    void chatPanelRef.current?.loadConversation(conversationId);
    // Open the chat panel if not already open
    if (!isChatOpen) {
      setIsChatOpen(true);
    }
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
          onChatToggle={handleNewChat}
          onLoadConversation={handleLoadConversation}
        />

        {/* Content area */}
        <section className="flex flex-1 flex-col overflow-hidden">
          {/* Site header with breadcrumbs */}
          <SiteHeader onToggleSidebar={toggleSidebar} />

          {/* Main content */}
          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </section>

        {/* Chat panel on the right */}
        <ChatPanel ref={chatPanelRef} isOpen={isChatOpen} onClose={toggleChat} />
      </main>

      {/* Footer at bottom - full width */}
      <SiteFooter />
    </div>
  );
};
