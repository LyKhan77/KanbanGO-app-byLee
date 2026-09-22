import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { CommandPalette } from '../src/renderer/src/components/modal/CommandPalette';
import { App } from '../src/renderer/src/App';
import { db } from '../src/renderer/src/db/db';
import { seedInitialData } from '../src/renderer/src/db/seed';

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
    { id: 'c1', boardId: 'b1', title: 'Finish Quarterly Report', description: '', tags: ['Work'] },
    { id: 'c2', boardId: 'b2', title: 'Buy Coffee Beans', description: '', tags: ['Life'] }
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

  it('navigates with keyboard arrow down and enters to select second board', () => {
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
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSelectBoard).toHaveBeenCalledWith('b2');
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('wraps around to the last item on ArrowUp when at the first item', () => {
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
    // At index 0, ArrowUp wraps to last item (which is action-profile)
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockQuickAction).toHaveBeenCalledWith('profile');
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('selects a card on click and on Enter key press', () => {
    const { rerender } = render(
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

    // 1. Click on card item
    const cardEl = screen.getByText('Finish Quarterly Report');
    fireEvent.click(cardEl);
    expect(mockSelectCard).toHaveBeenCalledWith(mockCards[0]);
    expect(mockClose).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();

    // 2. Select card via search and Enter
    rerender(
      <CommandPalette
        isOpen={true}
        onClose={mockClose}
        boards={[]}
        cards={mockCards as any}
        onSelectBoard={mockSelectBoard}
        onSelectCard={mockSelectCard}
        onQuickAction={mockQuickAction}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik nama board/i);
    fireEvent.change(input, { target: { value: 'Buy Coffee' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSelectCard).toHaveBeenCalledWith(mockCards[1]);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('filters and displays cards when searching by tag', () => {
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
    fireEvent.change(input, { target: { value: 'Work' } });

    expect(screen.getByText('Finish Quarterly Report')).toBeDefined();
    expect(screen.queryByText('Buy Coffee Beans')).toBeNull();
  });

  it('displays empty results state when no items match the query', () => {
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
    fireEvent.change(input, { target: { value: 'NonExistentQueryXYZ' } });

    expect(screen.getByText(/Tidak ada hasil untuk "NonExistentQueryXYZ"/i)).toBeDefined();
  });

  it('scrolls active item into view when selectedIndex changes', () => {
    const scrollMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollMock;

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
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(scrollMock).toHaveBeenCalledWith({ block: 'nearest' });
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

  it('executes quick action when selecting an action item', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={mockClose}
        boards={[]}
        cards={[]}
        onSelectBoard={mockSelectBoard}
        onSelectCard={mockSelectCard}
        onQuickAction={mockQuickAction}
      />
    );

    const input = screen.getByPlaceholderText(/Ketik nama board/i);
    fireEvent.change(input, { target: { value: 'Profil' } });

    const profileAction = screen.getByText(/Buka Profil/i);
    fireEvent.click(profileAction);

    expect(mockQuickAction).toHaveBeenCalledWith('profile');
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});

describe('Global shortcut listener in App', () => {
  beforeEach(async () => {
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.checklists.clear();
    await db.settings.clear();
    await seedInitialData(db);
  });

  it('opens and closes Command Palette with Ctrl+k, Ctrl+K, Ctrl+p, and Ctrl+P', async () => {
    render(<App />);

    // Initially Command Palette is not visible
    expect(screen.queryByPlaceholderText(/Ketik nama board/i)).toBeNull();

    // 1. Ctrl + k (lowercase)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByPlaceholderText(/Ketik nama board/i)).toBeDefined();

    // Toggle closed with Ctrl + k
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.queryByPlaceholderText(/Ketik nama board/i)).toBeNull();

    // 2. Ctrl + K (uppercase)
    fireEvent.keyDown(window, { key: 'K', ctrlKey: true });
    expect(screen.getByPlaceholderText(/Ketik nama board/i)).toBeDefined();

    // Toggle closed with Ctrl + K
    fireEvent.keyDown(window, { key: 'K', ctrlKey: true });
    expect(screen.queryByPlaceholderText(/Ketik nama board/i)).toBeNull();

    // 3. Ctrl + p (lowercase)
    fireEvent.keyDown(window, { key: 'p', ctrlKey: true });
    expect(screen.getByPlaceholderText(/Ketik nama board/i)).toBeDefined();

    // Toggle closed with Ctrl + p
    fireEvent.keyDown(window, { key: 'p', ctrlKey: true });
    expect(screen.queryByPlaceholderText(/Ketik nama board/i)).toBeNull();

    // 4. Ctrl + P (uppercase)
    fireEvent.keyDown(window, { key: 'P', ctrlKey: true });
    expect(screen.getByPlaceholderText(/Ketik nama board/i)).toBeDefined();

    // Toggle closed with Ctrl + P
    fireEvent.keyDown(window, { key: 'P', ctrlKey: true });
    expect(screen.queryByPlaceholderText(/Ketik nama board/i)).toBeNull();

    // 5. Meta / Cmd + k (Mac command)
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByPlaceholderText(/Ketik nama board/i)).toBeDefined();
  });
});
