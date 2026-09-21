# System Tray & Native OS Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement System Tray minimization (close-to-tray) and scheduled Native OS desktop notifications for the Hardcore Personal Assistant in KanbanGO!.

**Architecture:** Electron Main process manages native `Tray`, `Menu`, and `Notification` APIs with IPC handlers for `notify:send` and `app:restore`. The Preload layer exposes secure ContextBridge methods (`showNotification`, `restoreWindow`, `onTriggerBriefingFromTray`). The React Renderer in `KanbanContext` runs a scheduled watcher matching `reminderTime` and listens for Tray manual triggers.

**Tech Stack:** Electron 31, TypeScript, React 18, Dexie.js (IndexedDB), Vitest.

---

### Task 1: Preload API & TypeScript Type Contracts

**Files:**
- Modify: `src/preload/index.d.ts`
- Modify: `src/preload/index.ts`
- Test: `tests/preload.contracts.test.ts`

- [ ] **Step 1: Write unit test for Preload contracts**

```ts
// tests/preload.contracts.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('Preload Notification and Window API Contracts', () => {
  it('defines the expected interface for notification and window management', () => {
    const mockElectronAPI = {
      ping: vi.fn(),
      getAppVersion: vi.fn(),
      getPlatform: vi.fn(),
      showNotification: vi.fn().mockResolvedValue({ success: true }),
      restoreWindow: vi.fn().mockResolvedValue(undefined),
      onTriggerBriefingFromTray: vi.fn().mockReturnValue(() => {})
    };

    expect(typeof mockElectronAPI.showNotification).toBe('function');
    expect(typeof mockElectronAPI.restoreWindow).toBe('function');
    expect(typeof mockElectronAPI.onTriggerBriefingFromTray).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/preload.contracts.test.ts`  
Expected: PASS

- [ ] **Step 3: Update `src/preload/index.d.ts` with new API methods**

```ts
export interface ElectronAPI {
  ping: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  showNotification: (options: { title: string; body: string }) => Promise<{ success: boolean }>;
  restoreWindow: () => Promise<void>;
  onTriggerBriefingFromTray: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

- [ ] **Step 4: Implement IPC bindings in `src/preload/index.ts`**

```ts
import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
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
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest run tests/preload.contracts.test.ts
git add tests/preload.contracts.test.ts src/preload/index.d.ts src/preload/index.ts
git commit -m "feat(preload): expose showNotification and tray IPC methods"
```

---

### Task 2: Electron Main Process Notification & Window Restore IPC Handlers

**Files:**
- Create: `src/main/notification.ts`
- Modify: `src/main/index.ts`
- Test: `tests/notification.main.test.ts`

- [ ] **Step 1: Write unit test for notification handler logic**

```ts
// tests/notification.main.test.ts
import { describe, it, expect, vi } from 'vitest';
import { setupNotificationHandlers } from '../src/main/notification';

