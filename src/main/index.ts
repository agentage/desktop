import { app, BrowserWindow, ipcMain, Menu, nativeImage } from 'electron';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { registerIpcHandlers } from './ipc/index.js';

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

const createWindow = (): BrowserWindow => {
  const appIcon = getAppIcon();

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    // Only use hiddenInset on macOS where it looks native
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hiddenInset' } : {}),
    show: false,
  });

  // Set icon again after window creation (Linux workaround)
  if (appIcon && process.platform === 'linux') {
    mainWindow.setIcon(appIcon);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    void mainWindow.loadURL('http://localhost:5173');

    // Dev mode keyboard shortcuts for DevTools
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown') return;

      const isCtrlOrCmd = input.control || input.meta;

      // DevTools: F12 or Ctrl+Shift+I
      if (input.key === 'F12') {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      } else if (isCtrlOrCmd && input.shift && input.key.toLowerCase() === 'i') {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      }
    });

    // Ctrl+Mouse scroll zoom
    mainWindow.webContents.on('zoom-changed', (_event, zoomDirection) => {
      const currentZoom = mainWindow.webContents.getZoomFactor();
      if (zoomDirection === 'in') {
        mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
      } else {
        mainWindow.webContents.setZoomFactor(Math.max(0.1, currentZoom - 0.1));
      }
    });
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
};

const initialize = async (): Promise<void> => {
  await app.whenReady();

  registerIpcHandlers(ipcMain);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

void initialize();
