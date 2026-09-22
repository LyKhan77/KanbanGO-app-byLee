# Design Specification: Calendar View, Draggable Board Tabs, and Bohemian Card Covers with Markdown Preview

## 1. Executive Summary

This document specifies the architecture, UI design, and implementation details for three interrelated feature enhancements in **KanbanGO!**:
1. **Interactive Calendar View**: A monthly calendar scheduling interface with drag-and-drop date assignment, an unscheduled tasks drawer, and quick task creation.
2. **Draggable Board Tabs**: Horizontal drag-and-drop reordering for open board tabs in the custom window titlebar, persisting tab order in IndexedDB (Dexie).
3. **Bohemian Card Covers & Markdown Preview**: Earthy top-bar accent colors on cards, accompanied by an interactive Markdown preview toggle for task descriptions in the card detail modal.

---

## 2. Goals and Non-Goals

### Goals
- **Calendar View:**
  - Provide a clean, aesthetic monthly calendar grid within the board workspace.
  - Allow users to toggle seamlessly between **Kanban Board** view and **Calendar** view via a segmented control in the board header.
  - Enable dragging cards between calendar date cells to instantly update `dueDate`.
  - Provide an expandable "Unscheduled Tasks" panel containing cards without a due date, which can be dragged into calendar date cells.
  - Allow clicking empty date cells to quickly create a card scheduled for that day.
  - Support switching between "Current Board Only" and "All Open Boards".
- **Draggable Board Tabs:**
  - Enable smooth horizontal drag-and-drop reordering of open tabs in the titlebar.
  - Retain native desktop window dragging capability on all empty header areas.
  - Persist the reordered tab sequence to `db.settings` (`openBoardIds`).
- **Card Covers & Markdown Preview:**
  - Add 6 earthy Bohemian accent colors (+ None) as a 6px top accent bar with soft background tinting.
  - Add a color picker in `CardDetailModal`.
  - Add `[Tulis / Edit]` and `[Pratinjau / Preview]` segmented tabs in the description area with safe Markdown parsing (headers, bold, italic, bullet lists, task checkboxes, code blocks, quotes).

### Non-Goals
- Two-way synchronization with external calendar providers (Google Calendar, Apple Calendar, Outlook) — reserved for future sync plugins.
- Multi-day spanning event bars across consecutive date cells (cards represent due dates / milestones).
- Full rich-text WYSIWYG editor with image upload — the app focuses on clean, fast, lightweight Markdown.

---

## 3. Data Model & Architecture

### 3.1 Type Definitions (`src/shared/types.ts`)

```typescript
export type CardCoverColor = 
  | 'none' 
  | 'terracotta' 
  | 'sage' 
  | 'ochre' 
  | 'rose' 
  | 'walnut' 
  | 'slate';

export type BoardViewMode = 'kanban' | 'calendar';

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // Format: YYYY-MM-DD
  tags?: string[];
  coverColor?: CardCoverColor;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  activeBoardId?: string;
  openBoardIds?: string[];
  activeViewMode?: BoardViewMode;
  profile?: UserProfile;
  assistant?: AssistantConfig;
}
```

### 3.2 Color Theme Mapping (`src/renderer/src/utils/colors.ts`)

Bohemian palette mappings for card covers:
- `terracotta`: Accent `#c86d51`, bg-tint `rgba(200, 109, 81, 0.04)`, border `#ebd9c8`
- `sage`: Accent `#8a9a5b`, bg-tint `rgba(138, 154, 91, 0.04)`, border `#dbe2d4`
- `ochre`: Accent `#e0a96d`, bg-tint `rgba(224, 169, 109, 0.04)`, border `#f2e3ce`
- `rose`: Accent `#b37d80`, bg-tint `rgba(179, 125, 128, 0.04)`, border `#e8d6d7`
- `walnut`: Accent `#5a4d41`, bg-tint `rgba(90, 77, 65, 0.04)`, border `#dfd8d1`
- `slate`: Accent `#5b8296`, bg-tint `rgba(91, 130, 150, 0.04)`, border `#d3dde2`
- `none`: Default card styling (clean white with `#e8dec8` border)

---

## 4. Component Architecture & Interactions

### 4.1 Draggable Tabs (`src/renderer/src/components/layout/WindowHeader.tsx`)
1. **HTML5 Drag-and-Drop Implementation:**
   - Each tab element (`role="tab"`) is set to `draggable={true}` and contains `.app-no-drag`.
   - Drag event handlers:
     - `onDragStart(e, index)`: Sets `dataTransfer.setData('text/plain', index.toString())`, `dataTransfer.effectAllowed = 'move'`, sets local dragging state.
     - `onDragOver(e, index)`: Calls `e.preventDefault()` to allow dropping; updates drop target indicator.
     - `onDragLeave(e)`: Clears drop target indicator.
     - `onDrop(e, targetIndex)`: Reads source index, calls `reorderBoardTabs(sourceIndex, targetIndex)`.
     - `onDragEnd(e)`: Resets drag state.
2. **Visual Affordance:**
   - Dragging tab: `opacity-50 scale-95`.
   - Target tab: Left indicator `border-l-2 border-terracotta`.
3. **Window Dragging Integrity:**
   - The tablist container (`role="tablist"`) does **not** carry `app-no-drag`. Empty space around and between tabs allows native window dragging.

