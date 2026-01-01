import { memo } from 'react';
import type { ChatUIMessage } from '../../hooks/useChat.js';
import { cn } from '../../lib/utils.js';

// User avatar icon
const UserIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Assistant avatar icon
const BotIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

// Loading dots animation
const LoadingDots = (): React.JSX.Element => (
  <span className="inline-flex items-center gap-1">
    <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
    <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
    <span className="size-1.5 rounded-full bg-current animate-bounce" />
  </span>
);

interface ChatMessageProps {
  message: ChatUIMessage;
}

/**
 * Individual chat message component
 */
export const ChatMessage = memo(({ message }: ChatMessageProps): React.JSX.Element => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming && !message.content;

  return (
    <div className={cn('flex gap-3 px-4 py-3', isUser ? 'bg-transparent' : 'bg-muted/30')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Role label */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {message.usage && (
            <span className="text-xs text-muted-foreground">
              {message.usage.inputTokens + message.usage.outputTokens} tokens
            </span>
          )}
        </div>

        {/* Message content */}
        <div className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
          {isStreaming ? (
            <span className="text-muted-foreground">
              <LoadingDots />
            </span>
          ) : message.error ? (
            <span className="text-destructive">{message.error}</span>
          ) : (
            message.content
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
