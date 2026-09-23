# Cross-Platform Packaging & Auto-Updater Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide full cross-platform distribution targets (Windows .exe, macOS .dmg/.zip, Linux .AppImage/.deb) via `electron-builder` and GitHub Actions, coupled with an optional in-app auto-update system using `electron-updater` and a Bohemian update dialog.

**Architecture:** Main process initializes `electron-updater` with `autoDownload = false` and exposes IPC channels through a secure preload context bridge. The React renderer manages update states in `KanbanContext`, displays a Bohemian-styled `UpdateModal` with release notes and download progress, persists ignored versions in Dexie `UserSettings`, and triggers checks either on app start or manually from Settings. Cloud builds are driven by `.github/workflows/release.yml`.

**Tech Stack:** Electron 31, electron-builder 24, electron-updater 6, React 18, Tailwind CSS, Lucide React, Dexie 4, Vitest.

---

### File Structure Map
- **Config & Workflows**:
  - Modify: `package.json` (add `electron-updater` dependency, publish config, detailed win/mac/linux target settings).
  - Create: `.github/workflows/release.yml` (multi-OS matrix for Windows, macOS, Linux).
- **Shared Types**:
  - Modify: `src/shared/types.ts` (add `ignoredUpdateVersion` to `UserSettings`, define `UpdateInfo`, `UpdateProgress`, `UpdaterStatus`).
- **Main Process**:
  - Create: `src/main/updater.ts` (setup autoUpdater with safe download policy, event listeners, IPC handlers, mock testing harness).
  - Modify: `src/main/index.ts` (wire `setupAutoUpdater` on app ready).
- **Preload Bridge**:
  - Modify: `src/preload/index.ts` (expose `electronAPI.updater`).
  - Modify: `src/preload/index.d.ts` (type definitions for `UpdaterAPI`).
- **Renderer State & Components**:
  - Modify: `src/renderer/src/context/KanbanContext.tsx` (updater state, manual check action, download action, ignore version action).
  - Create: `src/renderer/src/components/modal/UpdateModal.tsx` (Bohemian update modal with changelog, progress bar, 3 user options).
  - Modify: `src/renderer/src/components/modal/SettingsModal.tsx` (add "Tentang & Pembaruan" section with version display and manual check button).
  - Modify: `src/renderer/src/components/modal/CommandPalette.tsx` (add "Cek Pembaruan" command).
  - Modify: `src/renderer/src/App.tsx` (mount `UpdateModal`).
- **Tests**:
  - Create: `tests/types.updater.test.ts`
  - Create: `tests/main.updater.test.ts`
  - Create: `tests/preload.updater.test.ts`
  - Create: `tests/context.updater.test.ts`
  - Create: `tests/modal.updateModal.test.tsx`
  - Create: `tests/settings.updater.test.tsx`
  - Create: `tests/e2e.updater.test.tsx`

---

### Task 1: Shared Types & Package.json Build Targets

**Files:**
- Modify: `package.json`
- Modify: `src/shared/types.ts`
- Create: `tests/types.updater.test.ts`

- [ ] **Step 1: Write the failing test for updater types and settings schema**

Create `tests/types.updater.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { UserSettings, UpdateInfo, UpdateProgress, UpdaterStatus } from '../src/shared/types';

describe('Updater Types and Settings', () => {
  it('allows ignoredUpdateVersion in UserSettings', () => {
    const settings: UserSettings = {
      defaultColumnId: 'col-1',
      enableNotifications: true,
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      theme: 'bohemian-light',
      activeViewMode: 'kanban',
      ignoredUpdateVersion: '1.2.0'
    };
    expect(settings.ignoredUpdateVersion).toBe('1.2.0');
  });

  it('validates UpdateInfo structure', () => {
    const info: UpdateInfo = {
      version: '1.1.0',
      releaseDate: '2026-09-23',
      releaseNotes: '### Perbaikan bug\n- Peningkatan performa kalender'
    };
    expect(info.version).toBe('1.1.0');
    expect(info.releaseNotes).toContain('Perbaikan bug');
  });

  it('validates UpdateProgress calculation', () => {
    const progress: UpdateProgress = {
      percent: 45.5,
      bytesPerSecond: 1048576,
      transferred: 47185920,
      total: 104857600
    };
    expect(progress.percent).toBeCloseTo(45.5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/types.updater.test.ts`
