# Multi-Board Tabs, Command Palette & Window Dragging Design Specification

**Date:** 2026-09-22  
**Feature:** Multi-Board Tabs, Global Command Palette (Ctrl+K / Ctrl+P), and Desktop Window Dragging Fix  
**Status:** Approved by User  
**Target:** KanbanGO! Desktop Application (Electron + React + TypeScript + Dexie.js)

---

## 1. Executive Summary & Objectives

This specification defines the architecture, behavior, and visual interfaces for:
1. **Desktop Window Dragging Fix:** Enabling native window dragging on the frameless custom titlebar while keeping interactive elements (tabs, buttons, inputs) clickable and responsive.
2. **Multi-Board Tabs in WindowHeader:** A browser-like tab bar integrated directly into the custom titlebar to allow instant switching between active boards with tab closing (`✕`) and creation (`+`) capabilities.
3. **Bohemian Command Palette (Spotlight / Ctrl+K / Ctrl+P):** A global modal overlay providing instant fuzzy/substring searching and keyboard navigation across Boards, Cards/Tasks, and Quick Actions.

---

## 2. Window Dragging & Titlebar Ergonomics

### 2.1 The Issue
In Electron frameless mode (`frame: false`), the native OS requires `-webkit-app-region: drag` to designate regions where mouse clicks initiate window movement. Currently, `src/renderer/src/styles/index.css` lacks definitions for `.app-drag` and `.app-no-drag`.

### 2.2 Styling Definitions (`src/renderer/src/styles/index.css`)
```css
@layer utilities {
  .app-drag {
    -webkit-app-region: drag;
  }
  .app-no-drag {
    -webkit-app-region: no-drag;
  }
}
```

### 2.3 Layout & Drag Hierarchy (`src/renderer/src/components/layout/WindowHeader.tsx`)
- The `<header>` element is assigned `app-drag` across its full width and height (`h-10`).
- Interactive child elements are explicitly assigned `app-no-drag`:
  - Brand icon and text (if clicked).
  - Each Board Tab element and its close (`✕`) button.
  - New tab button (`+`).
  - Command Palette trigger button (`⌘K`).
  - Window control buttons (Minimize `-`, Maximize `□`, Close `✕`).
- Empty spaces in the header (e.g., between the tabs and the window controls) remain designated as `app-drag`.
- Double-clicking an `app-drag` empty space triggers `maximizeWindow` / `unmaximizeWindow`.

---

## 3. Multi-Board Tabs Architecture & Lifecycle

### 3.1 Tab Bar Integration (`WindowHeader.tsx`)
The tab bar sits between the KanbanGO! brand lockup and the window control buttons.

```
+---------------------------------------------------------------------------------------------+
| 🪶 KanbanGO! | [📌 Project Alpha ✕] [📌 Bohemian Backlog ✕] [+] | [ 🔍 ⌘K ] | [-] [□] [✕] |
+---------------------------------------------------------------------------------------------+
```

### 3.2 Visual Styling (Bohemian Minimalist Aesthetic)
- **Active Tab:**
  - Background: Solid white (`bg-white`).
  - Text: Bold espresso (`text-boho-espresso`).
  - Border: Soft canvas border with a terracotta accent underline or top highlight (`border-terracotta`).
  - Close button: Visible on the right of the tab (`text-boho-clay hover:text-terracotta`).
- **Inactive Tab:**
  - Background: Transparent / subtle sand (`bg-transparent hover:bg-boho-canvas/50`).
  - Text: Muted walnut (`text-boho-walnut`).
  - Close button: Subtle on hover.
- **Add Tab Button (`+`):**
  - Icon button right after the last tab (`p-1 text-boho-clay hover:text-terracotta hover:bg-boho-canvas/60 rounded-md`).
- **Tab Overflow / Scroll:**
  - Horizontal scroll container with hidden scrollbars (`overflow-x-auto no-scrollbar`).
  - Mouse wheel scrolls horizontally (`onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}`).

### 3.3 State Management (`KanbanContext.tsx`)
- State: `openBoardIds: string[]`
- Initialization logic:
  - If `db.settings.openBoardIds` is saved in IndexedDB, load it.
  - Filter `openBoardIds` against currently existing non-archived boards.
  - If empty or invalid, fallback to `[activeBoardId || allBoards[0].id]`.
- Actions:
  - `openBoardTab(boardId: string)`:
    - Adds `boardId` to `openBoardIds` if not already present.
    - Sets `activeBoardId` to `boardId`.
    - Persists to `db.settings.update('default', { openBoardIds, activeBoardId })`.
  - `closeBoardTab(boardId: string)`:
    - Removes `boardId` from `openBoardIds`.
    - If the closed tab was the active board:
      - Automatically switches `activeBoardId` to the nearest remaining open tab (or the first open tab).
    - If the user closes the last remaining tab:
      - Does not crash; either leaves canvas in empty state or opens the first available board from `boards`.
    - Note: Closing a tab **does NOT delete** or archive the board in Dexie.
  - `createBoardAndTab(title: string)`:
    - Creates a new board in Dexie, adds default columns (`Inspirasi`, `Sedang Dikerjakan`, `Selesai`), adds the new board to `openBoardIds`, and activates it.

---

## 4. Bohemian Command Palette Specification

