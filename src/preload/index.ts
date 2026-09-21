import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  getPlatform: (): Promise<string> => ipcRenderer.invoke('app:platform'),
  showNotification: (options: { title: string; body: string }): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('notify:send', options),
  restoreWindow: (): Promise<void> => ipcRenderer.invoke('app:restore'),
  onTriggerBriefingFromTray: (callback: () => void): (() => void) => {
    const listener = (): void => callback();
    ipcRenderer.on('tray:trigger-briefing', listener);
    return () => ipcRenderer.removeListener('tray:trigger-briefing', listener);
  },
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  sendNotification: (payload: { title: string; body: string }) =>
    ipcRenderer.send('notification:send', payload),
  showSaveBackupDialog: (defaultFileName: string): Promise<string | null> =>
    ipcRenderer.invoke('dialog:saveBackup', defaultFileName),
  showOpenBackupDialog: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:openBackup')
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.electronAPI = electronAPI;
}
