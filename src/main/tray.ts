import { join } from 'path';
import * as fs from 'fs';
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

// 16x16 official KanbanGO! icon buffer
const FALLBACK_ICON_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALGSURBVDhPfZJLaBNRFIZHKYjQCkIpdFGfbTG5M2noRqQtWUQnmaSpFFyIS3GhG6EFUUQMtiBtZpImbbR5J236oOCmC2senUySTt59KSo+QFQqYiu+EMRiPXKnNjZRPHA2997vv+e//yWI/5RgVFXErcoG3oLoKEeejZrRpQhHGkMs6olw6GrKrrhYzkgVH6SYmI3yzQ6QzyNmtDFnpyAzrICsowmywwpY9Cjh6Vgz5BwKKAHvmWTHBRuZT99WSAfjNgqiFhIiHIIwh2DWQkLO0QTCgPzdkqW6a9lI1BThmX55l2inIHVLIR0ub7wes5Ibeev+3ldXiL0o+Iluc+fOSXDYRHbi8WIDJITKwKgFQd7ZBAmrTFy9STTucfw8rPYXpjunnwHt5i8QM7b6XSEOvcQ+t4MhFoFgJaWbs+YD11UqVUWL7+FlrU/8YZhcBK03ARoXj4gIJ1OXj43hxCAFcRv5/T5bxRBOqKb9mWTH1LIEMr45oJ38qsouVBJhk7wbP8x2ODkkwV9e9xBUre9jM+NPv2+fmAeNKya1fjQLtCu2sOmfRdew/y0BwUZBwkZ+e2MkjjR6VtRMIL2hG8mAxskXBdrHC1hgWhKIsOR5HBmGcUyiXQFPeonWg67VNt1oFhi/WALjNkwuYQvmzez7ZW14ZCyQdyoh11fTTYzAPiaQWtcFUvihSmBpAmzHyXdIAoJRXhkyyddwVDxbLxIAO2iv+EIfzP11M27daAaPv3JqKr27+IlCLHIueZTwuYdoOOqaH8Kv/S8YJ4D3aAd/pgjjirDy/kRf3d0674fWk3ceSTFp3MJvUACtJwHtYwUwTCyAxhG9UQLjjxTm0NsHpqpjzZ7HtD6YE7Xu+FfdSBr0Y3nAVrTexDoTSCVPOGYNJTCuMItOh1i0ZjQad26taYKFWsafbNH5U3qtP6XWj+cPlVJ/6hfcn+40VesKEgAAAABJRU5ErkJggg==',
  'base64'
);

export function getAppTrayIcon(): nativeImage {
  try {
    const iconPath = join(__dirname, '../../resources/icon-16.png');
    if (typeof nativeImage.createFromPath === 'function' && fs.existsSync(iconPath)) {
      const img = nativeImage.createFromPath(iconPath);
      if (img && !img.isEmpty()) {
        return img;
      }
    }
  } catch {
    // Fall back to buffer
  }
  return nativeImage.createFromBuffer(FALLBACK_ICON_PNG);
}

export function setupSystemTray(
  getMainWindow: () => BrowserWindow | null,
  onQuit: () => void
): Tray {
  const icon = getAppTrayIcon();
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