Expected: FAIL with missing type exports `UpdateInfo`, `UpdateProgress`, etc.

- [ ] **Step 3: Update `package.json` and `src/shared/types.ts`**

In `src/shared/types.ts`, add:
```typescript
export type UpdaterStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}
```
And add `ignoredUpdateVersion?: string;` to `UserSettings`.

In `package.json`:
- Install `electron-updater`: `npm install electron-updater`
- Configure `"publish"` and target configurations in `"build"`:
```json
  "build": {
    "appId": "com.kanbango.app",
    "productName": "KanbanGO!",
    "directories": {
      "output": "dist"
    },
    "publish": {
      "provider": "github",
      "owner": "KanbanGO",
      "repo": "KanbanGo2",
      "releaseType": "release"
    },
    "files": [
      "out/**/*"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "KanbanGO!"
    },
    "mac": {
      "target": [
        "dmg",
        "zip"
      ],
      "category": "public.app-category.productivity"
    },
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ],
      "category": "Office"
    }
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/types.updater.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/shared/types.ts tests/types.updater.test.ts
git commit -m "feat: configure electron-updater dependency, packaging targets, and updater types"
```

---

### Task 2: Main Process Updater Module & IPC Handlers

**Files:**
- Create: `src/main/updater.ts`
- Modify: `src/main/index.ts`
- Create: `tests/main.updater.test.ts`

- [ ] **Step 1: Write the failing test for main updater logic**

Create `tests/main.updater.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupAutoUpdater, createMockUpdater } from '../src/main/updater';

describe('Main Process AutoUpdater Module', () => {
  let mockIpcMain: any;
  let mockWindow: any;
  let handlers: Record<string, Function>;

  beforeEach(() => {
    handlers = {};
    mockIpcMain = {
      handle: vi.fn((channel: string, handler: Function) => {
        handlers[channel] = handler;
      }),
      on: vi.fn((channel: string, handler: Function) => {
        handlers[channel] = handler;
      })
    };
    mockWindow = {
      webContents: {
        send: vi.fn()
      }
    };
  });

  it('registers IPC handlers for updater:check, startDownload, quitAndInstall, and getAppVersion', () => {
    const mockUpdater = createMockUpdater();
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    expect(mockIpcMain.handle).toHaveBeenCalledWith('updater:check', expect.any(Function));
    expect(mockIpcMain.handle).toHaveBeenCalledWith('updater:startDownload', expect.any(Function));
    expect(mockIpcMain.handle).toHaveBeenCalledWith('updater:quitAndInstall', expect.any(Function));
    expect(mockIpcMain.handle).toHaveBeenCalledWith('updater:getAppVersion', expect.any(Function));
  });

  it('emits updater:status with available when update is found', async () => {
    const mockUpdater = createMockUpdater();
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    mockUpdater.emit('update-available', {
      version: '1.2.0',
      releaseDate: '2026-09-23',
      releaseNotes: 'Fitur baru'
    });

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('updater:status', 'available', {
      version: '1.2.0',
      releaseDate: '2026-09-23',
      releaseNotes: 'Fitur baru'
    });
  });

  it('emits updater:progress during download', () => {
    const mockUpdater = createMockUpdater();
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    mockUpdater.emit('download-progress', {
      percent: 50,
      bytesPerSecond: 1000,
      transferred: 5000,
      total: 10000
    });

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('updater:progress', {
      percent: 50,
      bytesPerSecond: 1000,
      transferred: 5000,
      total: 10000
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/main.updater.test.ts`
Expected: FAIL with module `../src/main/updater` not found.

- [ ] **Step 3: Implement `src/main/updater.ts` and integrate into `src/main/index.ts`**

Create `src/main/updater.ts`:
- Import `autoUpdater` from `electron-updater`.
- Configure `autoUpdater.autoDownload = false` and `autoUpdater.autoInstallOnAppQuit = false`.
- Connect event listeners to send status to `mainWindow.webContents.send`.
- Provide `createMockUpdater()` for testing and development bypass.
- Export `setupAutoUpdater(ipcMain, getMainWindow, customUpdater?)`.

Update `src/main/index.ts`:
- Call `setupAutoUpdater(ipcMain, () => mainWindow)` inside `app.whenReady()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/main.updater.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/main/updater.ts src/main/index.ts tests/main.updater.test.ts
git commit -m "feat: implement main process updater module and IPC handlers"
```

