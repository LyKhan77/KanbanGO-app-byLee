# Calendar View, Draggable Board Tabs, and Bohemian Card Covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an interactive monthly Calendar View with drag-and-drop task scheduling, horizontal draggable board tabs with Dexie persistence, and Bohemian card cover accents with Markdown preview in KanbanGO!.

**Architecture:** Extend `shared/types.ts` and `KanbanContext.tsx` with view mode state (`kanban` vs `calendar`), tab reordering, and card cover/due date updates. Build a pure HTML5 drag-and-drop tab system in `WindowHeader.tsx` without compromising native OS window dragging. Implement card cover styling in `CardItem.tsx` and a tabbed markdown editor/preview in `CardDetailModal.tsx`. Create `CalendarView.tsx` with monthly grid calculations, drag-and-drop date assignment, an unscheduled task drawer, and quick task creation. Wire everything cleanly into `BoardCanvas.tsx` and `CommandPalette.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Dexie (IndexedDB), Vitest, React Testing Library, Electron.

---

### File Structure & Responsibilities

| File | Status | Responsibility |
|---|---|---|
| `src/shared/types.ts` | Modify | Declare `CardCoverColor`, `BoardViewMode`, `Card.coverColor`, `UserSettings.activeViewMode`. |
| `src/renderer/src/utils/colors.ts` | Create | Define Bohemian color palette mappings (accent, tint, border) for card covers. |
| `src/renderer/src/utils/markdown.ts` | Create | Lightweight, secure markdown parser for headings, bold, italic, strikethrough, lists, tasks, code. |
| `src/renderer/src/utils/calendar.ts` | Create | Date utilities for month grid computation, day cells, month name formatting in Indonesian. |
| `src/renderer/src/context/KanbanContext.tsx` | Modify | Manage `viewMode`, `reorderBoardTabs`, `updateCardDueDate`, `updateCardCoverColor`, and Dexie persistence. |
| `src/renderer/src/components/layout/WindowHeader.tsx` | Modify | HTML5 drag-and-drop reordering of open board tabs with drop indicator and window drag isolation. |
| `src/renderer/src/components/board/CardItem.tsx` | Modify | Render 6px top accent cover bar and subtle background tint on kanban cards. |
| `src/renderer/src/components/modal/CardDetailModal.tsx` | Modify | Color picker chips for `coverColor` and segmented `[Tulis]` / `[Pratinjau]` Markdown description tabs. |
| `src/renderer/src/components/calendar/CalendarView.tsx` | Create | Monthly calendar grid, date cell drop zones, mini-card draggable pills, unscheduled drawer, quick add. |
| `src/renderer/src/components/board/BoardCanvas.tsx` | Modify | Segmented view switcher (`📋 Kanban` / `📅 Kalender`) in board toolbar. |
| `src/renderer/src/components/modal/CommandPalette.tsx` | Modify | Quick actions for switching to Calendar and Kanban views. |
| `tests/utils.colors-markdown.test.ts` | Create | Unit tests for color palettes and markdown renderer. |
| `tests/context.expansion.test.ts` | Create | Unit tests for `viewMode`, `reorderBoardTabs`, `updateCardDueDate`, and `updateCardCoverColor`. |
| `tests/tabs.dnd.test.tsx` | Create | Unit tests for tab drag start, drag over, and drop reordering in WindowHeader. |
| `tests/cardCovers.modal.test.tsx` | Create | Unit tests for card cover styles and markdown preview toggle in modal. |
| `tests/calendarView.test.tsx` | Create | Unit tests for calendar grid rendering, date navigation, card scheduling, and unscheduled drawer. |
| `tests/e2e.features.test.tsx` | Modify | End-to-end integration test verifying view switching and new workflows. |

---

### Task 1: Shared Types & Color/Markdown Utilities

**Files:**
- Modify: `src/shared/types.ts`
- Create: `src/renderer/src/utils/colors.ts`
- Create: `src/renderer/src/utils/markdown.ts`
- Create: `tests/utils.colors-markdown.test.ts`

- [ ] **Step 1: Write the failing unit tests for color palette and markdown utilities**

Create `tests/utils.colors-markdown.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { getCardCoverStyle, CARD_COVER_COLORS } from '../src/renderer/src/utils/colors';
import { renderMarkdownToHtml } from '../src/renderer/src/utils/markdown';

