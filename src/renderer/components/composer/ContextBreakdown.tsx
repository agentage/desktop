import { useState } from 'react';

import { cn } from '../../lib/utils.js';
import { RefreshIcon } from './icons.js';
import type { ContextBreakdownData, ContextItem } from './types.js';

interface ContextBarProps {
  item: ContextItem;
  maxTokens: number;
}

const ContextBar = ({ item, maxTokens }: ContextBarProps): React.JSX.Element => {
  const widthPercentage = Math.min((item.tokens / maxTokens) * 100, 100);

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
        <span className="text-xs text-muted-foreground truncate">{item.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${String(widthPercentage)}%`,
              backgroundColor: item.color,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground w-16 text-right">
          {formatTokens(item.tokens)} / {item.percentage}%
        </span>
      </div>
    </div>
  );
};

const formatTokens = (tokens: number): string => {
  if (tokens >= 1000) {
    return `${String(Math.round(tokens / 1000))}k`;
  }
  return tokens.toString();
};

interface ContextBreakdownProps {
  data: ContextBreakdownData;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

/**
 * Context breakdown popover component
 *
 * Shows detailed breakdown of token usage across different categories
 */
export const ContextBreakdown = ({
  data,
  isOpen,
  onClose,
  onRefresh,
}: ContextBreakdownProps): React.JSX.Element | null => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    onRefresh?.();
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20"
        onClick={() => {
          onClose();
        }}
      />

      {/* Popover */}
      <div className="absolute bottom-full left-0 right-0 mb-2 z-[60] mx-2">
        <div className="rounded-lg border border-border bg-sidebar shadow-xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Context Breakdown</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{data.timestamp}</span>
              <button
                onClick={handleRefresh}
                className={cn(
                  'p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground',
                  isRefreshing && 'animate-spin'
                )}
                title="Refresh"
              >
                <RefreshIcon />
              </button>
            </div>
          </div>

          {/* Current Context Summary */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <span className="text-xs text-muted-foreground">Current Context</span>
            <span className="text-sm font-medium text-foreground">
              {formatTokens(data.currentContext)} / {formatTokens(data.maxContext)} tokens
            </span>
          </div>

          {/* Context bars */}
          <div className="space-y-0.5">
            {data.items.map((item) => (
              <ContextBar key={item.name} item={item} maxTokens={data.maxContext} />
            ))}
          </div>

          {/* CLAUDE.md Files section */}
          {data.claudeFiles && data.claudeFiles.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">CLAUDE.md Files</div>
              {data.claudeFiles.map((file) => (
                <div key={file.path} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-muted-foreground truncate">{file.path}</span>
                  <span className="text-xs text-muted-foreground">{formatTokens(file.tokens)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground/70">
              Estimates based on ~4 chars/token · Auto-refreshes every 10s
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
