import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowHeader } from '../src/renderer/src/components/layout/WindowHeader';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('WindowHeader Dragging and Window Controls', () => {
  const mockElectronAPI = {
    minimizeWindow: vi.fn(),
    maximizeWindow: vi.fn(),
    closeWindow: vi.fn()
  };

  const mockContextValue = {
    activeBoard: { id: 'b1', title: 'Board Utama' },
    openBoardIds: ['b1'],
    boards: [{ id: 'b1', title: 'Board Utama' }],
    openBoardTab: vi.fn(),
    closeBoardTab: vi.fn(),
    createBoard: vi.fn()
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).electronAPI = mockElectronAPI;
  });

  it('has app-drag on the header element and app-no-drag on interactive controls', () => {
    const { container } = render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const header = container.querySelector('header');
    expect(header).toBeDefined();
    expect(header?.classList.contains('app-drag')).toBe(true);

    const controlGroup = screen.getByTitle('Close').parentElement;
    expect(controlGroup?.classList.contains('app-no-drag')).toBe(true);
  });

  it('triggers minimize, maximize, and close window calls via electronAPI', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    fireEvent.click(screen.getByTitle('Minimize'));
    expect(mockElectronAPI.minimizeWindow).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Maximize'));
    expect(mockElectronAPI.maximizeWindow).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Close'));
    expect(mockElectronAPI.closeWindow).toHaveBeenCalledTimes(1);
  });

  it('toggles maximize on header double-click', () => {
    const { container } = render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const header = container.querySelector('header');
    fireEvent.doubleClick(header!);
    expect(mockElectronAPI.maximizeWindow).toHaveBeenCalledTimes(1);
  });
});
