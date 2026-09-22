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

    const activeTab = screen.getByText('Board Satu').closest('div');
    const inactiveTab = screen.getByText('Board Dua').closest('div');

    expect(activeTab?.className).toContain('bg-white');
    expect(activeTab?.className).toContain('border-terracotta/40');
    expect(activeTab?.className).toContain('font-semibold');

    expect(inactiveTab?.className).toContain('bg-transparent');
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
    expect(mockOpenTab).not.toHaveBeenCalled();
  });

  it('triggers createBoard when clicking add tab button', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const addButton = screen.getByTitle(/Tambah Board Baru/i);
    fireEvent.click(addButton);
    expect(mockCreateBoard).toHaveBeenCalled();
  });

  it('calls onOpenCommandPalette when clicking the ⌘K command palette button', () => {
    const mockOnOpenCommandPalette = vi.fn();
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader onOpenCommandPalette={mockOnOpenCommandPalette} />
      </KanbanContext.Provider>
    );

    const cmdButton = screen.getByTitle(/Buka Command Palette/i);
    fireEvent.click(cmdButton);
    expect(mockOnOpenCommandPalette).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation on tabs with Enter and Space', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const inactiveTab = screen.getByRole('tab', { name: /Board Dua/i });
    expect(inactiveTab.getAttribute('aria-selected')).toBe('false');

    fireEvent.keyDown(inactiveTab, { key: 'Enter' });
    expect(mockOpenTab).toHaveBeenCalledWith('b2');

    fireEvent.keyDown(inactiveTab, { key: ' ' });
    expect(mockOpenTab).toHaveBeenCalledWith('b2');
  });
});
