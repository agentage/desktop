import { useCallback, useEffect, useState } from 'react';
import type {
  ConversationRef,
  ListConversationsOptions,
} from '../../shared/types/conversation.types.js';

/**
 * Hook for managing conversations
 */
export const useConversations = (): {
  conversations: ConversationRef[];
  loadConversations: (options?: ListConversationsOptions) => Promise<void>;
  onChange: (callback: () => void) => () => void;
} => {
  const [conversations, setConversations] = useState<ConversationRef[]>([]);

  /**
   * Load conversations with optional filters
   */
  const loadConversations = useCallback(async (options?: ListConversationsOptions) => {
    try {
      const result = await window.agentage.conversations.list(options);
      setConversations(result);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  /**
   * Subscribe to conversation changes
   */
  const onChange = useCallback((callback: () => void): (() => void) => {
    return window.agentage.conversations.onChange(callback);
  }, []);

  /**
   * Load conversations on mount
   */
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loadConversations,
    onChange,
  };
};
