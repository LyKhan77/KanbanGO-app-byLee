export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  sendNotification: (payload: { title: string; body: string }) => void;
  showSaveBackupDialog: (defaultFileName: string) => Promise<string | null>;
  showOpenBackupDialog: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
