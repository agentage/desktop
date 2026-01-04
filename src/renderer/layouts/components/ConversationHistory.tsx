import { useEffect, useState } from 'react';
import type { ConversationRef } from '../../../shared/types/conversation.types.js';
import { useConversations } from '../../hooks/useConversations.js';
import { cn } from '../../lib/utils.js';

interface ConversationHistoryProps {
  isCollapsed?: boolean;
  activeConversationId?: string;
  onNewChat?: () => void;
  onSelectConversation?: (conversationId: string) => void;
}

/**
 * Conversation history component for sidebar
 *
 * Shows:
 * - "New Chat" button at top
 * - 5 most recent conversations
 */
export const ConversationHistory = ({
  isCollapsed = false,
  activeConversationId,
  onNewChat,
  onSelectConversation,
}: ConversationHistoryProps): React.JSX.Element => {
  const { conversations, loadConversations, onChange } = useConversations();
  const [recentConversations, setRecentConversations] = useState<ConversationRef[]>([]);

  // Load conversations on mount and get 5 most recent
  useEffect(() => {
    void loadConversations({ limit: 5, sortBy: 'updatedAt', sortDirection: 'desc' });
  }, [loadConversations]);

  // Subscribe to conversation changes
  useEffect(() => {
    const unsubscribe = onChange(() => {
      void loadConversations({ limit: 5, sortBy: 'updatedAt', sortDirection: 'desc' });
    });
    return unsubscribe;
  }, [onChange, loadConversations]);

  // Update recent conversations when data changes
  useEffect(() => {
    setRecentConversations(conversations.slice(0, 5));
  }, [conversations]);

  const handleNewChat = (): void => {
    onNewChat?.();
  };

  const handleConversationClick = (conversationId: string): void => {
    onSelectConversation?.(conversationId);
  };

  const truncateTitle = (title: string, maxLength = 25): string => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength).trim() + '...';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${String(diffMins)}m ago`;
    if (diffHours < 24) return `${String(diffHours)}h ago`;
    if (diffDays < 7) return `${String(diffDays)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-0.5">
      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        title={isCollapsed ? 'New Chat' : undefined}
        className={cn(
          'flex items-center gap-2 rounded-md py-1.5 text-xs',
          isCollapsed ? 'px-2' : 'pl-4 pr-2',
          'transition-colors',
          'focus:outline-none',
          'text-foreground hover:bg-accent',
          'font-medium',
          isCollapsed && 'justify-center'
        )}
      >
        {/* Plus icon */}
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        {!isCollapsed && 'New Chat'}
      </button>

      {/* Recent Conversations */}
      {recentConversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        return (
          <button
            key={conversation.id}
            onClick={() => {
              handleConversationClick(conversation.id);
            }}
            title={isCollapsed ? conversation.title : undefined}
            className={cn(
              'flex items-center gap-2 rounded-md py-1.5 text-xs',
              isCollapsed ? 'px-2' : 'pl-4 pr-2',
              'transition-colors',
              'focus:outline-none',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent',
              isCollapsed && 'justify-center'
            )}
          >
            {/* Message icon */}
            <svg
              className="size-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>

            {!isCollapsed && (
              <div className="flex flex-1 flex-col items-start min-w-0">
                <span className="truncate w-full text-left">
                  {truncateTitle(conversation.title)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(conversation.updatedAt)}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
