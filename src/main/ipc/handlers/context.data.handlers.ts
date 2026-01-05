import type { IpcMain, IpcMainInvokeEvent } from 'electron';
import type { ContextData } from '../../../shared/types/index.js';
import { loadContextData, saveContextData } from '../../services/context.data.service.js';

/**
 * IPC handlers for context data operations
 */

/**
 * Load context data
 */
export const handleContextDataLoad = async (
  _event: IpcMainInvokeEvent
): Promise<ContextData> => loadContextData();

/**
 * Save context data
 */
export const handleContextDataSave = async (
  _event: IpcMainInvokeEvent,
  data: ContextData
): Promise<void> => {
  await saveContextData(data);
};

/**
 * Register context data IPC handlers
 */
export const registerContextDataHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('context.data:load', handleContextDataLoad);
  ipcMain.handle('context.data:save', handleContextDataSave);
};

