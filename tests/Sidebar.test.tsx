import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('calls onOpenSettings when clicking the settings button in expanded mode', () => {
    const mockOpenSettings = vi.fn();
    const mockContextVal: any = {
      boards: [],
      activeBoardId: null,
      profile: { id: 'p1', name: 'Lee Dev', roleTitle: 'Builder', avatarId: 'fox' },
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: () => {},
      setActiveBoardId: () => {},
      createBoard: () => {},
      openProfileModal: () => {}
    };

    render(
      <KanbanContext.Provider value={mockContextVal}>
        <Sidebar onOpenSettings={mockOpenSettings} />
      </KanbanContext.Provider>
    );

    const settingsBtn = screen.getByRole('button', { name: /Pengaturan Aplikasi/i });
    fireEvent.click(settingsBtn);

    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenSettings when clicking the settings button in collapsed mode', () => {
    const mockOpenSettings = vi.fn();
    const mockContextVal: any = {
      boards: [],
      activeBoardId: null,
      profile: { id: 'p1', name: 'Lee Dev', roleTitle: 'Builder', avatarId: 'fox' },
      isSidebarCollapsed: true,
      setIsSidebarCollapsed: () => {},
      setActiveBoardId: () => {},
      createBoard: () => {},
      openProfileModal: () => {}
    };

    render(
      <KanbanContext.Provider value={mockContextVal}>
        <Sidebar onOpenSettings={mockOpenSettings} />
      </KanbanContext.Provider>
    );

    const settingsBtn = screen.getByRole('button', { name: /Pengaturan Aplikasi/i });
    fireEvent.click(settingsBtn);

    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
  });
});
