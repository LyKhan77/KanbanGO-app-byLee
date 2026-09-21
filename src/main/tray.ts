import { Tray, Menu, BrowserWindow, MenuItemConstructorOptions, nativeImage } from 'electron';

export function createTrayMenuTemplate(
  mainWindow: BrowserWindow | null,
  onQuit: () => void
): MenuItemConstructorOptions[] {
  return [
    {
      label: '📌 Buka KanbanGO!',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: '🔥 Picu Hardcore Reminder Sekarang',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('tray:trigger-briefing');
        }
      }
    },
    { type: 'separator' },
    {
      label: '🚪 Keluar / Quit',
      click: () => {
        onQuit();
      }
    }
  ];
}

// 16x16 transparent PNG with Terracotta dot fallback
const FALLBACK_ICON_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVR42mP8z8AARBgYGBhGzRh1gM6G0bChn1GMhA39jGIkbOjv0YxRDAJGBvR3mEfcqBkGcwAASkghqTj5YpkAAAAASUVORK5CYII=',
  'base64'
);

export function setupSystemTray(
  getMainWindow: () => BrowserWindow | null,
  onQuit: () => void
): Tray {
  const icon = nativeImage.createFromBuffer(FALLBACK_ICON_PNG);
  const tray = new Tray(icon);
  tray.setToolTip('KanbanGO! - Bohemian Mindful Organizer');

  const updateMenu = () => {
    const win = getMainWindow();
    const template = createTrayMenuTemplate(win, onQuit);
    const contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
  };

  updateMenu();

  tray.on('click', () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (win.isVisible()) {
        win.hide();
      } else {
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      }
    }
  });

  return tray;
}
