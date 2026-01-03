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
      preload: join(__dirname, '../preload/preload.js'),
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
  // In dev mode, use VITE_DEV_SERVER_URL set by vite-plugin-electron
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  const loadUrl = isDev && devServerUrl
    ? win.loadURL(devServerUrl)
    : win.loadFile(join(__dirname, '../renderer/index.html'));

  // Handle load failures in dev mode (Vite not ready yet)
  if (isDev && devServerUrl) {
    void loadUrl.catch(() => {
      // Retry loading after a short delay if Vite dev server isn't ready
      console.warn('Failed to load dev server, retrying in 1s...');
      setTimeout(() => {
        void win.loadURL(devServerUrl).catch((err: unknown) => {
          console.error('Failed to load dev server:', err);
        });
      }, 1000);
    });
  } else {
    void loadUrl;
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
