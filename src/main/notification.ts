import { IpcMain, Notification, BrowserWindow } from 'electron';

export const activeNotifications = new Set<Notification>();

export function restoreAndFocusWindow(win: BrowserWindow | null): void {
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
}

export function setupNotificationHandlers(
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void {
  ipcMain.handle('notify:send', async (_event, payload?: { title?: string; body?: string }) => {
    try {
      if (Notification.isSupported()) {
        const title = payload?.title || 'KanbanGO!';
        const body = payload?.body || '';

        const notification = new Notification({
          title,
          body,
          silent: false
        });

        activeNotifications.add(notification);
        const cleanup = (): void => {
          activeNotifications.delete(notification);
        };

        notification.on('click', () => {
          cleanup();
          restoreAndFocusWindow(getMainWindow());
        });

        notification.on('close', cleanup);

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
    restoreAndFocusWindow(getMainWindow());
  });
}
