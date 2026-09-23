import { app, IpcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';

// Configure autoUpdater defaults safely (avoiding instantiation failure in non-Electron test environments)
try {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
} catch {
  // When running inside Vitest/Node without full Electron runtime,
  // accessing autoUpdater throws because electron.app is undefined.
}

export function setupAutoUpdater(
  ipcMain: IpcMain | any,
  getMainWindow: () => BrowserWindow | any | null,
  customUpdater?: any
): any {
  const updater = customUpdater || autoUpdater;

  // Ensure options are set if updater has them
  if (updater) {
    updater.autoDownload = false;
    updater.autoInstallOnAppQuit = false;
  }

  const sendToWindow = (channel: string, ...args: any[]): void => {
    const win = getMainWindow();
    if (win) {
      const isDestroyed = typeof win.isDestroyed === 'function' ? win.isDestroyed() : false;
      if (!isDestroyed && win.webContents?.send) {
        win.webContents.send(channel, ...args);
      }
    }
  };

  updater.on('checking-for-update', (data?: any) => {
    if (data !== undefined) {
      sendToWindow('updater:status', 'checking', data);
    } else {
      sendToWindow('updater:status', 'checking');
    }
  });

  updater.on('update-available', (info: any) => {
    sendToWindow('updater:status', 'available', info);
  });

  updater.on('update-not-available', (info: any) => {
    sendToWindow('updater:status', 'not-available', info);
  });

  updater.on('download-progress', (progress: any) => {
    sendToWindow('updater:progress', progress);
  });

  updater.on('update-downloaded', (info: any) => {
    sendToWindow('updater:status', 'downloaded', info);
  });

  updater.on('error', (err: any) => {
    sendToWindow('updater:status', 'error', err);
  });

  ipcMain.handle('updater:check', async (_event: any, _manual?: boolean) => {
    try {
      return await updater.checkForUpdates();
    } catch (error: any) {
      console.error('Failed to check for updates:', error);
      return { error: error?.message || String(error) };
    }
  });

  ipcMain.handle('updater:startDownload', async () => {
    try {
      return await updater.downloadUpdate();
    } catch (error: any) {
      console.error('Failed to download update:', error);
      return { error: error?.message || String(error) };
    }
  });

  ipcMain.handle('updater:quitAndInstall', async () => {
    updater.quitAndInstall();
  });

  ipcMain.handle('updater:getAppVersion', async () => {
    try {
      return app?.getVersion ? app.getVersion() : '1.0.0';
    } catch {
      return '1.0.0';
    }
  });

  return updater;
}

export function createMockUpdater(): any {
  const viFn = (globalThis as any).vi?.fn ?? ((impl?: any) => {
    const fn: any = (...args: any[]) => {
      fn.mock.calls.push(args);
      return impl ? impl(...args) : undefined;
    };
    fn._isMockFunction = true;
    fn.mock = { calls: [] };
    return fn;
  });

  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    autoDownload: false,
    autoInstallOnAppQuit: false,
    checkForUpdates: viFn(async () => null),
    downloadUpdate: viFn(async () => []),
    quitAndInstall: viFn(() => {})
  });
}
