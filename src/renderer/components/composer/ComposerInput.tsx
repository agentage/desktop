import { useCallback, useState } from 'react';

import { cn } from '../../lib/utils.js';
import { ContextBreakdown } from './ContextBreakdown.js';
import { ChevronUpIcon, ToolsIcon } from './icons.js';
import { ModelSelector } from './ModelSelector.js';
import { ToolsPopover } from './ToolsPopover.js';
import type { ContextBreakdownData, ModelOption } from './types.js';

// Mock data for demonstration - would come from actual context in production
const DEFAULT_MODEL: ModelOption = {
  id: 'opus-4-5',
  name: 'opus-4-5',
  provider: 'Anthropic',
};

const MOCK_CONTEXT_DATA: ContextBreakdownData = {
  currentContext: 56000,
  maxContext: 200000,
  items: [
    { name: 'System Prompt', tokens: 6000, percentage: 10, color: '#3B82F6' },
    { name: 'System Tools', tokens: 10000, percentage: 18, color: '#EAB308' },
    { name: 'CLAUDE.md', tokens: 2000, percentage: 4, color: '#22C55E' },
    { name: 'MCP Tools', tokens: 28000, percentage: 51, color: '#F97316' },
    { name: 'Conversation', tokens: 10000, percentage: 17, color: '#06B6D4' },
  ],
  claudeFiles: [
    { path: '~/.claude/CLAUDE.md', tokens: 0 },
    { path: '~/andy/CLAUDE.md', tokens: 3000 },
  ],
  timestamp: '4:01:49 PM',
};

interface StatusLineProps {
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  models?: ModelOption[];
  tokenCount: number;
  isFocused: boolean;
  contextData: ContextBreakdownData;
}

/**
 * Status line component shown below the input
 *
 * Contains: model selector, token count, actions, expand/collapse
 */
const StatusLine = ({
  selectedModel,
  onModelChange,
  models,
  tokenCount,
  isFocused,
  contextData,
}: StatusLineProps): React.JSX.Element => {
  const [showContextBreakdown, setShowContextBreakdown] = useState(false);
  const [showToolsPopover, setShowToolsPopover] = useState(false);

  const formatTokenCount = (tokens: number): string => {
    if (tokens >= 1000) {
      return `${String(Math.round(tokens / 1000))}k`;
    }
    return tokens.toString();
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-between px-3 py-2 text-xs',
        'border-t border-transparent transition-colors',
        isFocused && 'border-border/50'
      )}
    >
      {/* Left side: Model selector + Tools */}
      <div className="flex items-center gap-3">
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          models={models}
        />

        {/* Tools indicator */}
        <button
          onClick={() => {
            setShowToolsPopover(true);
          }}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          title="MCP Tools"
        >
          <ToolsIcon />
        </button>
      </div>

      {/* Right side: Token count, actions, collapse */}
      <div className="flex items-center gap-3">
        {/* Token count - clickable for breakdown */}
        <button
          onClick={() => {
            setShowContextBreakdown(true);
          }}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          title="View context breakdown"
        >
          <span className="text-yellow-500 font-medium">{formatTokenCount(tokenCount)}</span>
          <ChevronUpIcon />
        </button>

        {/* Action buttons (only shown when expanded/focused) */}
        {/* TODO: Re-enable when image upload and voice input are implemented
        {isExpanded && (
          <div className="flex items-center gap-1 border-l border-border pl-3">
            <button
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Add image"
            >
              <ImageIcon />
            </button>
            <button
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Voice input"
            >
              <MicIcon />
            </button>
          </div>
        )}
        */}
      </div>

      {/* Context breakdown popover */}
      <ContextBreakdown
        data={contextData}
        isOpen={showContextBreakdown}
        onClose={() => {
          setShowContextBreakdown(false);
        }}
      />

      {/* Tools popover */}
      <ToolsPopover
        isOpen={showToolsPopover}
        onClose={() => {
          setShowToolsPopover(false);
        }}
      />
    </div>
  );
};

interface ComposerInputProps {
  onSubmit?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Available models from API */
  models?: ModelOption[];
  /** Currently selected model */
  selectedModel?: ModelOption;
  /** Callback when model changes */
  onModelChange?: (model: ModelOption) => void;
}

/**
 * Main composer input component
 *
 * Features:
 * - Expandable/collapsible input area
 * - Focus highlighting
 * - Status line with model selector, token count
 * - Context breakdown popover
 */
export const ComposerInput = ({
  onSubmit,
  placeholder = 'How could I help you today?',
  disabled = false,
  className,
  models,
  selectedModel: propSelectedModel,
  onModelChange,
}: ComposerInputProps): React.JSX.Element => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [internalSelectedModel, setInternalSelectedModel] = useState<ModelOption>(DEFAULT_MODEL);

  // Use prop if provided, otherwise use internal state
  const selectedModel = propSelectedModel ?? internalSelectedModel;
  const handleModelChange = onModelChange ?? setInternalSelectedModel;

  const handleSubmit = useCallback(() => {
    if (value.trim() && onSubmit) {
      onSubmit(value.trim());
      setValue('');
    }
  }, [value, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className={cn(
        'relative rounded-lg border transition-all duration-200',
        isFocused ? 'border-ring ring-1 ring-ring/20 bg-background' : 'border-border bg-muted/30',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Input area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent px-3 py-3 text-sm',
            'placeholder:text-muted-foreground/60 focus:outline-none',
            'transition-all duration-200',
            disabled && 'cursor-not-allowed'
          )}
        />
      </div>

      {/* Status line */}
      <StatusLine
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        models={models}
        tokenCount={MOCK_CONTEXT_DATA.currentContext}
        isFocused={isFocused}
        contextData={MOCK_CONTEXT_DATA}
      />
    </div>
  );
};
