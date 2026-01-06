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
  isLoading: boolean;
  loadConversations: (options?: ListConversationsOptions) => Promise<void>;
  onChange: (callback: () => void) => () => void;
} => {
  const [conversations, setConversations] = useState<ConversationRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load conversations with optional filters
   */
  const loadConversations = useCallback(
    async (options?: ListConversationsOptions): Promise<void> => {
      try {
        setIsLoading(true);
        const result = await window.agentage.conversations.list(options);
        setConversations(result);
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Subscribe to conversation changes
   */
  const onChange = useCallback(
    (callback: () => void): (() => void) => window.agentage.conversations.onChange(callback),
    []
  );

  /**
   * Load conversations on mount and subscribe to changes
   */
  useEffect(() => {
    void loadConversations();

    // Subscribe to changes
    const unsubscribe = window.agentage.conversations.onChange(() => {
      void loadConversations();
    });

    return unsubscribe;
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    loadConversations,
    onChange,
  };
};
