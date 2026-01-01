import type { BrowserWindow, IpcMain } from 'electron';
import type { ChatSendRequest, SessionConfig } from '../../shared/types/chat.types.js';
import {
  cancelRequest,
  clearHistory,
  configureSession,
  getAgents,
  getModels,
  getTools,
  sendMessage,
} from '../services/chat.service.js';

export const registerChatHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  /**
   * Configure active chat session
   */
  ipcMain.handle('chat:configure', (_event, config: SessionConfig) => {
    configureSession(config);
  });

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
  ipcMain.handle('chat:getModels', () => getModels());

  /**
   * Get available tools (Phase 2)
   */
  ipcMain.handle('chat:getTools', () => getTools());

  /**
   * Get available agents (Phase 2)
   */
  ipcMain.handle('chat:getAgents', () => getAgents());

  /**
   * Clear conversation history
   */
  ipcMain.handle('chat:clear', () => {
    clearHistory();
  });
};
