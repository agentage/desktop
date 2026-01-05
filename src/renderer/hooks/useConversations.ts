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
  const loadConversations = useCallback((_options?: ListConversationsOptions): Promise<void> => {
    // TODO: Implement conversation listing when backend API is available
    console.warn('Conversation listing not yet implemented');
    setConversations([]);
    return Promise.resolve();
  }, []);

  /**
   * Subscribe to conversation changes
   */
  const onChange = useCallback((callback: () => void): (() => void) => {
    // TODO: Implement conversation change listener when backend API is available
    console.warn('Conversation change listener not yet implemented');
    callback();
    return () => {
      // Cleanup function placeholder
    };
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
