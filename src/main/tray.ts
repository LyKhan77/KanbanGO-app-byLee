import { Tray, Menu, BrowserWindow, MenuItemConstructorOptions, nativeImage } from 'electron';
import { restoreAndFocusWindow } from './notification';

export function createTrayMenuTemplate(
  targetWindow: (BrowserWindow | null) | (() => BrowserWindow | null),
  onQuit: () => void
): MenuItemConstructorOptions[] {
  const getWin = typeof targetWindow === 'function' ? targetWindow : () => targetWindow;
  return [
    {
      label: '📌 Buka KanbanGO!',
      click: () => {
        restoreAndFocusWindow(getWin());
      }
    },
    {
      label: '🔥 Picu Hardcore Reminder Sekarang',
      click: () => {
        const win = getWin();
        if (win && !win.isDestroyed()) {
          win.webContents.send('tray:trigger-briefing');
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
    const template = createTrayMenuTemplate(getMainWindow, onQuit);
    const contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
  };

  updateMenu();

  tray.on('click', () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (win.isVisible() && !win.isMinimized()) {
        win.hide();
      } else {
        restoreAndFocusWindow(win);
      }
    }
  });

  return tray;
}
