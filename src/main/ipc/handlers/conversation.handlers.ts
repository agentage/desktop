import type { BrowserWindow, IpcMain } from 'electron';
import type { ListConversationsOptions } from '../../../shared/types/conversation.types.js';
import {
  listConversations,
  setConversationStoreWindow,
} from '../../services/conversation.store.service.js';

export const registerConversationHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  // Set window reference for event emission
  setConversationStoreWindow(getMainWindow());

  /**
   * List conversations with optional filters
   */
  ipcMain.handle('conversations:list', async (_event, options?: ListConversationsOptions) =>
    listConversations(options)
  );

  /**
   * Restore conversation for continuing chat
   */
  ipcMain.handle('conversations:restore', async (_event, id: string) => {
    const { restoreConversation } = await import('../../services/conversation.store.service.js');
    return restoreConversation(id);
  });
};