describe('Color Palette Utilities', () => {
  it('returns valid cover styles for all predefined bohemian colors', () => {
    expect(CARD_COVER_COLORS.length).toBe(7);
    const terracotta = getCardCoverStyle('terracotta');
    expect(terracotta.accent).toBe('#c86d51');
    expect(terracotta.bgTint).toContain('rgba(200, 109, 81');

    const none = getCardCoverStyle('none');
    expect(none.accent).toBe('transparent');
  });

  it('falls back to none style for undefined or unknown color', () => {
    const fallback = getCardCoverStyle(undefined);
    expect(fallback.accent).toBe('transparent');
  });
});

describe('Markdown Parser Utility', () => {
  it('correctly parses bold, italic, and strikethrough text', () => {
    const input = 'Ini **tebal** dan *miring* serta ~~coret~~.';
    const output = renderMarkdownToHtml(input);
    expect(output).toContain('<strong>tebal</strong>');
    expect(output).toContain('<em>miring</em>');
    expect(output).toContain('<del>coret</del>');
  });

  it('correctly parses task list checkboxes', () => {
    const input = '- [ ] Task pending\n- [x] Task selesai';
    const output = renderMarkdownToHtml(input);
    expect(output).toContain('type="checkbox"');
    expect(output).toContain('checked');
    expect(output).toContain('Task selesai');
  });

  it('correctly parses bullet points and code blocks', () => {
    const input = '- Poin satu\n- Poin dua\n`const x = 10;`';
    const output = renderMarkdownToHtml(input);
    expect(output).toContain('<li>Poin satu</li>');
    expect(output).toContain('<code>const x = 10;</code>');
  });

  it('escapes raw HTML to prevent XSS injection', () => {
    const malicious = '<script>alert("hack")</script>';
    const output = renderMarkdownToHtml(malicious);
    expect(output).not.toContain('<script>');
    expect(output).toContain('&lt;script&gt;');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/utils.colors-markdown.test.ts`
Expected: FAIL (modules not found)

- [ ] **Step 3: Update `src/shared/types.ts`**

Update `src/shared/types.ts`:
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

- [ ] **Step 4: Implement `src/renderer/src/utils/colors.ts`**

Create `src/renderer/src/utils/colors.ts`:
```typescript
import { CardCoverColor } from '../../../shared/types';

export interface CardCoverStyle {
  key: CardCoverColor;
  label: string;
  accent: string;
  bgTint: string;
  border: string;
}

export const CARD_COVER_COLORS: CardCoverStyle[] = [
  { key: 'none', label: 'Polos', accent: 'transparent', bgTint: 'transparent', border: 'border-boho-canvas' },
  { key: 'terracotta', label: 'Terracotta', accent: '#c86d51', bgTint: 'rgba(200, 109, 81, 0.05)', border: '#ebd9c8' },
  { key: 'sage', label: 'Sage', accent: '#8a9a5b', bgTint: 'rgba(138, 154, 91, 0.05)', border: '#dbe2d4' },
  { key: 'ochre', label: 'Ochre', accent: '#e0a96d', bgTint: 'rgba(224, 169, 109, 0.05)', border: '#f2e3ce' },
  { key: 'rose', label: 'Dusty Rose', accent: '#b37d80', bgTint: 'rgba(179, 125, 128, 0.05)', border: '#e8d6d7' },
  { key: 'walnut', label: 'Walnut', accent: '#5a4d41', bgTint: 'rgba(90, 77, 65, 0.05)', border: '#dfd8d1' },
  { key: 'slate', label: 'Slate', accent: '#5b8296', bgTint: 'rgba(91, 130, 150, 0.05)', border: '#d3dde2' }
];

export function getCardCoverStyle(color?: CardCoverColor): CardCoverStyle {
  const found = CARD_COVER_COLORS.find((c) => c.key === color);
  return found || CARD_COVER_COLORS[0];
}
```

- [ ] **Step 5: Implement `src/renderer/src/utils/markdown.ts`**

Create `src/renderer/src/utils/markdown.ts`:
```typescript
export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // 1. Escape HTML special characters
  let escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Headings (# Heading)
  escaped = escaped.replace(/^### (.*$)/gim, '<h4 class="font-serif font-semibold text-boho-espresso mt-3 mb-1 text-sm">$1</h4>');
  escaped = escaped.replace(/^## (.*$)/gim, '<h3 class="font-serif font-bold text-boho-espresso mt-3 mb-1 text-base">$1</h3>');
  escaped = escaped.replace(/^# (.*$)/gim, '<h2 class="font-serif font-bold text-boho-espresso mt-4 mb-2 text-lg">$1</h2>');

  // 3. Inline code (`code`)
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-boho-canvas text-xs font-mono text-terracotta border border-boho-canvas/80">$1</code>');

  // 4. Bold, Italic, Strikethrough
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/~~(.*?)~~/g, '<del class="opacity-60">$1</del>');

  // 5. Checklist items (- [ ] and - [x])
  escaped = escaped.replace(
    /^\s*-\s*\[x\]\s+(.*$)/gim,
    '<div class="flex items-center gap-2 my-1 text-xs text-boho-walnut line-through opacity-70"><input type="checkbox" checked disabled class="rounded border-terracotta text-terracotta pointer-events-none" /><span>$1</span></div>'
  );
  escaped = escaped.replace(
    /^\s*-\s*\[ \]\s+(.*$)/gim,
    '<div class="flex items-center gap-2 my-1 text-xs text-boho-walnut"><input type="checkbox" disabled class="rounded border-boho-clay pointer-events-none" /><span>$1</span></div>'
  );

  // 6. Regular bullet points (- item)
  escaped = escaped.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-boho-walnut my-0.5">$1</li>');

  // 7. Line breaks
  escaped = escaped.replace(/\n/g, '<br />');

  return escaped;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/utils.colors-markdown.test.ts`
Expected: PASS (4 tests passed)

- [ ] **Step 7: Commit**

```bash
git add src/shared/types.ts src/renderer/src/utils/colors.ts src/renderer/src/utils/markdown.ts tests/utils.colors-markdown.test.ts
git commit -m "feat(utils): add card cover palettes, markdown parser, and type definitions"
```

---

### Task 2: KanbanContext State & Actions (ViewMode, Tabs Reorder, Card Updates)

**Files:**
- Modify: `src/renderer/src/context/KanbanContext.tsx`
- Create: `tests/context.expansion.test.ts`

- [ ] **Step 1: Write unit tests for context expansion**

Create `tests/context.expansion.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../src/renderer/src/db/db';
import { seedInitialData } from '../src/renderer/src/db/seed';

describe('KanbanContext Expansion Logic', () => {
  beforeEach(async () => {
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.settings.clear();
    await seedInitialData(db);
  });

  it('correctly reorders openBoardIds array', () => {
    const originalTabs = ['b1', 'b2', 'b3', 'b4'];
    const sourceIndex = 0;
    const destIndex = 2;

    const updated = [...originalTabs];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(destIndex, 0, moved);

    expect(updated).toEqual(['b2', 'b3', 'b1', 'b4']);
  });

  it('updates card dueDate in dexie database', async () => {
    const cards = await db.cards.toArray();
    const firstCard = cards[0];

    await db.cards.update(firstCard.id, { dueDate: '2026-10-15' });
    const updated = await db.cards.get(firstCard.id);
    expect(updated?.dueDate).toBe('2026-10-15');
  });

  it('updates card coverColor in dexie database', async () => {
    const cards = await db.cards.toArray();
    const firstCard = cards[0];

    await db.cards.update(firstCard.id, { coverColor: 'terracotta' });
    const updated = await db.cards.get(firstCard.id);
    expect(updated?.coverColor).toBe('terracotta');
  });

  it('persists activeViewMode to settings in dexie database', async () => {
    await db.settings.update('default', { activeViewMode: 'calendar' });
    const settings = await db.settings.get('default');
    expect(settings?.activeViewMode).toBe('calendar');
  });
});
```

- [ ] **Step 2: Run test to verify it passes baseline**

Run: `npx vitest run tests/context.expansion.test.ts`
Expected: PASS

- [ ] **Step 3: Update `src/renderer/src/context/KanbanContext.tsx`**

In `src/renderer/src/context/KanbanContext.tsx`:
1. Extend `KanbanContextType`:
```typescript
  viewMode: BoardViewMode;
  setViewMode: (mode: BoardViewMode) => Promise<void>;
  reorderBoardTabs: (sourceIndex: number, destIndex: number) => Promise<void>;
  updateCardDueDate: (cardId: string, dueDate?: string) => Promise<void>;
  updateCardCoverColor: (cardId: string, coverColor: CardCoverColor) => Promise<void>;
```
2. In `KanbanProvider`:
```typescript
  const [viewMode, setViewModeState] = useState<BoardViewMode>('kanban');

  // In refreshData:
  const loadedViewMode = settings?.activeViewMode || 'kanban';
  setViewModeState(loadedViewMode);

  const setViewMode = async (mode: BoardViewMode) => {
    setViewModeState(mode);
    const existing = await db.settings.get('default');
    if (existing) {
      await db.settings.update('default', { activeViewMode: mode });
    }
  };

  const reorderBoardTabs = async (sourceIndex: number, destIndex: number) => {
    if (sourceIndex === destIndex || sourceIndex < 0 || destIndex < 0) return;
    if (sourceIndex >= openBoardIds.length || destIndex >= openBoardIds.length) return;

    const updated = [...openBoardIds];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(destIndex, 0, moved);

    setOpenBoardIds(updated);
    const existing = await db.settings.get('default');
    if (existing) {
      await db.settings.update('default', { openBoardIds: updated });
    }
  };

  const updateCardDueDate = async (cardId: string, dueDate?: string) => {
    const updatedAt = new Date().toISOString();
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, dueDate, updatedAt } : c))
    );
    await db.cards.update(cardId, { dueDate, updatedAt });
  };

  const updateCardCoverColor = async (cardId: string, coverColor: CardCoverColor) => {
    const updatedAt = new Date().toISOString();
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, coverColor, updatedAt } : c))
    );
    await db.cards.update(cardId, { coverColor, updatedAt });
  };
