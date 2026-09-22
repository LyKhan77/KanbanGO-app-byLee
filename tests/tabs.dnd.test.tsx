import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowHeader } from '../src/renderer/src/components/layout/WindowHeader';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('Draggable Board Tabs in WindowHeader', () => {
  const mockReorderBoardTabs = vi.fn();
  const mockOpenTab = vi.fn();
  const mockCloseTab = vi.fn();
  const mockCreateBoard = vi.fn();

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
    closeBoardTab: mockCloseTab,
    createBoard: mockCreateBoard,
    reorderBoardTabs: mockReorderBoardTabs
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tabs with draggable attribute set to true and app-no-drag class', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(3);
    tabs.forEach((tab) => {
      expect(tab.getAttribute('draggable')).toBe('true');
      expect(tab.classList.contains('app-no-drag')).toBe(true);
    });
  });

  it('shows right border indicator when dragging forward (tab 0 over tab 1)', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    const sourceTab = tabs[0];
    const targetTab = tabs[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(sourceTab, { dataTransfer });
    fireEvent.dragOver(targetTab, { dataTransfer });

    expect(targetTab.className).toContain('border-r-terracotta');
    expect(targetTab.className).not.toContain('border-l-terracotta');
  });

  it('shows left border indicator when dragging backward (tab 2 over tab 1)', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    const sourceTab = tabs[2];
    const targetTab = tabs[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(sourceTab, { dataTransfer });
    fireEvent.dragOver(targetTab, { dataTransfer });

    expect(targetTab.className).toContain('border-l-terracotta');
    expect(targetTab.className).not.toContain('border-r-terracotta');
  });

  it('resets visual indicator classes on dragEnd', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    const sourceTab = tabs[0];
    const targetTab = tabs[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(sourceTab, { dataTransfer });
    fireEvent.dragOver(targetTab, { dataTransfer });
    expect(targetTab.className).toContain('border-r-terracotta');
    expect(sourceTab.className).toContain('opacity-40');

    fireEvent.dragEnd(sourceTab);
    expect(targetTab.className).not.toContain('border-r-terracotta');
    expect(targetTab.className).not.toContain('border-l-terracotta');
    expect(sourceTab.className).not.toContain('opacity-40');
  });

  it('safely ignores drop event without prior drag start (draggedTabIndex is null)', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    const targetTab = tabs[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue('0'),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.drop(targetTab, { dataTransfer });
    expect(mockReorderBoardTabs).not.toHaveBeenCalled();
  });

  it('triggers reorderBoardTabs on drag and drop between tabs with custom mime type', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    const sourceTab = tabs[0];
    const targetTab = tabs[2];

    const dataStore: Record<string, string> = {};
    const dataTransfer = {
      setData: vi.fn((key: string, val: string) => {
        dataStore[key] = val;
      }),
      getData: vi.fn((key: string) => dataStore[key] || ''),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(sourceTab, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('application/x-kanbango-tab-index', '0');
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '0');

    fireEvent.dragOver(targetTab, { dataTransfer });
    fireEvent.drop(targetTab, { dataTransfer });

    expect(mockReorderBoardTabs).toHaveBeenCalledWith(0, 2);
  });

  it('does not trigger reorderBoardTabs when dropping a tab onto itself', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    const tab = tabs[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue('1'),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(tab, { dataTransfer });
    fireEvent.dragOver(tab, { dataTransfer });
    fireEvent.drop(tab, { dataTransfer });

    expect(mockReorderBoardTabs).not.toHaveBeenCalled();
  });

  it('preserves drop indicator when dragLeave moves to child element and clears when leaving tab', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    const sourceTab = tabs[0];
    const targetTab = tabs[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue('0'),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(sourceTab, { dataTransfer });
    fireEvent.dragOver(targetTab, { dataTransfer });
    expect(targetTab.className).toContain('border-r-terracotta');

    // Child elements should have pointer-events-none
    const childSpan = targetTab.querySelector('span');
    const childIcon = targetTab.querySelector('svg');
    expect(childSpan?.classList.contains('pointer-events-none')).toBe(true);
    expect(childIcon?.classList.contains('pointer-events-none')).toBe(true);

    // DragLeave to a child inside targetTab
    const leaveEventToChild = new Event('dragleave', { bubbles: true });
    Object.defineProperty(leaveEventToChild, 'relatedTarget', { value: childSpan });
    fireEvent(targetTab, leaveEventToChild);
    // Still shows indicator because relatedTarget is inside targetTab
    expect(targetTab.className).toContain('border-r-terracotta');

    // DragLeave to outside
    const leaveEventToOutside = new Event('dragleave', { bubbles: true });
    Object.defineProperty(leaveEventToOutside, 'relatedTarget', { value: document.body });
    fireEvent(targetTab, leaveEventToOutside);
    expect(targetTab.className).not.toContain('border-r-terracotta');
  });

  it('synchronizes trueIndex using openBoardIds positions', () => {
    const customContextValue = {
      ...mockContextValue,
      boards: [
        { id: 'b1', title: 'Board Satu' },
        { id: 'b3', title: 'Board Tiga' }
      ],
      // b2 is in openBoardIds but not in boards; b1 is at 0, b3 is at 2 in openBoardIds
      openBoardIds: ['b1', 'b2', 'b3']
    };

    render(
      <KanbanContext.Provider value={customContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(2);

    const dataStore: Record<string, string> = {};
    const dataTransfer = {
      setData: vi.fn((key: string, val: string) => {
        dataStore[key] = val;
      }),
      getData: vi.fn((key: string) => dataStore[key] || ''),
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    // First visible tab is b1 (trueIndex 0), second visible tab is b3 (trueIndex 2)
    fireEvent.dragStart(tabs[0], { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('application/x-kanbango-tab-index', '0');

    fireEvent.dragOver(tabs[1], { dataTransfer });
    fireEvent.drop(tabs[1], { dataTransfer });

    expect(mockReorderBoardTabs).toHaveBeenCalledWith(0, 2);
  });
});
