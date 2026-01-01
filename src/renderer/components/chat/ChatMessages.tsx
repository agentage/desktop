import { useEffect, useRef } from 'react';
import type { ChatUIMessage } from '../../hooks/useChat.js';
import { ChatMessage } from './ChatMessage.js';

// Chat icon for empty state
const ChatIcon = (): React.JSX.Element => (
  <svg
    className="size-8 text-muted-foreground"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

interface ChatMessagesProps {
  messages: ChatUIMessage[];
  isLoading?: boolean;
}

/**
 * Scrollable message list component
 * Auto-scrolls to bottom when new messages arrive
 */
export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps): React.JSX.Element => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <ChatIcon />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-2">Start a conversation</h3>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          Type a message below to begin chatting with the AI assistant
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="flex flex-col">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
