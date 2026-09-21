import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Sidebar } from '../src/renderer/src/components/layout/Sidebar';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('Sidebar Component', () => {
  it('renders active boards and user persona profile', () => {
    const mockContextVal: any = {
      boards: [
        { id: 'b1', title: 'Studio Project', isArchived: false, createdAt: 1, updatedAt: 1 }
      ],
      activeBoardId: 'b1',
      profile: { id: 'p1', name: 'Lee Dev', roleTitle: 'Builder', avatarId: 'fox' },
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: () => {},
      setActiveBoardId: () => {},
      createBoard: () => {},
      openProfileModal: () => {}
    };

    render(
      <KanbanContext.Provider value={mockContextVal}>
        <Sidebar />
      </KanbanContext.Provider>
    );

    expect(screen.getByText('Studio Project')).toBeDefined();
    expect(screen.getByText('Lee Dev')).toBeDefined();
    expect(screen.getByText('Builder')).toBeDefined();
  });
});
