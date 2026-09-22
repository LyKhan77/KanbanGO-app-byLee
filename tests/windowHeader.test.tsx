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

    const brandGroup = screen.getByText('KanbanGO!').closest('div');
    expect(brandGroup?.classList.contains('app-no-drag')).toBe(false);
  });

  it('triggers minimize, maximize, and close window calls via electronAPI', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const minimizeBtn = screen.getByRole('button', { name: 'Minimize' });
    const maximizeBtn = screen.getByRole('button', { name: 'Maximize' });
    const closeBtn = screen.getByRole('button', { name: 'Close' });

    expect(minimizeBtn.getAttribute('type')).toBe('button');
    expect(maximizeBtn.getAttribute('type')).toBe('button');
    expect(closeBtn.getAttribute('type')).toBe('button');

    fireEvent.click(minimizeBtn);
    expect(mockElectronAPI.minimizeWindow).toHaveBeenCalledTimes(1);

    fireEvent.click(maximizeBtn);
    expect(mockElectronAPI.maximizeWindow).toHaveBeenCalledTimes(1);

    fireEvent.click(closeBtn);
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

  it('does not trigger maximize when double-clicking inside an app-no-drag element', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const closeBtn = screen.getByTitle('Close');
    fireEvent.doubleClick(closeBtn);
    expect(mockElectronAPI.maximizeWindow).not.toHaveBeenCalled();
  });

  it('allows double-clicking brand title to maximize since brand container is draggable', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const brandTitle = screen.getByText('KanbanGO!');
    fireEvent.doubleClick(brandTitle);
    expect(mockElectronAPI.maximizeWindow).toHaveBeenCalledTimes(1);
  });

  it('keeps tabs container draggable while isolating app-no-drag to tab items and add button', () => {
    render(
      <KanbanContext.Provider value={mockContextValue}>
        <WindowHeader />
      </KanbanContext.Provider>
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist.classList.contains('app-no-drag')).toBe(false);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
    tabs.forEach((tab) => {
      expect(tab.classList.contains('app-no-drag')).toBe(true);
    });

    const addBtn = screen.getByTitle('Tambah Board Baru');
    expect(addBtn.classList.contains('app-no-drag')).toBe(true);

    // Double clicking empty space on the tablist triggers maximize
    fireEvent.doubleClick(tablist);
    expect(mockElectronAPI.maximizeWindow).toHaveBeenCalledTimes(1);

    // Double clicking an individual tab does NOT trigger maximize
    mockElectronAPI.maximizeWindow.mockClear();
    fireEvent.doubleClick(tabs[0]);
    expect(mockElectronAPI.maximizeWindow).not.toHaveBeenCalled();
  });
});