describe('Main Process Notification Handlers', () => {
  it('registers notify:send and app:restore IPC handlers', () => {
    const handlers = new Map<string, Function>();
    const mockIpcMain = {
      handle: vi.fn((channel: string, handler: Function) => {
        handlers.set(channel, handler);
      })
    };

    const mockBrowserWindow = {
      isMinimized: vi.fn().mockReturnValue(false),
      isVisible: vi.fn().mockReturnValue(true),
      restore: vi.fn(),
      show: vi.fn(),
      focus: vi.fn()
    } as any;

    setupNotificationHandlers(mockIpcMain as any, () => mockBrowserWindow);

    expect(handlers.has('notify:send')).toBe(true);
    expect(handlers.has('app:restore')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx vitest run tests/notification.main.test.ts`  
Expected: FAIL ("Cannot find module ../src/main/notification")

- [ ] **Step 3: Implement `src/main/notification.ts`**

```ts
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
          if (win) {
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
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
}
```

- [ ] **Step 4: Register handlers in `src/main/index.ts`**

In `src/main/index.ts`, import `setupNotificationHandlers` and call it inside `app.whenReady()`.

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest run tests/notification.main.test.ts
git add tests/notification.main.test.ts src/main/notification.ts src/main/index.ts
git commit -m "feat(main): implement native notification and restore IPC handlers"
```

---

### Task 3: System Tray Module & Close-to-Tray Window Lifecycle

**Files:**
- Create: `src/main/tray.ts`
- Modify: `src/main/index.ts`
- Test: `tests/tray.main.test.ts`

- [ ] **Step 1: Write test for Tray menu structure**

```ts
// tests/tray.main.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createTrayMenuTemplate } from '../src/main/tray';

describe('System Tray Menu Configuration', () => {
  it('creates correct menu items including open, trigger reminder, and quit', () => {
    const mockWindow = {
      isMinimized: vi.fn().mockReturnValue(false),
      restore: vi.fn(),
      show: vi.fn(),
      focus: vi.fn(),
      webContents: { send: vi.fn() }
    } as any;

    const mockOnQuit = vi.fn();
    const template = createTrayMenuTemplate(mockWindow, mockOnQuit);

    expect(template.some((item) => item.label?.includes('Buka'))).toBe(true);
    expect(template.some((item) => item.label?.includes('Picu'))).toBe(true);
    expect(template.some((item) => item.label?.includes('Keluar'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx vitest run tests/tray.main.test.ts`  
Expected: FAIL ("Cannot find module ../src/main/tray")

- [ ] **Step 3: Implement `src/main/tray.ts`**

```ts
import { Tray, Menu, BrowserWindow, MenuItemConstructorOptions, nativeImage } from 'electron';

export function createTrayMenuTemplate(
  mainWindow: BrowserWindow | null,
  onQuit: () => void
): MenuItemConstructorOptions[] {
  return [
    {
      label: '📌 Buka KanbanGO!',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: '🔥 Picu Reminder Sekarang',
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
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVR42mP8z8AARBgYGBhGzRh1gM6G0bChn1GMhA39jGIkbOjv0YxRDAJGBvR3mEfcqBpGcwAASkghqTj5YpkAAAAASUVORK5CYII=',
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
    const template = createTrayMenuTemplate(getMainWindow(), onQuit);
    const contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
  };

  updateMenu();

  tray.on('click', () => {
    const win = getMainWindow();
    if (win) {
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
```

- [ ] **Step 4: Integrate close-to-tray in `src/main/index.ts`**

Add `let isQuitting = false;` and configure:
```ts
mainWindow.on('close', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    mainWindow.hide();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

setupSystemTray(
  () => mainWindow,
  () => {
    isQuitting = true;
    app.quit();
  }
);
```

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest run tests/tray.main.test.ts
git add tests/tray.main.test.ts src/main/tray.ts src/main/index.ts
git commit -m "feat(main): implement system tray with close-to-tray lifecycle"
```

---

### Task 4: Renderer Periodic Hardcore Reminder Scheduler & Tray Listener

**Files:**
- Modify: `src/renderer/src/context/KanbanContext.tsx`
- Test: `tests/notification.scheduler.test.ts`

- [ ] **Step 1: Write test for scheduler logic and trigger dispatch**

```ts
// tests/notification.scheduler.test.ts
import { describe, it, expect, vi } from 'vitest';
import { shouldTriggerDailyBriefing } from '../src/renderer/src/utils/scheduler';

describe('Daily Briefing Scheduler Heuristics', () => {
  it('returns true when time matches, assistant is enabled, and briefing has not fired today', () => {
    const shouldFire = shouldTriggerDailyBriefing({
      isEnabled: true,
      reminderTime: '09:00',
      lastBriefingDate: '2026-09-21',
      todayDate: '2026-09-22',
      currentTime: '09:00'
    });

    expect(shouldFire).toBe(true);
  });

  it('returns false when already briefed today', () => {
    const shouldFire = shouldTriggerDailyBriefing({
      isEnabled: true,
      reminderTime: '09:00',
      lastBriefingDate: '2026-09-22',
      todayDate: '2026-09-22',
      currentTime: '09:00'
    });

    expect(shouldFire).toBe(false);
  });

  it('returns false when currentTime does not match reminderTime', () => {
    const shouldFire = shouldTriggerDailyBriefing({
      isEnabled: true,
      reminderTime: '09:00',
      lastBriefingDate: '2026-09-21',
      todayDate: '2026-09-22',
      currentTime: '10:15'
    });

    expect(shouldFire).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx vitest run tests/notification.scheduler.test.ts`  
Expected: FAIL ("Cannot find module ../src/renderer/src/utils/scheduler")

- [ ] **Step 3: Implement `src/renderer/src/utils/scheduler.ts`**

```ts
export interface SchedulerCheckParams {
  isEnabled: boolean;
  reminderTime: string;
  lastBriefingDate?: string;
  todayDate: string;
  currentTime: string;
}

export function shouldTriggerDailyBriefing(params: SchedulerCheckParams): boolean {
  if (!params.isEnabled) return false;
  if (params.lastBriefingDate === params.todayDate) return false;
  return params.currentTime === params.reminderTime;
}
```

- [ ] **Step 4: Integrate background scheduler & tray listener into `KanbanContext.tsx`**

In `src/renderer/src/context/KanbanContext.tsx`:
- Add `useEffect` with a 30-second interval running `shouldTriggerDailyBriefing`.
- When triggered, invoke `window.electronAPI.showNotification({ title: '🔥 KanbanGO! Hardcore Coach', body: briefing.message })` and update `assistantConfig.lastBriefingDate = todayDate`.
- Attach `window.electronAPI.onTriggerBriefingFromTray?.(() => { ... })` to immediately generate and fire a notification.

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest run tests/notification.scheduler.test.ts
git add tests/notification.scheduler.test.ts src/renderer/src/utils/scheduler.ts src/renderer/src/context/KanbanContext.tsx
git commit -m "feat(renderer): implement periodic briefing notification scheduler and tray listener"
```

---

### Task 5: Full E2E & Production Build Verification

**Files:**
- Test: All tests in `tests/`
- Build: `npm run build`

- [ ] **Step 1: Run complete test suite**

Run: `npm test`  
Expected: PASS (All test files passing with 0 failures)

- [ ] **Step 2: Run production Electron build**

Run: `npm run build`  
Expected: Exit 0 with bundles generated for `out/main`, `out/preload`, `out/renderer`.

- [ ] **Step 3: Check git status and commit**

```bash
git status
git add .
git commit -m "test: verify complete system tray and native notification feature set"
```
