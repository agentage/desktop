import { memo } from 'react';
import type { ChatUIMessage, ContentBlock } from '../../hooks/useChat.js';
import { cn } from '../../lib/utils.js';
import { LoadingIndicator } from './LoadingIndicator.js';
import { MarkdownContent } from './MarkdownContent.js';
import { ToolCallBlock } from './ToolCallBlock.js';

interface ChatMessageProps {
  message: ChatUIMessage;
}

/**
 * Render interleaved content blocks (text and tool calls in order)
 */
const renderContentBlocks = (blocks: ContentBlock[]): React.JSX.Element => (
  <div className="space-y-2">
    {blocks.map((block, index) => {
      if (block.type === 'text') {
        return block.text ? (
          <div key={`text-${String(index)}`}>
            <MarkdownContent content={block.text} />
          </div>
        ) : null;
      }
      return <ToolCallBlock key={block.toolCall.id} toolCall={block.toolCall} />;
    })}
  </div>
);

/**
 * Individual chat message component with bubble layout
 * User messages: right-aligned, primary background
 * Assistant messages: left-aligned, muted background
 */
export const ChatMessage = memo(({ message }: ChatMessageProps): React.JSX.Element => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming && !message.content;

  // Use contentBlocks for assistant messages if available (interleaved display)
  const hasContentBlocks = !isUser && message.contentBlocks && message.contentBlocks.length > 0;

  return (
    <div
      className={cn('flex px-2 py-1', isUser ? 'justify-end' : 'justify-start')}
      aria-label={isUser ? 'User message' : 'Assistant message'}
    >
      <div
        className={cn(
          'px-3 py-1.5 text-xs break-words',
          isUser
            ? 'max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground whitespace-pre-wrap'
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
        ) : isUser ? (
          message.content
        ) : hasContentBlocks ? (
          // Render interleaved content blocks for assistant
          renderContentBlocks(message.contentBlocks ?? [])
        ) : (
          // Fallback to legacy rendering
          <>
            <MarkdownContent content={message.content} />
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-1.5 space-y-1.5">
                {message.toolCalls.map((toolCall) => (
                  <ToolCallBlock key={toolCall.id} toolCall={toolCall} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
