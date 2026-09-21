# Design Specification: System Tray & Native OS Notifications for KanbanGO!

**Date:** 2026-09-22  
**Author:** Pair Programming Agent & User  
**Status:** Approved  
**Target:** Electron Desktop App (Windows, macOS, Linux)

---

## 1. Executive Summary
KanbanGO! requires an offline background presence on the desktop operating system to fulfill its "Hardcore Personal Assistant / Daily Reminder" promise. When closed, the application minimizes to the System Tray instead of terminating. At the scheduled reminder time (or when manually requested from the tray), the app issues native OS desktop notifications (Windows Toast / macOS Notification Center / Linux notifications). Clicking the notification restores and focuses the KanbanGO! window.

---

## 2. Architecture & IPC Contracts

### 2.1 Communication Flow
```mermaid
sequenceDiagram
    participant Renderer as React Renderer (KanbanContext)
    participant Preload as Preload ContextBridge
    participant Main as Electron Main Process
    participant OS as Native OS (Tray & Notifications)

    Note over Renderer: Background timer matches reminderTime (e.g. 09:00)
    Renderer->>Preload: window.electronAPI.showNotification(payload)
    Preload->>Main: ipcRenderer.invoke('notify:send', payload)
    Main->>OS: new Notification({ title, body, icon }).show()
    
    Note over OS: User clicks toast notification
    OS->>Main: notification.on('click')
    Main->>Main: mainWindow.show(); mainWindow.focus()

    Note over OS: User right-clicks Tray -> "Picu Reminder Sekarang"
    OS->>Main: Tray menu clicked
    Main->>Renderer: webContents.send('tray:trigger-briefing')
    Renderer->>Renderer: Generate briefing & trigger notification
```

### 2.2 IPC Channel Definitions
- `notify:send` (`ipcRenderer.invoke` -> `ipcMain.handle`):
  - Input: `{ title: string; body: string; icon?: string }`
  - Output: `{ success: boolean }`
- `app:restore` (`ipcRenderer.invoke` -> `ipcMain.handle`):
  - Restores and focuses the main browser window.
- `tray:trigger-briefing` (`webContents.send` -> `ipcRenderer.on`):
  - Sourced from Tray menu to prompt renderer to perform an immediate briefing check.

### 2.3 Preload API Extension (`src/preload/index.d.ts` & `src/preload/index.ts`)
```ts
export interface ElectronAPI {
  // Existing APIs
  ping: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;

  // Notification & Window Restoration APIs
  showNotification: (options: { title: string; body: string }) => Promise<{ success: boolean }>;
  restoreWindow: () => Promise<void>;
  onTriggerBriefingFromTray: (callback: () => void) => () => void;
}
```

---

## 3. System Tray Lifecycle & Close-to-Tray

### 3.1 Window Close Interception (`src/main/index.ts`)
- Variable `let isQuitting = false;` tracks deliberate exit requests.
- `mainWindow.on('close', (event) => { if (!isQuitting) { event.preventDefault(); mainWindow.hide(); } });`
- `app.on('before-quit', () => { isQuitting = true; });`

### 3.2 System Tray Menu Setup (`src/main/tray.ts`)
- **Icon:** A 32x32 / 16x16 PNG icon with Bohemian styling (Terracotta `#c86d51` leaf/feather motif).
- **Tray Tooltip:** `"KanbanGO! - Bohemian Mindful Organizer"`
- **Context Menu Items:**
  1. `📌 Buka KanbanGO!` ➔ `showAndFocusWindow(mainWindow)`
  2. `🔥 Picu Hardcore Reminder Sekarang` ➔ Sends `'tray:trigger-briefing'` to `mainWindow.webContents`
  3. Separator
  4. `🚪 Keluar / Quit` ➔ Sets `isQuitting = true`, calls `app.quit()`
- **Click Behavior:**
  - On Windows/Linux: Double-click or single-click toggles/shows the main window.
  - On macOS: Right-click / click opens context menu.

---

## 4. Scheduled Notification Engine (Renderer)

### 4.1 Timer & Frequency (`src/renderer/src/context/KanbanContext.tsx`)
- Periodic interval checks every 30 seconds:
  ```ts
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  const today = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

  if (
    assistantConfig.isEnabled &&
    assistantConfig.lastBriefingDate !== today &&
    currentTime === assistantConfig.reminderTime
  ) {
    const briefing = generateDailyBriefing(profile, cards, columns);
    if (briefing && window.electronAPI?.showNotification) {
      window.electronAPI.showNotification({
        title: `🔥 Hardcore Coach: ${briefing.headline}`,
        body: briefing.message
      });
      updateAssistantConfig({ lastBriefingDate: today });
    }
  }
  ```
- Also listens to `window.electronAPI?.onTriggerBriefingFromTray?.(() => { ... })` to force-generate and dispatch an immediate briefing notification regardless of time.

---

## 5. Error Handling & Edge Cases
1. **Notifications Unsupported / Permission Denied:**
   - Fallback safely to in-app banner (`DailyBriefingBanner`) if Electron native notifications are suppressed or unsupported in headless environments.
2. **Multiple Triggers Prevention:**
   - Database update of `lastBriefingDate` immediately prevents double firing in the same minute window.
3. **Tray Icon Missing:**
   - Provide an in-memory fallback icon (using `nativeImage.createFromBuffer` or inline SVG/PNG buffer) if asset file path fails to load.

---

## 6. Testing & Verification Strategy
1. **Unit Tests:**
   - Test scheduler condition checker logic with mock clock and assistant settings.
   - Verify IPC handler registration and payload routing.
2. **Integration Verification:**
   - Test `window.electronAPI.showNotification` mock contracts.
   - Verify `lastBriefingDate` updates in Dexie database on trigger.
3. **Build & Package Verification:**
   - Ensure clean compilation with `npm run build` and zero TypeScript linter errors.
