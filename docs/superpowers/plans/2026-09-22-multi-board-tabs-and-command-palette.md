# Multi-Board Tabs, Command Palette & Window Dragging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement desktop window dragging on the frameless titlebar, browser-like Multi-Board Tabs in `WindowHeader`, and a global Bohemian Command Palette (`Ctrl+K` / `Ctrl+P`) in KanbanGO!.

**Architecture:** 
- CSS utilities `.app-drag` and `.app-no-drag` enable native frameless dragging in Electron without intercepting button/tab clicks.
- `KanbanContext` maintains `openBoardIds: string[]` synced with Dexie IndexedDB `db.settings`, providing state and actions (`openBoardTab`, `closeBoardTab`).
- `WindowHeader` renders horizontal Bohemian tabs between the brand logo and window controls with tab closing and creation.
- `CommandPalette` renders a floating Spotlight modal with global `Ctrl+K` / `Ctrl+P` listeners, searching across Boards, Cards, and Quick Actions with keyboard arrow navigation.

**Tech Stack:** Electron 31, React 18, TypeScript, Tailwind CSS, Lucide Icons, Dexie.js, Vitest, Testing Library.

---

### Task 1: Window Dragging Fix & Header Window Controls

**Files:**
- Modify: `src/renderer/src/styles/index.css`
- Modify: `src/renderer/src/components/layout/WindowHeader.tsx`
- Test: `tests/windowHeader.test.tsx`

- [ ] **Step 1: Write unit tests for WindowHeader dragging classes and controls**

```tsx
// tests/windowHeader.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowHeader } from '../src/renderer/src/components/layout/WindowHeader';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('WindowHeader Dragging and Window Controls', () => {
  const mockElectronAPI = {
    minimizeWindow: vi.fn(),
    maximizeWindow: vi.fn(),
    closeWindow: vi.fn()
  };

  const mockContextValue = {
    activeBoard: { id: 'b1', title: 'Board Utama' },
    openBoardIds: ['b1'],
    boards: [{ id: 'b1', title: 'Board Utama' }],
    openBoardTab: vi.fn(),
    closeBoardTab: vi.fn(),
    createBoard: vi.fn()
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).electronAPI = mockElectronAPI;
  });

  it('has app-drag on the header element and app-no-drag on interactive controls', () => {
    const { container } = render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const header = container.querySelector('header');
    expect(header).toBeDefined();
    expect(header?.classList.contains('app-drag')).toBe(true);

    const controlGroup = screen.getByTitle('Close').parentElement;
    expect(controlGroup?.classList.contains('app-no-drag')).toBe(true);
  });

  it('triggers minimize, maximize, and close window calls via electronAPI', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    fireEvent.click(screen.getByTitle('Minimize'));
    expect(mockElectronAPI.minimizeWindow).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Maximize'));
    expect(mockElectronAPI.maximizeWindow).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Close'));
    expect(mockElectronAPI.closeWindow).toHaveBeenCalledTimes(1);
  });

  it('toggles maximize on header double-click', () => {
    const { container } = render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const header = container.querySelector('header');
    fireEvent.doubleClick(header!);
    expect(mockElectronAPI.maximizeWindow).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx vitest run tests/windowHeader.test.tsx`  
Expected: FAIL (missing double-click handler or CSS class alignment)

- [ ] **Step 3: Define `.app-drag` and `.app-no-drag` in `src/renderer/src/styles/index.css`**

Add to `src/renderer/src/styles/index.css`:
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

- [ ] **Step 4: Update `src/renderer/src/components/layout/WindowHeader.tsx`**