---

### Task 3: Preload Context Bridge & TypeScript Declarations

**Files:**
- Modify: `src/preload/index.ts`
- Modify: `src/preload/index.d.ts`
- Create: `tests/preload.updater.test.ts`

- [ ] **Step 1: Write the failing test for preload updater bridge**

Create `tests/preload.updater.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { createUpdaterBridge } from '../src/preload/updaterBridge';

describe('Preload Updater Bridge', () => {
  it('exposes check, startDownload, quitAndInstall, getCurrentVersion, and listener registration', async () => {
    const mockIpcRenderer = {
      invoke: vi.fn().mockResolvedValue({ success: true }),
      on: vi.fn(),
      removeListener: vi.fn()
    };

    const bridge = createUpdaterBridge(mockIpcRenderer as any);
    await bridge.check(true);
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('updater:check', true);

    await bridge.startDownload();
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('updater:startDownload');

    await bridge.quitAndInstall();
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('updater:quitAndInstall');

    const unsubscribe = bridge.onStatus((status, data) => {});
    expect(mockIpcRenderer.on).toHaveBeenCalledWith('updater:status', expect.any(Function));
    unsubscribe();
    expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith('updater:status', expect.any(Function));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/preload.updater.test.ts`
Expected: FAIL with `createUpdaterBridge` not found.

- [ ] **Step 3: Implement `src/preload/updaterBridge.ts`, update `src/preload/index.ts` and `src/preload/index.d.ts`**

Create `src/preload/updaterBridge.ts` with typed helpers.
Update `src/preload/index.ts` to attach `updater` to `electronAPI`.
Update `src/preload/index.d.ts` to define `UpdaterAPI`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/preload.updater.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/preload/updaterBridge.ts src/preload/index.ts src/preload/index.d.ts tests/preload.updater.test.ts
git commit -m "feat: expose safe updater API via preload context bridge"
```

---

### Task 4: KanbanContext State & Ignored Version Persistence

**Files:**
- Modify: `src/renderer/src/context/KanbanContext.tsx`
- Create: `tests/context.updater.test.ts`

- [ ] **Step 1: Write the failing test for context updater state & actions**

Create `tests/context.updater.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { KanbanProvider, useKanban } from '../src/renderer/src/context/KanbanContext';
import { db } from '../src/renderer/src/db';

describe('KanbanContext Updater State', () => {
  beforeEach(async () => {
    await db.boards.clear();
    await db.settings.clear();
  });

  it('initializes with idle updaterStatus and closed modal', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KanbanProvider>{children}</KanbanProvider>
    );
    const { result } = renderHook(() => useKanban(), { wrapper });

    expect(result.current.updaterStatus).toBe('idle');
    expect(result.current.isUpdateModalOpen).toBe(false);
  });

  it('persists ignoredUpdateVersion in userSettings when ignoreUpdateVersion is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KanbanProvider>{children}</KanbanProvider>
    );
    const { result } = renderHook(() => useKanban(), { wrapper });

    await act(async () => {
      await result.current.ignoreUpdateVersion('1.1.0');
    });

    expect(result.current.settings.ignoredUpdateVersion).toBe('1.1.0');
    expect(result.current.isUpdateModalOpen).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/context.updater.test.ts`
Expected: FAIL with `updaterStatus` or `ignoreUpdateVersion` missing from `KanbanContext`.

- [ ] **Step 3: Update `src/renderer/src/context/KanbanContext.tsx`**

Add state variables:
- `updaterStatus: UpdaterStatus`
- `updateInfo: UpdateInfo | null`
- `updateProgress: UpdateProgress | null`
- `isUpdateModalOpen: boolean`
- `updateErrorMessage: string | null`
Add functions:
- `checkForUpdates: (manual?: boolean) => Promise<void>`
- `startAppUpdate: () => Promise<void>`
- `installAppUpdate: () => Promise<void>`
- `ignoreUpdateVersion: (version: string) => Promise<void>`
- `closeUpdateModal: () => void`
- `openUpdateModal: () => void`
Hook into preload `electronAPI.updater` on mount if running in Electron environment:
- On `updater:status`:
  - If `status === 'available'`:
    - If `manual === true` or `info.version !== settings.ignoredUpdateVersion`: set `isUpdateModalOpen(true)`.
  - If `status === 'not-available'` and manual: set toast / notification.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/context.updater.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/context/KanbanContext.tsx tests/context.updater.test.ts
git commit -m "feat: add updater state and ignored version persistence to KanbanContext"
```

