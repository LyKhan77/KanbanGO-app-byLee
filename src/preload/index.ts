import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
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
