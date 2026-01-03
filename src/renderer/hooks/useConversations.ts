import { useCallback, useEffect, useState } from 'react';
import type {
  ConversationRef,
  ConversationSnapshot,
  CreateConversationOptions,
  ListConversationsOptions,
  UpdateConversationMetadata,
} from '../../shared/types/conversation.types.js';

/**
 * Hook for managing conversations
 */
export const useConversations = (): {
  conversations: ConversationRef[];
  loading: boolean;
  error: string | null;
  loadConversations: (options?: ListConversationsOptions) => Promise<void>;
  getConversation: (id: string) => Promise<ConversationSnapshot | null>;
  createConversation: (options: CreateConversationOptions) => Promise<ConversationSnapshot | null>;
  updateMetadata: (id: string, updates: UpdateConversationMetadata) => Promise<boolean>;
  deleteConversation: (id: string) => Promise<boolean>;
  exportConversation: (id: string) => Promise<string | null>;
  importConversation: (jsonString: string) => Promise<ConversationSnapshot | null>;
} => {
  const [conversations, setConversations] = useState<ConversationRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load conversations with optional filters
   */
  const loadConversations = useCallback(async (options?: ListConversationsOptions) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.agentage.conversations.list(options);
      setConversations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a specific conversation
   */
  const getConversation = useCallback(async (id: string): Promise<ConversationSnapshot | null> => {
    try {
      return await window.agentage.conversations.get(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get conversation');
      return null;
    }
  }, []);

  /**
   * Create new conversation
   */
  const createConversation = useCallback(
    async (options: CreateConversationOptions): Promise<ConversationSnapshot | null> => {
      try {
        const snapshot = await window.agentage.conversations.create(options);
        await loadConversations(); // Refresh list
        return snapshot;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create conversation');
        return null;
      }
    },
    [loadConversations]
  );

  /**
   * Update conversation metadata
   */
  const updateMetadata = useCallback(
    async (id: string, updates: UpdateConversationMetadata): Promise<boolean> => {
      try {
        await window.agentage.conversations.updateMetadata(id, updates);
        await loadConversations(); // Refresh list
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update conversation');
        return false;
      }
    },
    [loadConversations]
  );

  /**
   * Delete conversation
   */
  const deleteConversation = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await window.agentage.conversations.delete(id);
        await loadConversations(); // Refresh list
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete conversation');
        return false;
      }
    },
    [loadConversations]
  );

  /**
   * Export conversation to JSON
   */
  const exportConversation = useCallback(async (id: string): Promise<string | null> => {
    try {
      return await window.agentage.conversations.export(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export conversation');
      return null;
    }
  }, []);

  /**
   * Import conversation from JSON
   */
  const importConversation = useCallback(
    async (jsonString: string): Promise<ConversationSnapshot | null> => {
      try {
        const snapshot = await window.agentage.conversations.import(jsonString);
        await loadConversations(); // Refresh list
        return snapshot;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import conversation');
        return null;
      }
    },
    [loadConversations]
  );

  /**
   * Load conversations on mount
   */
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    loadConversations,
    getConversation,
    createConversation,
    updateMetadata,
    deleteConversation,
    exportConversation,
    importConversation,
  };
};
