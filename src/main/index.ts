import { app, BrowserWindow, ipcMain, Menu, nativeImage } from 'electron';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { registerIpcHandlers, setupRendererReadyMonitor } from './ipc/index.js';
import { initConversationStore } from './services/conversation.store.service.js';
import { initLogger } from './services/logger.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

// Remove application menu
Menu.setApplicationMenu(null);

// Enable hardware acceleration features
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');

/**
 * Get platform-specific icon path
 */
const getIconPath = (): string | undefined => {
  const base = join(__dirname, '../../build');
  let iconFile: string;

  if (process.platform === 'win32') {
    iconFile = join(base, 'icon.ico');
  } else if (process.platform === 'darwin') {
    iconFile = join(base, 'icon.icns');
  } else {
    iconFile = join(base, 'icon.png');
  }

  if (existsSync(iconFile)) {
    console.log(`Icon found at: ${iconFile}`);
    return iconFile;
  }

  console.warn(`Icon not found at: ${iconFile}`);
  return undefined;
};

/**
 * Create native image for the app icon (more reliable on Linux)
 */
const getAppIcon = (): Electron.NativeImage | undefined => {
  const iconPath = getIconPath();
  if (!iconPath) return undefined;

  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    console.warn('Failed to load icon as nativeImage');
    return undefined;
  }
  return icon;
};

let mainWindow: BrowserWindow | null = null;

export const getMainWindow = (): BrowserWindow | null => mainWindow;

/**
 * Wait for the Vite dev server to be ready before loading
 * Implements exponential backoff with max retries
 */
const waitForDevServer = async (url: string, win: BrowserWindow, retryCount = 0): Promise<void> => {
  const MAX_RETRIES = 10;
  const BASE_DELAY = 500; // ms

  if (win.isDestroyed()) {
    console.warn('Window destroyed while waiting for dev server');
    return;
  }

  try {
    // Try to load the URL
    await win.loadURL(url);
    console.log('✓ Successfully connected to Vite dev server');
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      console.error(
        `✗ Failed to connect to dev server after ${String(MAX_RETRIES)} attempts:`,
        error
      );
      console.error('  Please ensure Vite dev server is running.');
      return;
    }

    // Exponential backoff: 500ms, 1s, 2s, 4s, ...
    const delay = BASE_DELAY * Math.pow(2, Math.min(retryCount, 3));
    console.warn(
      `⏳ Waiting for Vite dev server... (attempt ${String(retryCount + 1)}/${String(MAX_RETRIES)}, retrying in ${String(delay)}ms)`
    );

    await new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
    await waitForDevServer(url, win, retryCount + 1);
  }
};

const createWindow = (): BrowserWindow => {
  const appIcon = getAppIcon();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: appIcon,
    frame: false, // Frameless window for custom titlebar
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    show: false,
  });

  mainWindow = win;

  // Set icon again after window creation (Linux workaround)
  if (appIcon && process.platform === 'linux') {
    win.setIcon(appIcon);
  }

  win.once('ready-to-show', () => {
    win.show();
  });

  // Load URL after window setup is complete
  // electron-vite sets ELECTRON_RENDERER_URL in dev mode
  const devServerUrl = process.env.ELECTRON_RENDERER_URL;

  if (isDev && devServerUrl) {
    // In dev mode, wait for Vite dev server to be ready before loading
    // This prevents the common race condition where Electron starts before Vite
    void waitForDevServer(devServerUrl, win);
  } else {
    // In production, load the built HTML file
    void win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  if (isDev) {
    // Ctrl+Mouse scroll zoom
    win.webContents.on('zoom-changed', (_event, zoomDirection) => {
      const currentZoom = win.webContents.getZoomFactor();
      if (zoomDirection === 'in') {
        win.webContents.setZoomFactor(currentZoom + 0.1);
      } else {
        win.webContents.setZoomFactor(Math.max(0.1, currentZoom - 0.1));
      }
    });
  }

  return win;
};

const initialize = async (): Promise<void> => {
  await app.whenReady();

  // Initialize logger and conversation store
  await initLogger();
  await initConversationStore();

  registerIpcHandlers(ipcMain, getMainWindow);
  const win = createWindow();

  // Start monitoring for renderer ready signal - will auto-reload if not ready
  setupRendererReadyMonitor(win);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createWindow();
      setupRendererReadyMonitor(newWin);
    }
  });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

void initialize();
