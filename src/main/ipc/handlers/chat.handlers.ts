import type { BrowserWindow, IpcMain } from 'electron';
import type { ChatSendRequest } from '../../../shared/types/chat.types.js';
import {
  cancelRequest,
  clearHistory,
  getAgents,
  getModels,
  getTools,
  sendMessage,
} from '../../services/chat.service.js';
import { getContextInfo } from '../../services/context.service.js';

export const registerChatHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  /**
   * Send chat message and stream response
   */
  ipcMain.handle('chat:send', (_event, request: ChatSendRequest) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) {
      throw new Error('No active window');
    }

    return sendMessage(request, (event) => {
      mainWindow.webContents.send('chat:event', event);
    });
  });

  /**
   * Cancel in-flight request
   */
  ipcMain.handle('chat:cancel', (_event, requestId: string) => {
    cancelRequest(requestId);
  });

  /**
   * Get available models
   */
  ipcMain.handle('chat.models:get', () => getModels());

  /**
   * Get available tools (Phase 2)
   */
  ipcMain.handle('chat.tools:get', () => getTools());

  /**
   * Get available agents (Phase 2)
   */
  ipcMain.handle('chat.agents:get', () => getAgents());

  /**
   * Clear conversation history
   */
  ipcMain.handle('chat:clear', () => {
    clearHistory();
  });

  /**
   * Get context breakdown info
   */
  ipcMain.handle('chat.context:get', (_event, threadId?: string) => getContextInfo(threadId));
};
