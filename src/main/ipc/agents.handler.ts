import type { IpcMain } from 'electron';
import { listAgents, runAgent } from '../services/agent.service.js';

export const registerAgentsHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('agents:list', async () => listAgents());

  ipcMain.handle('agents:run', async (_event, name: string, prompt: string) =>
    runAgent(name, prompt)
  );
};
