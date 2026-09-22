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
      effectAllowed: 'move',
      dropEffect: 'move'
    };

    fireEvent.dragStart(sourceTab, { dataTransfer });
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

  it('updates visual indicator classes on dragOver and dragLeave', () => {
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
    expect(targetTab.className).toContain('border-l-terracotta');

    fireEvent.dragLeave(targetTab);
    expect(targetTab.className).not.toContain('border-l-terracotta');
  });
});