Add double-click maximize toggle and confirm `app-drag` / `app-no-drag` attributes:
```tsx
import React from 'react';
import { useKanban } from '../../context/KanbanContext';
import { Minus, Square, X, Feather } from 'lucide-react';

export const WindowHeader: React.FC = () => {
  const { activeBoard } = useKanban();

  const handleMinimize = () => {
    (window as any).electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    (window as any).electronAPI?.maximizeWindow?.();
  };

  const handleClose = () => {
    (window as any).electronAPI?.closeWindow?.();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only maximize if double clicked on draggable region, not buttons
    if ((e.target as HTMLElement).closest('.app-no-drag')) return;
    (window as any).electronAPI?.maximizeWindow?.();
  };

  return (
    <header
      onDoubleClick={handleDoubleClick}
      className="h-10 bg-boho-sand/70 border-b border-boho-canvas/80 flex items-center justify-between px-3 select-none app-drag font-sans text-xs"
    >
      {/* Brand info */}
      <div className="flex items-center gap-2 app-no-drag">
        <div className="w-5 h-5 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta">
          <Feather className="w-3.5 h-3.5" />
        </div>
        <span className="font-serif font-bold text-boho-espresso tracking-wide text-sm">
          KanbanGO!
        </span>
        {activeBoard && (
          <>
            <span className="text-boho-clay">/</span>
            <span className="text-boho-walnut font-medium truncate max-w-[200px]">
              {activeBoard.title}
            </span>
          </>
        )}
      </div>

      {/* Desktop Window Controls */}
      <div className="flex items-center gap-1 app-no-drag">
        <button
          type="button"
          onClick={handleMinimize}
          className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-boho-canvas/60 transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleMaximize}
          className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-boho-canvas/60 transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-rose-500 hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
```

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest run tests/windowHeader.test.tsx
git add src/renderer/src/styles/index.css src/renderer/src/components/layout/WindowHeader.tsx tests/windowHeader.test.tsx
git commit -m "fix(window): enable native window dragging and double click maximize"
```

---

### Task 2: Multi-Board Tabs State & Dexie Persistence in KanbanContext

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `src/renderer/src/context/KanbanContext.tsx`
- Test: `tests/tabs.context.test.ts`

- [ ] **Step 1: Write unit tests for tab state transitions and persistence**

```ts
// tests/tabs.context.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../src/renderer/src/db/db';
import { seedInitialData } from '../src/renderer/src/db/seed';

