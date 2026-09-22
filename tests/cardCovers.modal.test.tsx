import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardItem } from '../src/renderer/src/components/board/CardItem';
import { CardDetailModal } from '../src/renderer/src/components/modal/CardDetailModal';
import { Card } from '../src/shared/types';

vi.mock('@hello-pangea/dnd', () => ({
  Draggable: ({ children }: any) =>
    children(
      {
        draggableProps: { style: {} },
        dragHandleProps: {},
        innerRef: null
      },
      { isDragging: false }
    )
}));

describe('CardItem with Bohemian Cover', () => {
  const mockCard: Card = {
    id: 'c1',
    boardId: 'b1',
    columnId: 'col1',
    title: 'Desain Palet Warna',
    description: 'Deskripsi task',
    order: 0,
    priority: 'medium',
    tags: ['design'],
    coverColor: 'terracotta',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  it('renders top color accent bar when coverColor is set', () => {
    const { container } = render(
      <CardItem card={mockCard} index={0} onClick={vi.fn()} />
    );

    const accentBar = container.querySelector('[data-testid="card-cover-bar"]');
    expect(accentBar).not.toBeNull();
    expect(accentBar?.getAttribute('style')).toContain('background-color: rgb(200, 109, 81)');
  });

  it('does not render accent bar when coverColor is none or undefined', () => {
    const plainCard: Card = { ...mockCard, coverColor: 'none' };
    const { container } = render(
      <CardItem card={plainCard} index={0} onClick={vi.fn()} />
    );

    const accentBar = container.querySelector('[data-testid="card-cover-bar"]');
    expect(accentBar).toBeNull();
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
    priority: 'none',
    tags: ['design'],
    coverColor: 'none',
    createdAt: Date.now(),
    updatedAt: Date.now()
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
    expect(terracottaChip).toBeDefined();
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

    const strongEl = screen.getByText('tebal');
    expect(strongEl.tagName).toBe('STRONG');

    const emEl = screen.getByText('miring');
    expect(emEl.tagName).toBe('EM');
  });
});
