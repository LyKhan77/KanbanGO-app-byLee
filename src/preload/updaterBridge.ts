import type { IpcRenderer } from 'electron';
import type { UpdaterStatus, UpdateProgress } from '../shared/types';

export interface UpdaterBridge {
  check: (manual?: boolean) => Promise<any>;
  startDownload: () => Promise<any>;
  quitAndInstall: () => Promise<any>;
  getCurrentVersion: () => Promise<string>;
  onStatus: (callback: (status: UpdaterStatus, data?: any) => void) => () => void;
  onProgress: (callback: (progress: UpdateProgress) => void) => () => void;
}

export function createUpdaterBridge(ipcRenderer: IpcRenderer): UpdaterBridge {
  return {
    check: (manual?: boolean): Promise<any> => ipcRenderer.invoke('updater:check', manual),
    startDownload: (): Promise<any> => ipcRenderer.invoke('updater:startDownload'),
    quitAndInstall: (): Promise<any> => ipcRenderer.invoke('updater:quitAndInstall'),
    getCurrentVersion: (): Promise<string> => ipcRenderer.invoke('updater:getAppVersion'),
    onStatus: (callback: (status: UpdaterStatus, data?: any) => void): (() => void) => {
      const listener = (_event: unknown, status: UpdaterStatus, data?: any): void => {
        callback(status, data);
      };
      ipcRenderer.on('updater:status', listener);
      return () => {
        ipcRenderer.removeListener('updater:status', listener);
      };
    },
    onProgress: (callback: (progress: UpdateProgress) => void): (() => void) => {
      const listener = (_event: unknown, progress: UpdateProgress): void => {
        callback(progress);
      };
      ipcRenderer.on('updater:progress', listener);
      return () => {
        ipcRenderer.removeListener('updater:progress', listener);
      };
    }
  };
}