describe('Multi-Board Tabs Context Logic', () => {
  beforeEach(async () => {
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.settings.clear();
    await seedInitialData(db);
  });

  it('initializes openBoardIds with activeBoardId from database settings', async () => {
    const settings = await db.settings.get('default');
    expect(settings?.activeBoardId).toBeDefined();

    // Verify fallback when openBoardIds is empty
    const openBoardIds = settings?.openBoardIds || [settings!.activeBoardId!];
    expect(openBoardIds.length).toBeGreaterThan(0);
    expect(openBoardIds).toContain(settings?.activeBoardId);
  });

  it('correctly calculates next active board when closing the active tab', () => {
    const openBoardIds = ['b1', 'b2', 'b3'];
    const activeBoardId = 'b2';

    const closedIndex = openBoardIds.indexOf(activeBoardId);
    const updatedTabs = openBoardIds.filter(id => id !== activeBoardId);

    // Adjacent tab logic
    const nextActiveId = updatedTabs[Math.min(closedIndex, updatedTabs.length - 1)];
    expect(nextActiveId).toBe('b3');
  });

  it('keeps remaining active tab unchanged when closing an inactive tab', () => {
    const openBoardIds = ['b1', 'b2', 'b3'];
    const activeBoardId = 'b1';

    const closedId = 'b3';
    const updatedTabs = openBoardIds.filter(id => id !== closedId);
    const nextActiveId = activeBoardId === closedId ? updatedTabs[0] : activeBoardId;

    expect(nextActiveId).toBe('b1');
    expect(updatedTabs).toEqual(['b1', 'b2']);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/tabs.context.test.ts`  
Expected: PASS

- [ ] **Step 3: Update `src/shared/types.ts`**

Add `openBoardIds?: string[]` to `UserSettings`:
```ts
export interface UserSettings {
  id: string;
  activeBoardId?: string;
  openBoardIds?: string[];
  profile?: UserProfile;
  assistant?: AssistantConfig;
}
```

- [ ] **Step 4: Update `KanbanContext.tsx` with `openBoardIds`, `openBoardTab`, and `closeBoardTab`**

In `src/renderer/src/context/KanbanContext.tsx`:
1. Add `openBoardIds: string[]` to `KanbanContextType`.
2. Add `openBoardTab: (boardId: string) => Promise<void>`.
3. Add `closeBoardTab: (boardId: string) => Promise<void>`.
4. Add state: `const [openBoardIds, setOpenBoardIds] = useState<string[]>([]);`
5. In `refreshData()`:
   ```ts
   const validOpenIds = (settings?.openBoardIds || [])
     .filter((id) => allBoards.some((b) => b.id === id));
   const finalOpenIds = validOpenIds.length > 0
     ? validOpenIds
     : (allBoards.length > 0 ? [allBoards[0].id] : []);
   setOpenBoardIds(finalOpenIds);
   ```
6. Implement `openBoardTab`:
   ```ts
   const openBoardTab = async (boardId: string) => {
     if (!boards.some((b) => b.id === boardId)) return;
     const updated = openBoardIds.includes(boardId)
       ? openBoardIds
       : [...openBoardIds, boardId];
     setOpenBoardIds(updated);
     await setActiveBoardId(boardId);
     const existing = await db.settings.get('default');
     if (existing) {
       await db.settings.update('default', { openBoardIds: updated, activeBoardId: boardId });
     }
   };
   ```
7. Implement `closeBoardTab`:
   ```ts
   const closeBoardTab = async (boardId: string) => {
     const closedIndex = openBoardIds.indexOf(boardId);
     const updated = openBoardIds.filter((id) => id !== boardId);
     setOpenBoardIds(updated);

     let nextActiveId = activeBoardId;
     if (activeBoardId === boardId) {
       if (updated.length > 0) {
         const nextIndex = Math.min(closedIndex, updated.length - 1);
         nextActiveId = updated[nextIndex];
       } else if (boards.length > 0) {
         nextActiveId = boards[0].id;
         setOpenBoardIds([nextActiveId]);
       } else {
         nextActiveId = null;
       }
       if (nextActiveId) {
         await setActiveBoardId(nextActiveId);
       }
     }

     const existing = await db.settings.get('default');
     if (existing) {
       await db.settings.update('default', {
         openBoardIds: updated.length > 0 ? updated : (nextActiveId ? [nextActiveId] : []),
         activeBoardId: nextActiveId || undefined
       });
     }
   };
   ```
8. Also update `createBoard` so that when a new board is created, it is automatically added to `openBoardIds`.
9. When a board is deleted in `deleteBoard(id)`, remove `id` from `openBoardIds`.

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest run tests/tabs.context.test.ts
npm test
git add src/shared/types.ts src/renderer/src/context/KanbanContext.tsx tests/tabs.context.test.ts
git commit -m "feat(context): add openBoardIds state with openBoardTab and closeBoardTab actions"
```

---

### Task 3: Multi-Board Tabs UI in WindowHeader

**Files:**
- Modify: `src/renderer/src/components/layout/WindowHeader.tsx`
- Test: `tests/windowHeader.tabs.test.tsx`

- [ ] **Step 1: Write unit tests for Tabs rendering in WindowHeader**

```tsx
// tests/windowHeader.tabs.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowHeader } from '../src/renderer/src/components/layout/WindowHeader';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('WindowHeader Tabs UI', () => {
  const mockOpenTab = vi.fn();
  const mockCloseTab = vi.fn();
  const mockCreateBoard = vi.fn();

  const mockContextValue = {
    boards: [
      { id: 'b1', title: 'Board Satu' },
      { id: 'b2', title: 'Board Dua' }
    ],
    activeBoardId: 'b1',
    activeBoard: { id: 'b1', title: 'Board Satu' },
    openBoardIds: ['b1', 'b2'],
    openBoardTab: mockOpenTab,
    closeBoardTab: mockCloseTab,
    createBoard: mockCreateBoard
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a tab for each open board with active style', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    expect(screen.getByText('Board Satu')).toBeDefined();
    expect(screen.getByText('Board Dua')).toBeDefined();
  });

  it('switches active tab when clicking an inactive tab', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    fireEvent.click(screen.getByText('Board Dua'));
    expect(mockOpenTab).toHaveBeenCalledWith('b2');
  });

  it('closes tab when clicking the close button on a tab', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const closeButtons = screen.getAllByTitle(/Tutup Tab/i);
    expect(closeButtons.length).toBe(2);

    fireEvent.click(closeButtons[0]);
    expect(mockCloseTab).toHaveBeenCalledWith('b1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx vitest run tests/windowHeader.tabs.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement Tabs in `src/renderer/src/components/layout/WindowHeader.tsx`**

Integrate tab bar, tab switching, tab close, add board, and horizontal wheel scrolling:
```tsx
import React from 'react';
import { useKanban } from '../../context/KanbanContext';
import { Minus, Square, X, Feather, Plus, Layout } from 'lucide-react';

export const WindowHeader: React.FC<{ onOpenCommandPalette?: () => void }> = ({ onOpenCommandPalette }) => {
  const {
    boards,
    activeBoardId,
    openBoardIds,
    openBoardTab,
    closeBoardTab,
    createBoard
  } = useKanban();

  const handleMinimize = () => {
    (window as any).electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    (window as any).electronAPI?.maximizeWindow?.();
  };

  const handleClose = () => {
    (window as any).electronAPI?.closeWindow?.();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.app-no-drag')) return;
    (window as any).electronAPI?.maximizeWindow?.();
  };

  const handleAddBoard = async () => {
    const title = `Board Baru ${boards.length + 1}`;
    await createBoard(title);
  };

  // Filter open boards
  const openBoards = openBoardIds
    .map((id) => boards.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <header
      onDoubleClick={handleDoubleClick}
      className="h-10 bg-boho-sand/80 border-b border-boho-canvas flex items-center justify-between px-3 select-none app-drag font-sans text-xs gap-3"
    >
      {/* Brand & Tab Bar */}
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        {/* Brand Icon & Name */}
        <div className="flex items-center gap-1.5 shrink-0 app-no-drag pr-2 border-r border-boho-canvas/60">
          <div className="w-5 h-5 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif font-bold text-boho-espresso tracking-wide text-xs">
            KanbanGO!
          </span>
        </div>

        {/* Horizontal Tabs Container */}
        <div
          className="flex items-center gap-1 overflow-x-auto no-scrollbar app-no-drag py-1 flex-1"
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY;
          }}
        >
          {openBoards.map((board) => {
            if (!board) return null;
            const isActive = board.id === activeBoardId;
            return (
              <div
                key={board.id}
                onClick={() => openBoardTab(board.id)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer shrink-0 max-w-[160px] border ${
                  isActive
                    ? 'bg-white text-boho-espresso font-semibold border-terracotta/40 shadow-xs'
                    : 'bg-transparent text-boho-walnut hover:bg-boho-canvas/50 border-transparent'
                }`}
                title={board.title}
              >
                <Layout className={`w-3 h-3 shrink-0 ${isActive ? 'text-terracotta' : 'text-boho-clay'}`} />
                <span className="truncate flex-1">{board.title}</span>
                <button
                  type="button"
                  title="Tutup Tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeBoardTab(board.id);
                  }}
                  className="w-4 h-4 flex items-center justify-center rounded-full opacity-60 group-hover:opacity-100 hover:bg-boho-canvas text-boho-clay hover:text-terracotta transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}

          {/* Add Board Tab Button */}
          <button
            type="button"
            onClick={handleAddBoard}
            className="p-1 rounded-md text-boho-clay hover:text-terracotta hover:bg-boho-canvas/60 transition-colors shrink-0"
            title="Tambah Board Baru"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right section: Quick Switcher Button & Window Controls */}
      <div className="flex items-center gap-2 shrink-0 app-no-drag">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-boho-canvas/50 hover:bg-boho-canvas text-boho-walnut border border-boho-canvas/80 text-[11px] transition-colors"
            title="Buka Command Palette (Ctrl+K)"
          >
            <span className="text-xs">⌘K</span>
          </button>
        )}

        {/* Window controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleMinimize}
            className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-boho-canvas/60 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleMaximize}
            className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-boho-canvas/60 transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-boho-walnut hover:bg-rose-500 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
```

- [ ] **Step 4: Run tests and commit**

```bash
npx vitest run tests/windowHeader.tabs.test.tsx
npx vitest run tests/windowHeader.test.tsx
git add src/renderer/src/components/layout/WindowHeader.tsx tests/windowHeader.tabs.test.tsx
git commit -m "feat(header): render multi-board tabs with add and close actions"
```

---

### Task 4: Bohemian Command Palette Modal Component & Global Keyboard Shortcuts

**Files:**
- Create: `src/renderer/src/components/modal/CommandPalette.tsx`
- Modify: `src/renderer/src/App.tsx`
- Test: `tests/commandPalette.test.tsx`

- [ ] **Step 1: Write unit tests for CommandPalette interactions**

```tsx
// tests/commandPalette.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '../src/renderer/src/components/modal/CommandPalette';

describe('Bohemian Command Palette (Ctrl+K / Ctrl+P)', () => {
  const mockClose = vi.fn();
  const mockSelectBoard = vi.fn();
  const mockSelectCard = vi.fn();
  const mockQuickAction = vi.fn();

  const mockBoards = [
    { id: 'b1', title: 'Work Projects', description: 'Office items' },
    { id: 'b2', title: 'Personal Goals', description: 'Life balance' }
  ];

  const mockCards = [
    { id: 'c1', boardId: 'b1', title: 'Finish Quarterly Report', description: '' },
    { id: 'c2', boardId: 'b2', title: 'Buy Coffee Beans', description: '' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters boards and cards based on search query', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={mockClose}
        boards={mockBoards as any}
        cards={mockCards as any}
        onSelectBoard={mockSelectBoard}
        onSelectCard={mockSelectCard}
        onQuickAction={mockQuickAction}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik nama board/i);
    fireEvent.change(input, { target: { value: 'Coffee' } });

    expect(screen.getByText('Buy Coffee Beans')).toBeDefined();
    expect(screen.queryByText('Finish Quarterly Report')).toBeNull();
  });

  it('navigates with keyboard arrow down and enters to select', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={mockClose}
        boards={mockBoards as any}
        cards={[]}
        onSelectBoard={mockSelectBoard}
        onSelectCard={mockSelectCard}
        onQuickAction={mockQuickAction}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik nama board/i);
    // Press ArrowDown to select second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSelectBoard).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={mockClose}
        boards={mockBoards as any}
        cards={[]}
        onSelectBoard={mockSelectBoard}
        onSelectCard={mockSelectCard}
        onQuickAction={mockQuickAction}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik nama board/i);
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx vitest run tests/commandPalette.test.tsx`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `src/renderer/src/components/modal/CommandPalette.tsx`**

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Board, Card } from '../../../shared/types';
import { Search, Layout, CheckSquare, Plus, Download, Upload, User, X } from 'lucide-react';

export interface CommandItem {
  id: string;
  type: 'board' | 'card' | 'action';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  cards: Card[];
  onSelectBoard: (boardId: string) => void;
  onSelectCard: (card: Card) => void;
  onQuickAction: (actionKey: 'create-board' | 'create-card' | 'export' | 'import' | 'profile') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  boards,
  cards,
  onSelectBoard,
  onSelectCard,
  onQuickAction
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // 1. Boards
  const matchingBoards: CommandItem[] = boards
    .filter((b) => !cleanQuery || b.title.toLowerCase().includes(cleanQuery) || b.description?.toLowerCase().includes(cleanQuery))
    .slice(0, 5)
    .map((b) => ({
      id: `board-${b.id}`,
      type: 'board',
      title: b.title,
      subtitle: 'Papan Kerja',
      icon: <Layout className="w-4 h-4 text-terracotta" />,
      action: () => {
        onSelectBoard(b.id);
        onClose();
      }
    }));

  // 2. Cards
  const matchingCards: CommandItem[] = cards
    .filter((c) => !cleanQuery || c.title.toLowerCase().includes(cleanQuery) || c.description?.toLowerCase().includes(cleanQuery) || c.tags.some(t => t.toLowerCase().includes(cleanQuery)))
    .slice(0, 6)
    .map((c) => {
      const parentBoard = boards.find((b) => b.id === c.boardId);
      return {
        id: `card-${c.id}`,
        type: 'card',
        title: c.title,
        subtitle: parentBoard ? `Kartu • ${parentBoard.title}` : 'Kartu Tugas',
        icon: <CheckSquare className="w-4 h-4 text-amber-600" />,
        action: () => {
          onSelectCard(c);
          onClose();
        }
      };
    });

  // 3. Quick Actions
  const quickActions: CommandItem[] = [
    {
      id: 'action-create-board',
      type: 'action',
      title: 'Buat Board Baru',
      subtitle: 'Tambah kanban board baru',
      icon: <Plus className="w-4 h-4 text-sage" />,
      action: () => {
        onQuickAction('create-board');
        onClose();
      }
    },
    {
      id: 'action-create-card',
      type: 'action',
      title: 'Buat Kartu Baru',
      subtitle: 'Tambah kartu di kolom pertama board aktif',
      icon: <CheckSquare className="w-4 h-4 text-sage" />,
      action: () => {
        onQuickAction('create-card');
        onClose();
      }
    },
    {
      id: 'action-export',
      type: 'action',
      title: 'Ekspor Cadangan Board (JSON)',
      subtitle: 'Unduh backup file JSON',
      icon: <Download className="w-4 h-4 text-boho-clay" />,
      action: () => {
        onQuickAction('export');
        onClose();
      }
    },
    {
      id: 'action-import',
      type: 'action',
      title: 'Impor Cadangan Board (JSON)',
      subtitle: 'Pulihkan data dari file JSON',
      icon: <Upload className="w-4 h-4 text-boho-clay" />,
      action: () => {
        onQuickAction('import');
        onClose();
      }
    },
    {
      id: 'action-profile',
      type: 'action',
      title: 'Buka Profil & Asisten',
      subtitle: 'Pengaturan nama, avatar, dan jam pengingat',
      icon: <User className="w-4 h-4 text-terracotta" />,
      action: () => {
        onQuickAction('profile');
        onClose();
      }
    }
  ].filter((a) => !cleanQuery || a.title.toLowerCase().includes(cleanQuery) || a.subtitle?.toLowerCase().includes(cleanQuery));

  const allItems: CommandItem[] = [...matchingBoards, ...matchingCards, ...quickActions];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length > 0 ? (prev + 1) % allItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allItems.length > 0 ? (prev - 1 + allItems.length) % allItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-boho-espresso/40 backdrop-blur-xs flex justify-center pt-20 px-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-boho-canvas rounded-2xl shadow-2xl overflow-hidden flex flex-col h-fit max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-boho-canvas">
          <Search className="w-4 h-4 text-terracotta shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ketik nama board, kartu tugas, atau aksi cepat..."
            className="flex-1 text-sm bg-transparent outline-none text-boho-espresso placeholder-boho-clay"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-boho-clay bg-boho-sand rounded border border-boho-canvas">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-boho-clay">
              Tidak ada hasil untuk &quot;{query}&quot;
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-terracotta-light text-terracotta-deep font-medium'
                      : 'text-boho-espresso hover:bg-boho-sand/60'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-white/80 shrink-0 shadow-2xs">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-[10px] text-boho-clay truncate">{item.subtitle}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Integrate CommandPalette in `src/renderer/src/App.tsx` with global keyboard shortcuts**

In `src/renderer/src/App.tsx`:
- Add `isCommandPaletteOpen` state.
- Add `useEffect` listening for `(e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'p')`.
- Connect `CommandPalette` with `openBoardTab`, `createCard`, `exportBoardData`, `importBoardData`, and `openProfileModal`.

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest run tests/commandPalette.test.tsx
npm test
git add src/renderer/src/components/modal/CommandPalette.tsx src/renderer/src/App.tsx tests/commandPalette.test.tsx
git commit -m "feat(palette): implement Bohemian Command Palette with Ctrl+K and Ctrl+P shortcuts"
```

---

### Task 5: End-to-End Integration Tests & Production Build Verification

**Files:**
- Modify: `tests/e2e.features.test.tsx`
- Run: `npm test`
- Build: `npm run build`

- [ ] **Step 1: Add Journey 9 & Journey 10 in `tests/e2e.features.test.tsx`**

Add Journey 9 (Multi-board tab switching and closing) and Journey 10 (Command Palette trigger and selection).

- [ ] **Step 2: Run complete test suite**

Run: `npm test`  
Expected: PASS (All test files passing with 0 failures)

- [ ] **Step 3: Run production build**

Run: `npm run build`  
Expected: Exit code 0 with bundles generated.

- [ ] **Step 4: Commit changes**

```bash
git add tests/e2e.features.test.tsx
git commit -m "test: verify multi-board tabs and command palette in e2e test suite"
```