```
3. Expose `viewMode`, `setViewMode`, `reorderBoardTabs`, `updateCardDueDate`, `updateCardCoverColor` in `KanbanContext.Provider value`.

- [ ] **Step 4: Run full test suite to ensure no regressions**

Run: `npm test`
Expected: PASS (19 test files passed)

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/context/KanbanContext.tsx tests/context.expansion.test.ts
git commit -m "feat(context): add viewMode, reorderBoardTabs, updateCardDueDate, and updateCardCoverColor"
```

---

### Task 3: Draggable Board Tabs in WindowHeader

**Files:**
- Modify: `src/renderer/src/components/layout/WindowHeader.tsx`
- Create: `tests/tabs.dnd.test.tsx`

- [ ] **Step 1: Write unit tests for tab drag and drop**

Create `tests/tabs.dnd.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowHeader } from '../src/renderer/src/components/layout/WindowHeader';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('Draggable Board Tabs in WindowHeader', () => {
  const mockReorderBoardTabs = vi.fn();
  const mockOpenTab = vi.fn();

  const mockContextValue = {
    boards: [
      { id: 'b1', title: 'Board Satu' },
      { id: 'b2', title: 'Board Dua' },
      { id: 'b3', title: 'Board Tiga' }
    ],
    activeBoardId: 'b1',
    activeBoard: { id: 'b1', title: 'Board Satu' },
    openBoardIds: ['b1', 'b2', 'b3'],
    openBoardTab: mockOpenTab,
    closeBoardTab: vi.fn(),
    createBoard: vi.fn(),
    reorderBoardTabs: mockReorderBoardTabs
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tabs with draggable attribute set to true', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(3);
    tabs.forEach((tab) => {
      expect(tab.getAttribute('draggable')).toBe('true');
    });
  });

  it('triggers reorderBoardTabs on drag and drop between tabs', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    const sourceTab = tabs[0];
    const targetTab = tabs[2];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue('0'),
      effectAllowed: 'move'
    };

    fireEvent.dragStart(sourceTab, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '0');

    fireEvent.dragOver(targetTab, { dataTransfer });
    fireEvent.drop(targetTab, { dataTransfer });

    expect(mockReorderBoardTabs).toHaveBeenCalledWith(0, 2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/tabs.dnd.test.tsx`
