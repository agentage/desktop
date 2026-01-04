import type { BrowserWindow, IpcMain } from 'electron';
import type { ChatMessage } from '../../../shared/types/chat.types.js';
import type {
  CreateConversationOptions,
  ListConversationsOptions,
  UpdateConversationMetadata,
} from '../../../shared/types/conversation.types.js';
import {
  appendMessage,
  createConversation,
  deleteConversation,
  exportConversation,
  getConversation,
  importConversation,
  listConversations,
  updateConversationMetadata,
  updateUsageStats,
} from '../../services/conversation.store.service.js';

export const registerConversationHandlers = (
  ipcMain: IpcMain,
  _getMainWindow: () => BrowserWindow | null
): void => {
  /**
   * Create new conversation
   */
  ipcMain.handle('conversations:create', async (_event, options: CreateConversationOptions) =>
    createConversation(options)
  );

  /**
   * Get conversation by ID
   */
  ipcMain.handle('conversations:get', async (_event, id: string) => getConversation(id));

  /**
   * List conversations with optional filters
   */
  ipcMain.handle('conversations:list', async (_event, options?: ListConversationsOptions) =>
    listConversations(options)
  );

  /**
   * Append message to conversation
   */
  ipcMain.handle('conversations:append', async (_event, id: string, message: ChatMessage) =>
    appendMessage(id, message)
  );

  /**
   * Update conversation metadata
   */
  ipcMain.handle(
    'conversations:update',
    async (_event, id: string, updates: UpdateConversationMetadata) =>
      updateConversationMetadata(id, updates)
  );

  /**
   * Update usage statistics
   */
  ipcMain.handle(
    'conversations:updateUsage',
    async (_event, id: string, inputTokens: number, outputTokens: number) =>
      updateUsageStats(id, inputTokens, outputTokens)
  );

  /**
   * Delete conversation
   */
  ipcMain.handle('conversations:delete', async (_event, id: string) => deleteConversation(id));

  /**
   * Export conversation to JSON
   */
  ipcMain.handle('conversations:export', async (_event, id: string) => exportConversation(id));

  /**
   * Import conversation from JSON
   */
  ipcMain.handle('conversations:import', async (_event, jsonString: string) =>
    importConversation(jsonString)
  );

  /**
   * Restore conversation for continuing chat
   */
  ipcMain.handle('conversations:restore', async (_event, id: string) => {
    const { restoreConversation } = await import('../../services/conversation.store.service.js');
    return restoreConversation(id);
  });
};