---

### Task 5: Bohemian Update Modal Component

**Files:**
- Create: `src/renderer/src/components/modal/UpdateModal.tsx`
- Modify: `src/renderer/src/App.tsx`
- Create: `tests/modal.updateModal.test.tsx`

- [ ] **Step 1: Write the failing test for UpdateModal component**

Create `tests/modal.updateModal.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { UpdateModal } from '../src/renderer/src/components/modal/UpdateModal';

describe('UpdateModal Component', () => {
  const defaultProps = {
    isOpen: true,
    currentVersion: '1.0.0',
    updateInfo: {
      version: '1.1.0',
      releaseNotes: '### Fitur Baru\n- Pemandangan Kalender\n- Bohemian Card Covers'
    },
    status: 'available' as const,
    progress: null,
    errorMessage: null,
    onStartDownload: vi.fn(),
    onInstall: vi.fn(),
    onPostpone: vi.fn(),
    onIgnoreVersion: vi.fn()
  };

  it('renders version comparison and release notes', () => {
    render(<UpdateModal {...defaultProps} />);
    expect(screen.getByText(/Pembaruan Versi Tersedia/i)).toBeInTheDocument();
    expect(screen.getByText(/v1.0.0/)).toBeInTheDocument();
    expect(screen.getByText(/v1.1.0/)).toBeInTheDocument();
    expect(screen.getByText(/Pemandangan Kalender/)).toBeInTheDocument();
  });

  it('triggers onStartDownload when clicking Perbarui Sekarang', () => {
    render(<UpdateModal {...defaultProps} />);
    const updateBtn = screen.getByRole('button', { name: /Perbarui Sekarang/i });
    fireEvent.click(updateBtn);
    expect(defaultProps.onStartDownload).toHaveBeenCalled();
  });

  it('triggers onPostpone when clicking Nanti Saja', () => {
    render(<UpdateModal {...defaultProps} />);
    const postponeBtn = screen.getByRole('button', { name: /Nanti Saja/i });
    fireEvent.click(postponeBtn);
    expect(defaultProps.onPostpone).toHaveBeenCalled();
  });

  it('triggers onIgnoreVersion when clicking Abaikan Versi Ini', () => {
    render(<UpdateModal {...defaultProps} />);
    const ignoreBtn = screen.getByRole('button', { name: /Abaikan Versi Ini/i });
    fireEvent.click(ignoreBtn);
    expect(defaultProps.onIgnoreVersion).toHaveBeenCalledWith('1.1.0');
  });

  it('renders progress bar when status is downloading', () => {
    render(
      <UpdateModal
        {...defaultProps}
        status="downloading"
        progress={{ percent: 65, bytesPerSecond: 1048576, transferred: 68157440, total: 104857600 }}
      />
    );
    expect(screen.getByText(/Mengunduh pembaruan/i)).toBeInTheDocument();
    expect(screen.getByText(/65%/)).toBeInTheDocument();
  });

  it('renders Mulai Ulang & Pasang button when status is downloaded', () => {
    render(<UpdateModal {...defaultProps} status="downloaded" />);
    expect(screen.getByText(/Pembaruan Siap Dipasang!/i)).toBeInTheDocument();
    const installBtn = screen.getByRole('button', { name: /Mulai Ulang & Pasang/i });
    fireEvent.click(installBtn);
    expect(defaultProps.onInstall).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/modal.updateModal.test.tsx`
Expected: FAIL with `UpdateModal` not found.

- [ ] **Step 3: Implement `src/renderer/src/components/modal/UpdateModal.tsx` and mount in `App.tsx`**

Create `src/renderer/src/components/modal/UpdateModal.tsx`:
- Render with `#fdfbf7` background, `#e4ded5` border, rounded-2xl, shadow-2xl.
- Header with `Sparkles` icon in terracotta chip.
- Version transition pills `v1.0.0 ➔ v1.1.0`.
- Release notes parsed with `renderMarkdownToHtml(updateInfo.releaseNotes)`.
- Download progress bar with terracotta fill when `status === 'downloading'`.
- Buttons:
  - When `available`: **[Perbarui Sekarang]**, **[Nanti Saja]**, and text button **[Abaikan Versi Ini]**.
  - When `downloading`: disabled cancel or spinner.
  - When `downloaded`: **[Mulai Ulang & Pasang]** and **[Nanti Saja]**.