Expected: FAIL (tabs do not have draggable="true")

- [ ] **Step 3: Implement HTML5 DnD in `src/renderer/src/components/layout/WindowHeader.tsx`**

In `WindowHeader.tsx`:
Add state for dragged tab index and drop target indicator:
```typescript
const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);
const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
```
On each tab item:
```tsx
draggable={true}
onDragStart={(e) => {
  setDraggedTabIndex(index);
  e.dataTransfer.setData('text/plain', index.toString());
  e.dataTransfer.effectAllowed = 'move';
}}
onDragOver={(e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (dropTargetIndex !== index) {
    setDropTargetIndex(index);
  }
}}
onDragLeave={() => {
  if (dropTargetIndex === index) {
    setDropTargetIndex(null);
  }
}}
onDrop={(e) => {
  e.preventDefault();
  const sourceIndexStr = e.dataTransfer.getData('text/plain');
  const sourceIdx = sourceIndexStr ? parseInt(sourceIndexStr, 10) : draggedTabIndex;
  if (sourceIdx !== null && !isNaN(sourceIdx) && sourceIdx !== index) {
    reorderBoardTabs(sourceIdx, index);
  }
  setDraggedTabIndex(null);
  setDropTargetIndex(null);
}}
onDragEnd={() => {
  setDraggedTabIndex(null);
  setDropTargetIndex(null);
}}
className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer shrink-0 max-w-[160px] border focus:outline-none focus:ring-1 focus:ring-terracotta/50 app-no-drag ${
  isActive
    ? 'bg-white text-boho-espresso font-semibold border-terracotta/40 shadow-xs'
    : 'bg-transparent text-boho-walnut hover:bg-boho-canvas/50 border-transparent'
} ${draggedTabIndex === index ? 'opacity-40 scale-95' : ''} ${
  dropTargetIndex === index && draggedTabIndex !== index ? 'border-l-2 border-l-terracotta' : ''
}`}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/tabs.dnd.test.tsx tests/windowHeader.test.tsx tests/windowHeader.tabs.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/components/layout/WindowHeader.tsx tests/tabs.dnd.test.tsx
git commit -m "feat(header): implement horizontal drag-and-drop reordering for board tabs"
```

---

### Task 4: Bohemian Card Covers & Markdown Preview in Card Components

**Files:**
- Modify: `src/renderer/src/components/board/CardItem.tsx`
- Modify: `src/renderer/src/components/modal/CardDetailModal.tsx`
- Create: `tests/cardCovers.modal.test.tsx`

- [ ] **Step 1: Write unit tests for card covers and markdown preview**

Create `tests/cardCovers.modal.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardItem } from '../src/renderer/src/components/board/CardItem';
import { CardDetailModal } from '../src/renderer/src/components/modal/CardDetailModal';
import { Card } from '../src/shared/types';

