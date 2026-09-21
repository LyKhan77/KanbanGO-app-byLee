import { IpcMain, Notification, BrowserWindow } from 'electron';

export function setupNotificationHandlers(
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void {
  ipcMain.handle('notify:send', async (_event, { title, body }: { title: string; body: string }) => {
    try {
      if (Notification.isSupported()) {
        const notification = new Notification({
          title: title || 'KanbanGO!',
          body: body || '',
          silent: false
        });

        notification.on('click', () => {
          const win = getMainWindow();
          if (win && !win.isDestroyed()) {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
          }
        });

        notification.show();
        return { success: true };
      }
      return { success: false, reason: 'unsupported' };
    } catch (error) {
      console.error('Failed to display native notification:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('app:restore', async () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
}
