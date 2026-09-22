import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('applies blended white background with tint when coverColor is set', () => {
    const { container } = render(
      <CardItem card={mockCard} index={0} onClick={vi.fn()} />
    );

    const cardElement = container.firstElementChild as HTMLElement;
    expect(cardElement.className).toContain('overflow-hidden');
    expect(cardElement.getAttribute('style')).toContain('linear-gradient(rgba(200, 109, 81, 0.05), rgba(200, 109, 81, 0.05))');
    expect(cardElement.getAttribute('style')).toMatch(/rgb\(255,\s*255,\s*255\)|#ffffff/);
  });

  it('does not render accent bar or background tint when coverColor is none', () => {
    const plainCard: Card = { ...mockCard, coverColor: 'none' };
    const { container } = render(
      <CardItem card={plainCard} index={0} onClick={vi.fn()} />
    );

    const accentBar = container.querySelector('[data-testid="card-cover-bar"]');
    expect(accentBar).toBeNull();
    const cardElement = container.firstElementChild as HTMLElement;
    expect(cardElement.style.background).toBe('');
  });

  it('does not render accent bar or background tint when coverColor is undefined', () => {
    const plainCard: Card = { ...mockCard, coverColor: undefined };
    const { container } = render(
      <CardItem card={plainCard} index={0} onClick={vi.fn()} />
    );

    const accentBar = container.querySelector('[data-testid="card-cover-bar"]');
    expect(accentBar).toBeNull();
    const cardElement = container.firstElementChild as HTMLElement;
    expect(cardElement.style.background).toBe('');
  });
});

describe('CardDetailModal with Cover Picker and Markdown Preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('renders fallback message in preview tab when description is whitespace-only', () => {
    const whitespaceCard: Card = { ...mockCard, description: '   \n\t  ' };
    render(
      <CardDetailModal
        card={whitespaceCard}
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

    expect(screen.getByText('Tidak ada deskripsi.')).toBeDefined();
  });

  it('preserves edited title and description when clicking a color chip', () => {
    const { rerender } = render(
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

    const titleInput = screen.getByPlaceholderText(/Judul kartu tugas.../i) as HTMLInputElement;
    const descTextarea = screen.getByPlaceholderText(/Tuliskan catatan detail/i) as HTMLTextAreaElement;

    fireEvent.change(titleInput, { target: { value: 'Draft Judul Baru' } });
    fireEvent.change(descTextarea, { target: { value: 'Draft Deskripsi Baru' } });

    const terracottaChip = screen.getByTitle(/Terracotta/i);
    fireEvent.click(terracottaChip);

    // Simulate parent re-rendering with updated coverColor on the card prop
    rerender(
      <CardDetailModal
        card={{ ...mockCard, coverColor: 'terracotta' }}
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

    expect(titleInput.value).toBe('Draft Judul Baru');
    expect(descTextarea.value).toBe('Draft Deskripsi Baru');
  });

  it('saves title and description on blur', () => {
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

    const titleInput = screen.getByPlaceholderText(/Judul kartu tugas.../i);
    fireEvent.change(titleInput, { target: { value: 'Judul Baru Disimpan' } });
    fireEvent.blur(titleInput);
    expect(mockUpdateCard).toHaveBeenCalledWith('c1', { title: 'Judul Baru Disimpan' });

    const descTextarea = screen.getByPlaceholderText(/Tuliskan catatan detail/i);
    fireEvent.change(descTextarea, { target: { value: 'Deskripsi Baru Disimpan' } });
    fireEvent.blur(descTextarea);
    expect(mockUpdateCard).toHaveBeenCalledWith('c1', { description: 'Deskripsi Baru Disimpan' });
  });

  it('flushes pending changes when closing modal', () => {
    const mockClose = vi.fn();
    render(
      <CardDetailModal
        card={mockCard}
        isOpen={true}
        checklists={[]}
        onClose={mockClose}
        onUpdateCard={mockUpdateCard}
        onDeleteCard={vi.fn()}
        onCreateChecklist={vi.fn()}
        onToggleChecklist={vi.fn()}
        onDeleteChecklist={vi.fn()}
      />
    );

    const titleInput = screen.getByPlaceholderText(/Judul kartu tugas.../i);
    fireEvent.change(titleInput, { target: { value: 'Pending Title on Close' } });

    const closeButton = screen.getByRole('button', { name: /Tutup/i });
    fireEvent.click(closeButton);

    expect(mockUpdateCard).toHaveBeenCalledWith('c1', expect.objectContaining({ title: 'Pending Title on Close' }));
    expect(mockClose).toHaveBeenCalled();
  });
});
