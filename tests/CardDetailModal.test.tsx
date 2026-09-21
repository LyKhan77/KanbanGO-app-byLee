import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CardDetailModal } from '../src/renderer/src/components/modal/CardDetailModal';
import { Card, ChecklistItem } from '../src/shared/types';

describe('CardDetailModal Component', () => {
  it('renders card title in editing view and checklist container', () => {
    const mockCard: Card = {
      id: 'c1',
      boardId: 'b1',
      columnId: 'col1',
      title: 'Uji Coba Modal Detail',
      description: 'Catatan detail',
      order: 0,
      priority: 'medium',
      tags: ['Design'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const mockChecklists: ChecklistItem[] = [
      { id: 'chk1', cardId: 'c1', text: 'Subtask 1', isCompleted: true, order: 0 }
    ];

    render(
      <CardDetailModal
        card={mockCard}
        isOpen={true}
        checklists={mockChecklists}
        onClose={() => {}}
        onUpdateCard={() => {}}
        onDeleteCard={() => {}}
        onCreateChecklist={() => Promise.resolve('chk2')}
        onToggleChecklist={() => {}}
        onDeleteChecklist={() => {}}
      />
    );

    expect(screen.getByDisplayValue('Uji Coba Modal Detail')).toBeDefined();
    expect(screen.getByText(/Subtask 1/i)).toBeDefined();
    expect(screen.getByText(/Prioritas/i)).toBeDefined();
  });
});