describe('CardItem with Bohemian Cover', () => {
  const mockCard: Card = {
    id: 'c1',
    boardId: 'b1',
    columnId: 'col1',
    title: 'Desain Palet Warna',
    description: 'Deskripsi task',
    order: 0,
    coverColor: 'terracotta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it('renders top color accent bar when coverColor is set', () => {
    const { container } = render(
      <CardItem card={mockCard} index={0} onClick={vi.fn()} />
    );

    const accentBar = container.querySelector('[data-testid="card-cover-bar"]');
    expect(accentBar).toBeDefined();
    expect(accentBar?.getAttribute('style')).toContain('background-color: rgb(200, 109, 81)');
  });
});

describe('CardDetailModal with Cover Picker and Markdown Preview', () => {
  const mockCard: Card = {
    id: 'c1',
    boardId: 'b1',
    columnId: 'col1',
    title: 'Desain Palet Warna',
    description: 'Deskripsi **tebal** dan *miring*',
    order: 0,
    coverColor: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockUpdateCard = vi.fn();

  it('renders color picker chips and updates cover color on click', () => {
    render(
      <CardDetailModal
        card={mockCard}
        isOpen={true}
        checklists={[]}
        onClose={vi.fn()}
        onUpdateCard={mockUpdateCard}
        onDeleteCard={vi.fn()}
        onCreateChecklist={vi.fn()}
        onToggleChecklist={vi.fn()}
        onDeleteChecklist={vi.fn()}
      />
    );

    const terracottaChip = screen.getByTitle(/Terracotta/i);
    fireEvent.click(terracottaChip);
    expect(mockUpdateCard).toHaveBeenCalledWith('c1', expect.objectContaining({ coverColor: 'terracotta' }));
  });

  it('toggles markdown preview tab and renders formatted HTML', () => {
    render(
      <CardDetailModal
        card={mockCard}
        isOpen={true}
        checklists={[]}
        onClose={vi.fn()}
        onUpdateCard={mockUpdateCard}
        onDeleteCard={vi.fn()}
        onCreateChecklist={vi.fn()}
        onToggleChecklist={vi.fn()}
        onDeleteChecklist={vi.fn()}
      />
    );

    const previewTab = screen.getByRole('button', { name: /Pratinjau/i });
    fireEvent.click(previewTab);

    expect(screen.getByText('tebal').tagName).toBe('STRONG');
    expect(screen.getByText('miring').tagName).toBe('EM');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/cardCovers.modal.test.tsx`
Expected: FAIL

- [ ] **Step 3: Update `src/renderer/src/components/board/CardItem.tsx`**

In `CardItem.tsx`:
1. Import `getCardCoverStyle` from `../../utils/colors`.
2. Retrieve style: `const coverStyle = getCardCoverStyle(card.coverColor);`
3. At the top of the card inner div, render the cover bar if `card.coverColor && card.coverColor !== 'none'`:
```tsx
{card.coverColor && card.coverColor !== 'none' && (
  <div
    data-testid="card-cover-bar"
    className="h-1.5 w-full rounded-t-lg -mt-3.5 -mx-3.5 mb-2.5"
    style={{ backgroundColor: coverStyle.accent, width: 'calc(100% + 28px)' }}
  />
)}
```
4. Add background tint style if cover is active:
```tsx
style={{
  ...provided.draggableProps.style,
  backgroundColor: card.coverColor && card.coverColor !== 'none' ? coverStyle.bgTint : undefined
}}
```

- [ ] **Step 4: Update `src/renderer/src/components/modal/CardDetailModal.tsx`**

In `CardDetailModal.tsx`:
1. Import `CARD_COVER_COLORS` from `../../utils/colors` and `renderMarkdownToHtml` from `../../utils/markdown`.
2. Add tab state for description:
```tsx
const [descriptionTab, setDescriptionTab] = useState<'write' | 'preview'>('write');
```
3. Above the modal title, render horizontal color picker chips:
```tsx
<div className="flex items-center gap-2 mb-3">
  <span className="text-xs text-boho-clay font-medium">Aksen Kartu:</span>
  <div className="flex items-center gap-1.5">
    {CARD_COVER_COLORS.map((c) => (
      <button
        key={c.key}
        type="button"
        title={c.label}
        onClick={() => onUpdateCard(card.id, { coverColor: c.key })}
        className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
          (card.coverColor || 'none') === c.key
            ? 'ring-2 ring-offset-1 ring-terracotta scale-110'
            : 'hover:scale-105 opacity-80 hover:opacity-100'
        }`}
        style={{
          backgroundColor: c.key === 'none' ? '#fdfbf7' : c.accent,
          borderColor: c.key === 'none' ? '#d4c5b3' : c.accent
        }}
      >
        {(card.coverColor || 'none') === c.key && (
          <Check className={`w-3 h-3 ${c.key === 'none' ? 'text-boho-espresso' : 'text-white'}`} />
        )}
      </button>
    ))}
  </div>
</div>
```
4. In description section, add `[Tulis / Edit]` and `[Pratinjau / Preview]` segmented control:
```tsx
<div className="flex items-center justify-between mb-2">
  <label className="text-xs font-semibold text-boho-walnut uppercase tracking-wider">
    Deskripsi
  </label>
  <div className="flex items-center bg-boho-canvas/60 p-0.5 rounded-md border border-boho-canvas text-xs">
    <button
      type="button"
      onClick={() => setDescriptionTab('write')}
      className={`px-2 py-0.5 rounded transition-all ${
        descriptionTab === 'write' ? 'bg-white text-boho-espresso shadow-xs font-medium' : 'text-boho-clay hover:text-boho-walnut'
      }`}
    >
      Tulis
    </button>
    <button
      type="button"
      onClick={() => setDescriptionTab('preview')}
      className={`px-2 py-0.5 rounded transition-all ${
        descriptionTab === 'preview' ? 'bg-white text-boho-espresso shadow-xs font-medium' : 'text-boho-clay hover:text-boho-walnut'
      }`}
    >
      Pratinjau
    </button>
  </div>
</div>
```
5. If `descriptionTab === 'preview'`, render rendered HTML:
```tsx
{descriptionTab === 'write' ? (
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    onBlur={handleSaveDescription}
    placeholder="Tulis deskripsi atau catatan... (Mendukung Markdown: **tebal**, *miring*, - list, - [ ] task)"
    className="w-full text-xs p-3 rounded-lg border border-boho-canvas focus:border-terracotta bg-white/50 focus:bg-white resize-y min-h-[90px] text-boho-espresso placeholder-boho-clay/60 focus:outline-none transition-colors"
  />
) : (
  <div
    className="w-full text-xs p-3 rounded-lg border border-boho-canvas bg-white/80 min-h-[90px] text-boho-espresso overflow-y-auto leading-relaxed"
    dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(description) || '<span class="text-boho-clay italic">Tidak ada deskripsi.</span>' }}
  />
)}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/cardCovers.modal.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/renderer/src/components/board/CardItem.tsx src/renderer/src/components/modal/CardDetailModal.tsx tests/cardCovers.modal.test.tsx
git commit -m "feat(cards): add bohemian card covers and tabbed markdown preview in detail modal"
```

---

### Task 5: Calendar Grid & Unscheduled Drawer Component (`CalendarView`)

**Files:**
- Create: `src/renderer/src/utils/calendar.ts`
- Create: `src/renderer/src/components/calendar/CalendarView.tsx`
- Create: `tests/calendarView.test.tsx`

- [ ] **Step 1: Write failing tests for calendar utility and view component**

Create `tests/calendarView.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from '../src/renderer/src/components/calendar/CalendarView';
import { getMonthGridDays, formatYearMonthIndo } from '../src/renderer/src/utils/calendar';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';
import { Card, Board, Column } from '../src/shared/types';

describe('Calendar Date Calculations', () => {
  it('generates 35 or 42 calendar grid days for a given year and month', () => {
    const days = getMonthGridDays(2026, 8); // September 2026 (0-indexed: 8)
    expect(days.length % 7).toBe(0);
    expect(days.length).toBeGreaterThanOrEqual(35);

    // Day 1 of September 2026 is Tuesday
    const sepFirst = days.find((d) => d.dateString === '2026-09-01');
    expect(sepFirst).toBeDefined();
    expect(sepFirst?.isCurrentMonth).toBe(true);
  });

  it('formats month and year in Indonesian', () => {
    const title = formatYearMonthIndo(2026, 8);
    expect(title).toBe('September 2026');
  });
});

describe('CalendarView UI Component', () => {
  const mockCards: Card[] = [
    {
      id: 'c1',
      boardId: 'b1',
      columnId: 'col1',
      title: 'Review Sprint',
      description: '',
      order: 0,
      dueDate: '2026-09-15',
      coverColor: 'terracotta',
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 'c2',
      boardId: 'b1',
      columnId: 'col1',
      title: 'Task Belum Terjadwal',
      description: '',
      order: 1,
      createdAt: '',
      updatedAt: ''
    }
  ];

  const mockUpdateCardDueDate = vi.fn();
  const mockCreateCard = vi.fn();
  const mockOnCardClick = vi.fn();

  const mockContextValue = {
    boards: [{ id: 'b1', title: 'Board Proyek' }],
    activeBoardId: 'b1',
    activeBoard: { id: 'b1', title: 'Board Proyek' },
    columns: [{ id: 'col1', boardId: 'b1', title: 'To Do', order: 0 }],
    cards: mockCards,
    updateCardDueDate: mockUpdateCardDueDate,
    createCard: mockCreateCard
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders calendar month navigation and scheduled cards on date cells', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    expect(screen.getByText('September 2026')).toBeDefined();
    expect(screen.getByText('Review Sprint')).toBeDefined();
  });

  it('opens card detail modal when clicking a scheduled card', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    fireEvent.click(screen.getByText('Review Sprint'));
    expect(mockOnCardClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('toggles unscheduled tasks drawer and shows cards without due date', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <CalendarView
          initialYear={2026}
          initialMonth={8}
          onCardClick={mockOnCardClick}
        />
      </KanbanContext.Provider>
    );

    const drawerBtn = screen.getByRole('button', { name: /Belum Terjadwal/i });
    fireEvent.click(drawerBtn);

    expect(screen.getByText('Task Belum Terjadwal')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/calendarView.test.tsx`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement `src/renderer/src/utils/calendar.ts`**

Create `src/renderer/src/utils/calendar.ts`:
```typescript
export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatYearMonthIndo(year: number, monthIndex: number): string {
  return `${MONTH_NAMES_ID[monthIndex]} ${year}`;
}

export function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthGridDays(year: number, monthIndex: number): CalendarDay[] {
  const todayIso = formatDateToIso(new Date());

  // First day of target month
  const firstDay = new Date(year, monthIndex, 1);
  // Monday is index 0 in Indonesian/Bohemian calendar (0: Mon ... 6: Sun)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Last day of target month
  const lastDay = new Date(year, monthIndex + 1, 0);
  const totalDaysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];

  // Padding days from previous month
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const date = new Date(year, monthIndex - 1, d);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateString === todayIso
    });
  }

  // Days in current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const date = new Date(year, monthIndex, d);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayIso
    });
  }

  // Padding days from next month to complete standard 7x5 or 7x6 grid
  const remainingCells = 7 - (days.length % 7);
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const date = new Date(year, monthIndex + 1, d);
      const dateString = formatDateToIso(date);
      days.push({
        date,
        dateString,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateString === todayIso
      });
    }
  }

  return days;
}
```

- [ ] **Step 4: Implement `src/renderer/src/components/calendar/CalendarView.tsx`**

Create `src/renderer/src/components/calendar/CalendarView.tsx` with:
- Month navigation header: `ChevronLeft`, `ChevronRight`, `Hari Ini` button, Indonesian Month Year title.
- Filter toggle: `[ Board Ini ]` vs `[ Semua Board ]`.
- Unscheduled tasks drawer toggle button with count badge.
- 7 Column weekday headers: `Sen, Sel, Rab, Kam, Jum, Sab, Min`.
- Grid cell rendering:
  - `onDragOver={(e) => { e.preventDefault(); }}`
  - `onDrop={(e) => { const cardId = e.dataTransfer.getData('text/plain'); updateCardDueDate(cardId, day.dateString); }}`
  - Scheduled mini-card pills with `draggable={true}`.
  - Plus button on date cell hover to quick create a card with `dueDate: day.dateString`.
- Collapsible Unscheduled drawer with draggable card items.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/calendarView.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/renderer/src/utils/calendar.ts src/renderer/src/components/calendar/CalendarView.tsx tests/calendarView.test.tsx
git commit -m "feat(calendar): implement monthly calendar grid with drag-and-drop date scheduling and unscheduled drawer"
```

---

### Task 6: BoardCanvas View Switcher, Command Palette Integration & E2E Verification

**Files:**
- Modify: `src/renderer/src/components/board/BoardCanvas.tsx`
- Modify: `src/renderer/src/components/modal/CommandPalette.tsx`
- Modify: `src/renderer/src/App.tsx`
- Modify: `tests/e2e.features.test.tsx`

- [ ] **Step 1: Update `src/renderer/src/components/board/BoardCanvas.tsx`**

In `BoardCanvas.tsx`:
1. Import `useKanban` to access `viewMode` and `setViewMode`.
2. Import `CalendarView`.
3. In the top board header toolbar, render the view switcher next to the board title:
```tsx
<div className="flex items-center bg-boho-canvas/60 p-0.5 rounded-lg border border-boho-canvas">
  <button
    type="button"
    onClick={() => setViewMode('kanban')}
    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
      viewMode === 'kanban' ? 'bg-white text-boho-espresso shadow-xs' : 'text-boho-walnut hover:text-boho-espresso'
    }`}
  >
    <Layout className="w-3.5 h-3.5" />
    <span>Kanban</span>
  </button>
  <button
    type="button"
    onClick={() => setViewMode('calendar')}
    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
      viewMode === 'calendar' ? 'bg-white text-boho-espresso shadow-xs' : 'text-boho-walnut hover:text-boho-espresso'
    }`}
  >
    <CalendarIcon className="w-3.5 h-3.5" />
    <span>Kalender</span>
  </button>
</div>
```
4. Render `<CalendarView onCardClick={onCardClick} />` when `viewMode === 'calendar'`, otherwise render the column drag-and-drop canvas.

- [ ] **Step 2: Update `src/renderer/src/components/modal/CommandPalette.tsx`**

In `CommandPalette.tsx`:
Add quick action entries for:
- `switch-calendar`: Title `"Beralih ke Tampilan Kalender"`, Subtitle `"Lihat kartu berdasarkan jadwal tenggat waktu"`, Icon `Calendar`.
- `switch-kanban`: Title `"Beralih ke Tampilan Kanban Board"`, Subtitle `"Kembali ke papan kolom kanban"`, Icon `Layout`.

In `src/renderer/src/App.tsx`:
Handle these action keys in `onQuickAction`:
```tsx
else if (actionKey === 'switch-calendar') {
  await setViewMode('calendar');
} else if (actionKey === 'switch-kanban') {
  await setViewMode('kanban');
}
```

- [ ] **Step 3: Update `tests/e2e.features.test.tsx`**

Add Journey 11 to `tests/e2e.features.test.tsx`:
- Verifies switching between Kanban view and Calendar view.
- Verifies reordering tabs in WindowHeader.
- Verifies setting card cover color and previewing markdown.
- Verifies calendar scheduling.

- [ ] **Step 4: Run full test suite and production build**

Run:
```bash
npm test
npm run build
```
Expected: All test suites PASS (103+ tests), build succeeds with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/components/board/BoardCanvas.tsx src/renderer/src/components/modal/CommandPalette.tsx src/renderer/src/App.tsx tests/e2e.features.test.tsx
git commit -m "feat: wire calendar view switcher, command palette actions, and e2e feature verification"
```
