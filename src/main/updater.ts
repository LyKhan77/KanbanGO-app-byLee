import { app, IpcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';

export function setupAutoUpdater(
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null,
  customUpdater?: any,
  onBeforeQuit?: () => void
): any {
  let updater = customUpdater;
  if (!updater) {
    try {
      updater = autoUpdater;
    } catch {
      // In vitest/unit test environments where electron.app is absent
      updater = null;
    }
  }

  // Ensure safe download & install options are set
  if (updater) {
    try {
      updater.autoDownload = false;
      updater.autoInstallOnAppQuit = false;
    } catch {
      // Ignore in non-electron runner
    }
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

  if (updater && typeof updater.on === 'function') {
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
  }

  ipcMain.handle('updater:check', async (_event: any, _manual?: boolean) => {
    try {
      if (!updater || typeof updater.checkForUpdates !== 'function') {
        return { error: 'Updater not available' };
      }
      return await updater.checkForUpdates();
    } catch (error: any) {
      console.error('Failed to check for updates:', error);
      return { error: error?.message || String(error) };
    }
  });

  ipcMain.handle('updater:startDownload', async () => {
    try {
      if (!updater || typeof updater.downloadUpdate !== 'function') {
        return { error: 'Updater not available' };
      }
      return await updater.downloadUpdate();
    } catch (error: any) {
      console.error('Failed to download update:', error);
      return { error: error?.message || String(error) };
    }
  });

  ipcMain.handle('updater:quitAndInstall', async () => {
    try {
      if (onBeforeQuit) {
        onBeforeQuit();
      }
      if (updater && typeof updater.quitAndInstall === 'function') {
        updater.quitAndInstall();
      }
      return { success: true };
    } catch (error: any) {
      console.error('Failed to quit and install update:', error);
      return { error: error?.message || String(error) };
    }
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
