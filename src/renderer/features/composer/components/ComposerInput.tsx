import { useCallback, useEffect, useState } from 'react';

import { cn } from '../../../lib/utils.js';
import { ContextBreakdown } from './ContextBreakdown.js';
import { ChevronUpIcon, ToolsIcon } from './icons.js';
import { ModelSelector } from './ModelSelector.js';
import { ToolsPopover } from './ToolsPopover.js';
import type { AgentOption, ContextBreakdownData, ModelOption } from '../types.js';

// Default empty context data (shown while loading)
const DEFAULT_CONTEXT_DATA: ContextBreakdownData = {
  currentContext: 0,
  maxContext: 200000,
  items: [
    { name: 'System Prompt', tokens: 0, percentage: 0, color: '#3B82F6' },
    { name: 'System Tools', tokens: 0, percentage: 0, color: '#EAB308' },
    { name: 'AGENTAGE.md', tokens: 0, percentage: 0, color: '#22C55E' },
    { name: 'MCP Tools', tokens: 0, percentage: 0, color: '#F97316' },
    { name: 'Conversation', tokens: 0, percentage: 0, color: '#06B6D4' },
  ],
  agentageFiles: [],
  timestamp: new Date().toLocaleTimeString(),
};

interface StatusLineProps {
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  models?: ModelOption[];
  tokenCount: number;
  isFocused: boolean;
  contextData: ContextBreakdownData;
  agents?: AgentOption[];
  selectedAgent?: AgentOption;
  onAgentChange?: (agent: AgentOption) => void;
  onRefresh?: () => Promise<void>;
}

/**
 * Status line component shown below the input
 *
 * Contains: model selector, token count, actions, expand/collapse
 */
const StatusLine = ({
  selectedModel,
  onModelChange,
  models = [],
  tokenCount,
  isFocused,
  contextData,
  agents,
  selectedAgent,
  onAgentChange,
  onRefresh,
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
          agents={agents}
          selectedAgent={selectedAgent}
          onAgentChange={onAgentChange}
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
        onRefresh={onRefresh}
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
  /** Currently selected model (required) */
  selectedModel: ModelOption;
  /** Callback when model changes */
  onModelChange: (model: ModelOption) => void;
  /** Available agents from IPC */
  agents?: AgentOption[];
  /** Currently selected agent */
  selectedAgent?: AgentOption;
  /** Callback when agent changes */
  onAgentChange?: (agent: AgentOption) => void;
  /** Conversation tokens for context display */
  conversationTokens?: number;
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
  selectedModel,
  onModelChange,
  agents,
  selectedAgent,
  onAgentChange,
  conversationTokens = 0,
}: ComposerInputProps): React.JSX.Element => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [contextData, setContextData] = useState<ContextBreakdownData>(DEFAULT_CONTEXT_DATA);

  // Fetch context data function - extracted for reuse
  const fetchContext = useCallback(async (): Promise<void> => {
    try {
      const response = await window.agentage.chat.context.get();
      if ('breakdown' in response) {
        // Update conversation tokens from prop
        const updatedBreakdown = {
          ...response.breakdown,
          items: response.breakdown.items.map((item) =>
            item.name === 'Conversation' ? { ...item, tokens: conversationTokens } : item
          ),
          currentContext: response.breakdown.currentContext + conversationTokens,
        };
        setContextData(updatedBreakdown);
      } else if ('files' in response) {
        // Files-only response - build minimal breakdown
        const globalTokens = response.files.global.tokens;
        const projectTokens = response.files.project?.tokens ?? 0;
        const totalTokens = globalTokens + projectTokens;

        const agentageFiles: { path: string; tokens: number }[] = [];
        if (response.files.global.exists) {
          agentageFiles.push({
            path: response.files.global.path.replace(/^\/home\/[^/]+/, '~'),
            tokens: globalTokens,
          });
        }
        if (response.files.project?.exists) {
          agentageFiles.push({
            path: response.files.project.path.replace(/^\/home\/[^/]+/, '~'),
            tokens: projectTokens,
          });
        }

        setContextData({
          currentContext: totalTokens,
          maxContext: 200000,
          items: [
            { name: 'System Prompt', tokens: 0, percentage: 0, color: '#3B82F6' },
            { name: 'System Tools', tokens: 0, percentage: 0, color: '#EAB308' },
            {
              name: 'AGENTAGE.md',
              tokens: totalTokens,
              percentage: totalTokens > 0 ? 100 : 0,
              color: '#22C55E',
            },
            { name: 'MCP Tools', tokens: 0, percentage: 0, color: '#F97316' },
            { name: 'Conversation', tokens: 0, percentage: 0, color: '#06B6D4' },
          ],
          agentageFiles,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (error) {
      console.error('Failed to fetch context:', error);
    }
  }, [conversationTokens]);

  // Fetch context data on mount and periodically
  useEffect(() => {
    void fetchContext();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      void fetchContext();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchContext]);

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
        onModelChange={onModelChange}
        models={models}
        tokenCount={contextData.currentContext}
        isFocused={isFocused}
        contextData={contextData}
        agents={agents}
        selectedAgent={selectedAgent}
        onAgentChange={onAgentChange}
        onRefresh={fetchContext}
      />
    </div>
  );
};
