/**
 * Types for the composer components
 */

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

export interface AgentOption {
  id: string;
  name: string;
}

export interface ToolOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ToolGroup {
  id: string;
  name: string;
  icon?: string;
  tools: ToolOption[];
  expanded: boolean;
}

export interface ContextItem {
  name: string;
  tokens: number;
  percentage: number;
  color: string;
}

export interface ContextBreakdownData {
  currentContext: number;
  maxContext: number;
  items: ContextItem[];
  agentageFiles?: { path: string; tokens: number }[];
  timestamp: string;
}

export interface ComposerState {
  isExpanded: boolean;
  isFocused: boolean;
  selectedModel: ModelOption;
  contextData: ContextBreakdownData;
}
