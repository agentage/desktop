import { useRef, useState } from 'react';

import { cn } from '../../lib/utils.js';
import { BotIcon, ChevronDownIcon, FolderIcon } from './icons.js';
import type { AgentOption, ModelOption } from './types.js';

const DEFAULT_MODELS: ModelOption[] = [
  { id: 'opus-4-5', name: 'opus-4-5', provider: 'Anthropic' },
  { id: 'sonnet-4', name: 'sonnet-4', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'gpt-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'gpt-4o-mini', provider: 'OpenAI' },
  { id: 'claude-3-haiku', name: 'claude-3-haiku', provider: 'Anthropic' },
];

// Default "none" agent - always available
const NONE_AGENT: AgentOption = { id: 'none', name: 'none' };

interface ModelSelectorProps {
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  selectedAgent?: AgentOption;
  onAgentChange?: (agent: AgentOption) => void;
  models?: ModelOption[];
  agents?: AgentOption[];
  className?: string;
}

/**
 * Model selector dropdown component
 *
 * Displays current model and agent, allows switching both
 */
export const ModelSelector = ({
  selectedModel,
  onModelChange,
  selectedAgent = NONE_AGENT,
  onAgentChange,
  models = DEFAULT_MODELS,
  agents = [],
  className,
}: ModelSelectorProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableModels = models.length > 0 ? models : DEFAULT_MODELS;
  // Always include "none" as first option, then any agents from IPC
  const availableAgents = [NONE_AGENT, ...agents.filter((a) => a.id !== 'none')];

  const handleSelectModel = (model: ModelOption): void => {
    onModelChange(model);
    setIsOpen(false);
  };

  const handleSelectAgent = (agent: AgentOption): void => {
    onAgentChange?.(agent);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors',
          'focus:outline-none focus:text-foreground'
        )}
      >
        <FolderIcon />
        <span className="text-primary">{selectedModel.name}</span>
        <span className="text-muted-foreground">·</span>
        <BotIcon />
        <span className="text-muted-foreground">{selectedAgent.name}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => {
              setIsOpen(false);
            }}
          />

          {/* Dropdown menu */}
          <div className="absolute bottom-full left-0 mb-1 z-[60] w-56 rounded-md border border-border bg-sidebar shadow-lg">
            <div className="p-1">
              {/* Model section */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Model</div>
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    handleSelectModel(model);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-sm',
                    'hover:bg-accent transition-colors text-left',
                    model.id === selectedModel.id && 'bg-accent/50'
                  )}
                >
                  <span>{model.name}</span>
                  <span className="text-muted-foreground text-[10px]">{model.provider}</span>
                </button>
              ))}

              {/* Divider */}
              <div className="my-1 border-t border-border" />

              {/* Agent section */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Agent</div>
              {availableAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    handleSelectAgent(agent);
                  }}
                  className={cn(
                    'w-full flex items-center px-2 py-1.5 text-xs rounded-sm',
                    'hover:bg-accent transition-colors text-left',
                    agent.id === selectedAgent.id && 'bg-accent/50'
                  )}
                >
                  <span>{agent.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