### 4.1 Global Hotkey & Triggers
- **Keyboard Shortcuts:** `Ctrl+K` and `Ctrl+P` (Windows/Linux) / `Cmd+K` and `Cmd+P` (macOS).
- **Escape Key:** Immediately dismisses the palette and resets the query.
- **UI Trigger:** A search pill button in `WindowHeader` (`[ 🔍 Cari / Lompat... ⌘K ]`).

### 4.2 Modal UI & Components (`src/renderer/src/components/modal/CommandPalette.tsx`)
- **Backdrop:** Translucent dark warm overlay (`bg-boho-espresso/40 backdrop-blur-sm fixed inset-0 z-50 flex justify-center pt-20`).
- **Dialog Box:**
  - Rounded floating container (`w-full max-w-xl bg-white border border-boho-canvas shadow-2xl rounded-2xl overflow-hidden animate-fadeIn`).
  - Search Input: Top bar with magnifying glass icon, auto-focused text input (`placeholder="Ketik nama board, kartu tugas, atau aksi cepat..."`), and a badge showing `ESC`.
- **Results Container:**
  - Max height with custom scrollbar (`max-h-96 overflow-y-auto p-2`).
  - Categorized with subheaders:
    1. 📋 **Boards** (`boards.filter(...)`)
    2. 📝 **Kartu / Tugas** (`cards.filter(...)`)
    3. ⚡ **Aksi Cepat** (Action Commands)

### 4.3 Search Scoring & Categories
1. **Boards:**
   - Matches `board.title` and `board.description`.
   - Action on select: `openBoardTab(board.id)`, closes palette.
2. **Cards:**
   - Matches `card.title`, `card.description`, or `card.tags`.
   - Displays parent board name badge.
   - Action on select: opens parent board, opens `CardDetailModal` for this card, closes palette.
3. **Quick Actions:**
   - `Buat Board Baru` (icon: `Plus`): Triggers board creation modal/prompt.
   - `Buat Kartu Baru` (icon: `CheckSquare`): Triggers card creation in first column of active board.
   - `Ekspor Cadangan Board (JSON)` (icon: `Download`): Calls native save backup dialog.
   - `Impor Cadangan Board (JSON)` (icon: `Upload`): Calls native open backup dialog.
   - `Buka Profil & Asisten` (icon: `Settings`): Opens `ProfileModal`.

### 4.4 Keyboard Navigation
- Arrow Down (`↓`): Moves active highlighted index down (wraps to 0).
- Arrow Up (`↑`): Moves active highlighted index up (wraps to end).
- Enter (`↵`): Executes the highlighted item.
- Esc: Closes palette.

---

## 5. Dexie Data Models & Schema Compatibility

### 5.1 Settings Table (`src/shared/types.ts` & `src/renderer/src/db/db.ts`)
Update `UserSettings` interface:
```ts
export interface UserSettings {
  id: string;
  activeBoardId?: string;
  openBoardIds?: string[]; // Array of open board IDs for tabs
  profile?: UserProfile;
  assistant?: AssistantConfig;
}
```

### 5.2 Safe Fallback
When reading `settings` in `refreshData()`:
```ts
const openIds = (settings?.openBoardIds || [])
  .filter((id) => allBoards.some((b) => b.id === id));

if (openIds.length === 0 && allBoards.length > 0) {
  openIds.push(activeBoardId || allBoards[0].id);
}
setOpenBoardIds(openIds);
```

---

## 6. Error Handling & Edge Cases
1. **Closing Active Board:**
   - Finding the closed tab's index in `openBoardIds`. If closed index is `i`, switch to `openBoardIds[i - 1]` or `openBoardIds[i + 1]`.
2. **Board Deletion from Sidebar:**
   - If a board is deleted, filter it out from `openBoardIds`.
3. **Stale Cards in Command Palette:**
   - Command palette queries live Dexie cards or current context cards, ensuring cards from deleted boards are omitted.
4. **Keyboard Conflict:**
   - Prevent hotkey triggers when user is actively editing inside an `input` or `textarea` unless `Ctrl` or `Cmd` is pressed.
5. **Frameless Dragging on Windows:**
   - Double-click on header triggers maximize/restore.

---

## 7. Testing & Verification Strategy

### 7.1 Unit Tests
- `tests/windowHeader.test.tsx`:
  - Validates `.app-drag` on `<header>` and `.app-no-drag` on tabs and buttons.
  - Verifies minimize, maximize, and close calls to `electronAPI`.
- `tests/tabs.context.test.ts`:
  - Verifies `openBoardTab`, `closeBoardTab`, active tab reassignment upon closing, and Dexie persistence.
- `tests/commandPalette.test.tsx`:
  - Verifies hotkey triggers (`Ctrl+K`, `Ctrl+P`, `Cmd+K`, `Cmd+P`).
  - Verifies filtering across boards, cards, and quick actions.
  - Verifies keyboard navigation (`ArrowDown`, `Enter`, `Escape`).

### 7.2 End-to-End Tests (`tests/e2e.features.test.tsx`)
- **Journey 9:** Tab creation, tab switching, and closing tabs with persistence verification.
- **Journey 10:** Opening Command Palette via keyboard, typing query, selecting board, and selecting quick action.

### 7.3 Production Build
- Run `npm test` (all suites passing).
- Run `npm run build` (clean exit 0).
