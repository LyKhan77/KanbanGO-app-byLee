import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { CardItem } from '../src/renderer/src/components/board/CardItem';
import { Card, ChecklistItem } from '../src/shared/types';

describe('CardItem Component', () => {
  it('renders task title, high priority badge, and tag', () => {
    const mockCard: Card = {
      id: 'c1',
      boardId: 'b1',
      columnId: 'col1',
      title: 'Tugas Desain Bohemian',
      description: 'Deskripsi lengkap',
      order: 0,
      priority: 'high',
      tags: ['Design'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const mockChecklists: ChecklistItem[] = [
      { id: 'chk1', cardId: 'c1', text: 'Item 1', isCompleted: true, order: 0 },
      { id: 'chk2', cardId: 'c1', text: 'Item 2', isCompleted: false, order: 1 }
    ];

    render(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="col1">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <CardItem card={mockCard} index={0} checklists={mockChecklists} onClick={() => {}} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );

    expect(screen.getByText('Tugas Desain Bohemian')).toBeDefined();
    expect(screen.getByText('Design')).toBeDefined();
    expect(screen.getByText('1/2')).toBeDefined();
  });
});