- Mount `UpdateModal` in `src/renderer/src/App.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/modal.updateModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/components/modal/UpdateModal.tsx src/renderer/src/App.tsx tests/modal.updateModal.test.tsx
git commit -m "feat: implement Bohemian UpdateModal and mount in App"
```

---

### Task 6: Settings Modal & Command Palette Integration

**Files:**
- Modify: `src/renderer/src/components/modal/SettingsModal.tsx`
- Modify: `src/renderer/src/components/modal/CommandPalette.tsx`
- Create: `tests/settings.updater.test.tsx`

- [ ] **Step 1: Write the failing test for Settings update section and Command Palette action**

Create `tests/settings.updater.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SettingsModal } from '../src/renderer/src/components/modal/SettingsModal';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('SettingsModal Updater Section', () => {
  it('renders app version and Periksa Pembaruan button', () => {
    const mockCheckForUpdates = vi.fn();
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'idle',
      currentAppVersion: '1.0.0',
      checkForUpdates: mockCheckForUpdates
    };

    render(
      <KanbanContext.Provider value={contextValue}>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </KanbanContext.Provider>
    );

    expect(screen.getByText(/Versi 1.0.0/i)).toBeInTheDocument();
    const checkBtn = screen.getByRole('button', { name: /Periksa Pembaruan/i });
    fireEvent.click(checkBtn);
    expect(mockCheckForUpdates).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/settings.updater.test.tsx`
Expected: FAIL with missing updater section in `SettingsModal`.

- [ ] **Step 3: Update `SettingsModal.tsx` and `CommandPalette.tsx`**

In `SettingsModal.tsx`:
- Add a new card section "Tentang & Pembaruan Aplikasi".
- Display app name, icon, version pill `v{currentAppVersion || '1.0.0'}`.
- Button: `[🔄 Periksa Pembaruan]`.
- Inline status feedback if `updaterStatus === 'checking'` ("Sedang memeriksa..."), or `updaterStatus === 'not-available'` ("Aplikasi sudah versi terbaru!").

In `CommandPalette.tsx`:
- Add command item `{ id: 'check-updates', title: 'Periksa Pembaruan Aplikasi', icon: 'RefreshCw', action: () => checkForUpdates(true) }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/settings.updater.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/components/modal/SettingsModal.tsx src/renderer/src/components/modal/CommandPalette.tsx tests/settings.updater.test.tsx
git commit -m "feat: add manual update check to SettingsModal and CommandPalette"
```

---

### Task 7: GitHub Actions CI/CD Workflow & Full E2E Verification

**Files:**
- Create: `.github/workflows/release.yml`
- Create: `tests/e2e.updater.test.tsx`

- [ ] **Step 1: Write E2E test for full update flow**

Create `tests/e2e.updater.test.tsx`:
- Test simulation:
  1. Trigger update check.
  2. Receive available update `v1.2.0`.
  3. Modal appears with release notes.
  4. User clicks "Abaikan Versi Ini" -> modal closes, `ignoredUpdateVersion` saved.
  5. Subsequent auto-check suppresses modal.
  6. Manual check from Settings still opens modal.
  7. User clicks "Perbarui Sekarang" -> status transitions to downloading, then downloaded.
  8. User clicks "Mulai Ulang & Pasang" -> invokes `updater:quitAndInstall`.

- [ ] **Step 2: Run E2E test to verify**

Run: `npx vitest run tests/e2e.updater.test.tsx`
Expected: PASS

- [ ] **Step 3: Create `.github/workflows/release.yml`**

Create `.github/workflows/release.yml`:
```yaml
name: Release Multi-Platform App

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Tests
        run: npm test

      - name: Build and Publish Electron Package
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run build
          npx electron-builder --publish always
```

- [ ] **Step 4: Run full test suite & production build verification**

Run: `npm test`
Expected: All test suites PASS (24+ suites).

Run: `npm run build`
Expected: Production build succeeds without errors.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/release.yml tests/e2e.updater.test.tsx
git commit -m "ci: add multi-platform GitHub Actions release workflow and e2e updater tests"
```
