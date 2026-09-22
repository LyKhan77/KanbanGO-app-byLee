import { app, shell, BrowserWindow, ipcMain, dialog, Tray } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { setupNotificationHandlers } from './notification';
import { setupSystemTray } from './tray';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined,
    autoHideMenuBar: true,
    backgroundColor: '#fdfbf7',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.kanbango.app');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Native Notification & Window Restore IPC Handlers
  setupNotificationHandlers(ipcMain, () => mainWindow);

  // Window Controls IPC
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow?.close();
  });

  // Native File Dialogs
  ipcMain.handle('dialog:saveBackup', async (_, defaultFileName: string) => {
    if (!mainWindow) return null;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Ekspor Cadangan Board (JSON)',
      defaultPath: defaultFileName,
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    return canceled ? null : filePath;
  });

  ipcMain.handle('dialog:openBackup', async () => {
    if (!mainWindow) return null;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Impor Cadangan Board (JSON)',
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    return canceled || filePaths.length === 0 ? null : filePaths[0];
  });

  createWindow();

  tray = setupSystemTray(
    () => mainWindow,
    () => {
      isQuitting = true;
      if (tray) {
        tray.destroy();
        tray = null;
      }
      app.quit();
    }
  );

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  if (tray) {
    tray.destroy();
    tray = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
