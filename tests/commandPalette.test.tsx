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
