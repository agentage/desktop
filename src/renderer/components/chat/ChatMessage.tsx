import { memo } from 'react';
import type { ChatUIMessage } from '../../hooks/useChat.js';
import { cn } from '../../lib/utils.js';
import { LoadingIndicator } from './LoadingIndicator.js';
import { ToolCallBlock } from './ToolCallBlock.js';

interface ChatMessageProps {
  message: ChatUIMessage;
}

/**
 * Individual chat message component with bubble layout
 * User messages: right-aligned, primary background
 * Assistant messages: left-aligned, muted background
 */
export const ChatMessage = memo(({ message }: ChatMessageProps): React.JSX.Element => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming && !message.content;

  return (
    <div
      className={cn('flex px-4 py-2', isUser ? 'justify-end' : 'justify-start')}
      aria-label={isUser ? 'User message' : 'Assistant message'}
    >
      <div
        className={cn(
          'px-4 py-2 text-sm whitespace-pre-wrap break-words',
          isUser
            ? 'max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground'
            : 'max-w-[90%] rounded-2xl rounded-bl-md bg-muted text-foreground'
        )}
      >
        {/* Message content */}
        {isStreaming ? (
          <span className="text-muted-foreground">
            <LoadingIndicator />
          </span>
        ) : message.error ? (
          <span className="text-destructive">{message.error}</span>
        ) : (
          message.content
        )}

        {/* Tool calls (assistant only) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.toolCalls.map((toolCall) => (
              <ToolCallBlock key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