### 4.2 Card Covers & Markdown Preview
1. **`CardItem.tsx`:**
   - When `card.coverColor` is present and not `'none'`, renders a top bar `<div className="h-1.5 w-full rounded-t-lg" style={{ backgroundColor: color.accent }} />`.
   - Card wrapper incorporates the matching subtle background tint and border.
2. **`CardDetailModal.tsx`:**
   - **Cover Color Picker:** Circular color chips with checkmark on active selection.
   - **Markdown Tabs:**
     - Segments: `[Tulis / Edit]` and `[Pratinjau / Preview]`.
     - Parser: Safe zero-dependency renderer converting:
       - `# Heading` -> `<h3>`
       - `**bold**` -> `<strong>`
       - `*italic*` -> `<em>`
       - `~~strike~~` -> `<del>`
       - `- [ ] task` / `- [x] done` -> styled checkbox lists
       - `- item` -> bullet list
       - `` `code` `` -> inline code snippet
       - `> quote` -> blockquote

### 4.3 Calendar View (`src/renderer/src/components/calendar/CalendarView.tsx`)
1. **Month Grid Layout:**
   - Calculated for current `year` and `month` (e.g. 35 to 42 day cells including leading/trailing padding days from previous/next months).
   - Day cells render date number, today indicator, list of scheduled card pills.
2. **Calendar Interactivity:**
   - **Drop Target Date Cells:** Each day cell has `onDragOver` and `onDrop`. Dropping any card onto a cell calls `updateCardDueDate(card.id, cellDateString)`.
   - **Draggable Card Pills:** Mini-cards inside calendar cells have `draggable={true}` with source date information.
   - **Quick Add:** Clicking empty space inside a cell triggers an inline quick-add popover or creates a card in the first column with `dueDate` prefilled.
   - **Card Detail Trigger:** Clicking a card pill calls `onCardClick(card)`.
3. **Unscheduled Tasks Drawer:**
   - Toggle button with count badge (e.g. `Belum Terjadwal (5)`).
   - Side drawer lists cards with `!dueDate`.
   - Each card in the drawer has `draggable={true}` allowing direct drag into any calendar cell.
4. **Board Scope Toggle:**
   - Toggle pill: `[ Papan Aktif ]` vs `[ Semua Papan ]`.

### 4.4 View Switcher (`src/renderer/src/components/board/BoardCanvas.tsx`)
- Board toolbar header renders:
  ```tsx
  <div className="flex items-center bg-boho-canvas/60 p-0.5 rounded-lg border border-boho-canvas">
    <button 
      onClick={() => setViewMode('kanban')}
      className={clsx("px-2.5 py-1 text-xs font-medium rounded-md transition-all", 
        viewMode === 'kanban' ? "bg-white text-boho-espresso shadow-xs" : "text-boho-walnut hover:text-boho-espresso")}
    >
      📋 Kanban
    </button>
    <button 
      onClick={() => setViewMode('calendar')}
      className={clsx("px-2.5 py-1 text-xs font-medium rounded-md transition-all", 
        viewMode === 'calendar' ? "bg-white text-boho-espresso shadow-xs" : "text-boho-walnut hover:text-boho-espresso")}
    >
      📅 Kalender
    </button>
  </div>
  ```
- Conditionally renders column board canvas or `CalendarView`.

---

## 5. State Management & Database Operations

In `KanbanContext.tsx`:
1. `viewMode`: Initialized from `settings?.activeViewMode || 'kanban'`.
2. `setViewMode(mode)`: Updates state and persists to `db.settings.update('default', { activeViewMode: mode })`.
3. `reorderBoardTabs(sourceIndex, destIndex)`:
   - Reorders `openBoardIds` array:
     ```typescript
     const updated = [...openBoardIds];
     const [removed] = updated.splice(sourceIndex, 1);
     updated.splice(destIndex, 0, removed);
     setOpenBoardIds(updated);
     await db.settings.update('default', { openBoardIds: updated });
     ```
4. `updateCardDueDate(cardId, dueDate)`:
   - Updates `cards` state and calls `db.cards.update(cardId, { dueDate, updatedAt: new Date().toISOString() })`.
5. `updateCardCoverColor(cardId, coverColor)`:
   - Updates `cards` state and calls `db.cards.update(cardId, { coverColor, updatedAt: new Date().toISOString() })`.

---

## 6. Testing & Quality Assurance Plan

1. **Unit Tests:**
   - `tests/tabs.dnd.test.tsx`: Verify tab drag start, drag over, and drop triggers `reorderBoardTabs` with correct indices.
   - `tests/cardCovers.test.tsx`: Verify rendering of cover accent bars and palette styles on `CardItem` and selection chips on `CardDetailModal`.
   - `tests/markdown.test.ts`: Verify markdown parsing utility correctly renders markdown tokens without XSS vulnerabilities.
   - `tests/calendar.test.tsx`:
     - Test month grid calculation (correct start day, number of days, padding days).
     - Test card filtering by `dueDate` and board scope.
     - Test dropping card onto date cell updates card due date.
     - Test unscheduled tasks drawer renders cards without due date.
2. **Regression Verification:**
   - Ensure all 18 existing test suites (103/103 tests) continue passing.
   - Verify window titlebar dragging remains unaffected on Windows.
3. **Production Build:**
   - Execute `npm run build` and ensure zero TypeScript errors or asset bundle regressions.
