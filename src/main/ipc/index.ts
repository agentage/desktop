import type { BrowserWindow, IpcMain } from 'electron';
import { registerAgentsHandlers } from './handlers/agents.handlers.js';
import { registerAppHandlers, setupRendererReadyMonitor } from './handlers/app.handlers.js';
import { registerAuthHandlers } from './handlers/auth.handlers.js';
import { registerChatHandlers } from './handlers/chat.handlers.js';
import { registerConfigHandlers } from './handlers/config.handlers.js';
import { registerConversationHandlers } from './handlers/conversation.handlers.js';
import { registerModelProvidersHandlers } from './handlers/models.handlers.js';
import { registerOAuthConnectHandlers } from './handlers/oauth.handlers.js';
import { registerToolsHandlers } from './handlers/tools.handlers.js';
import { registerWidgetHandlers } from './handlers/widget.handlers.js';
import { registerWidgetToolHandlers } from './handlers/widget-tools.handlers.js';
import { registerWindowHandlers } from './handlers/window.handlers.js';
import { registerWorkspaceHandlers } from './handlers/workspace.handlers.js';

export { setupRendererReadyMonitor };

export const registerIpcHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  registerAgentsHandlers(ipcMain);
  registerAuthHandlers(ipcMain);
  registerChatHandlers(ipcMain, getMainWindow);
  registerConfigHandlers(ipcMain);
  registerConversationHandlers(ipcMain, getMainWindow);
  registerModelProvidersHandlers(ipcMain, getMainWindow);
  registerOAuthConnectHandlers(ipcMain);
  registerToolsHandlers(ipcMain, getMainWindow);
  registerWidgetHandlers(ipcMain);
  registerWidgetToolHandlers(ipcMain);
  registerAppHandlers(ipcMain, getMainWindow);
  registerWindowHandlers(ipcMain, getMainWindow);
  registerWorkspaceHandlers(ipcMain, getMainWindow);
};
