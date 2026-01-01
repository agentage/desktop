import { memo, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { LoadingIndicator } from './LoadingIndicator.js';

/**
 * Tool call status
 */
export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'error';

/**
 * Tool result data
 */
export interface ToolResultUI {
  content: string;
  isError: boolean;
  truncated?: boolean;
}

/**
 * Tool call data for UI
 */
export interface ToolCallUI {
  id: string;
  name: string;
  input: Record<string, unknown>;
  status: ToolCallStatus;
  result?: ToolResultUI;
}

// Tool/function icon
const ToolIcon = (): React.JSX.Element => (
  <svg
    className="size-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
    <path d="M17.64 15 22 10.64" />
    <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
  </svg>
);

// Chevron icon for collapsible sections
const ChevronIcon = ({ isOpen }: { isOpen: boolean }): React.JSX.Element => (
  <svg
    className={cn('size-3.5 transition-transform', isOpen && 'rotate-90')}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Status indicator component
const StatusIndicator = ({ status }: { status: ToolCallStatus }): React.JSX.Element => {
  switch (status) {
    case 'pending':
      return <span className="size-2 rounded-full bg-muted-foreground" />;
    case 'running':
      return (
        <span className="text-primary">
          <LoadingIndicator />
        </span>
      );
    case 'completed':
      return (
        <svg
          className="size-3.5 text-green-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case 'error':
      return (
        <svg
          className="size-3.5 text-destructive"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
  }
};

interface ToolCallBlockProps {
  toolCall: ToolCallUI;
}

/**
 * Tool call visualization block
 * Shows tool name, status, input parameters, and result
 */
export const ToolCallBlock = memo(({ toolCall }: ToolCallBlockProps): React.JSX.Element => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(true);

  const hasInput = Object.keys(toolCall.input).length > 0;
  const hasResult = toolCall.result !== undefined;

  return (
    <div className="rounded border border-border bg-card overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 border-b border-border">
        <ToolIcon />
        <span className="font-mono font-medium">{toolCall.name}</span>
        <div className="ml-auto">
          <StatusIndicator status={toolCall.status} />
        </div>
      </div>

      {/* Input section (collapsible) */}
      {hasInput && (
        <div className="border-b border-border">
          <button
            type="button"
            onClick={() => {
              setIsInputOpen(!isInputOpen);
            }}
            className="flex items-center gap-1 w-full px-2 py-1 text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <ChevronIcon isOpen={isInputOpen} />
            <span>Input</span>
          </button>
          {isInputOpen && (
            <pre className="px-2 py-1 font-mono overflow-x-auto bg-muted/20 max-h-32 overflow-y-auto">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Result section */}
      {hasResult && (
        <div>
          <button
            type="button"
            onClick={() => {
              setIsResultOpen(!isResultOpen);
            }}
            className={cn(
              'flex items-center gap-1 w-full px-2 py-1 hover:bg-muted/30 transition-colors',
              toolCall.result?.isError ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            <ChevronIcon isOpen={isResultOpen} />
            <span>{toolCall.result?.isError ? 'Error' : 'Result'}</span>
            {toolCall.result?.truncated && (
              <span className="ml-auto text-muted-foreground">(truncated)</span>
            )}
          </button>
          {isResultOpen && (
            <pre
              className={cn(
                'px-2 py-1 font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words',
                toolCall.result?.isError ? 'bg-destructive/10 text-destructive' : 'bg-muted/20'
              )}
            >
              {toolCall.result?.content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
});

ToolCallBlock.displayName = 'ToolCallBlock';
