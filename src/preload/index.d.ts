export interface ElectronAPI {
  ping: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  showNotification: (options: { title: string; body: string }) => Promise<{ success: boolean }>;
  restoreWindow: () => Promise<void>;
  onTriggerBriefingFromTray: (callback: () => void) => () => void;
  minimizeWindow?: () => void;
  maximizeWindow?: () => void;
  closeWindow?: () => void;
  sendNotification?: (payload: { title: string; body: string }) => void;
  showSaveBackupDialog?: (defaultFileName: string) => Promise<string | null>;
  showOpenBackupDialog?: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
