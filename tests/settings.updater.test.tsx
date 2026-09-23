import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { SettingsModal } from '../src/renderer/src/components/modal/SettingsModal';
import { CommandPalette } from '../src/renderer/src/components/modal/CommandPalette';
import { KanbanContext } from '../src/renderer/src/context/KanbanContext';

describe('SettingsModal Updater Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders app version and Periksa Pembaruan button', () => {
    const mockCheckForUpdates = vi.fn();
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'idle',
      currentAppVersion: '1.0.0',
      checkForUpdates: mockCheckForUpdates
    };

    render(
      <KanbanContext.Provider value={contextValue}>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </KanbanContext.Provider>
    );

    expect(screen.getByText(/Versi 1.0.0/i)).toBeInTheDocument();
    const checkBtn = screen.getByRole('button', { name: /Periksa Pembaruan/i });
    fireEvent.click(checkBtn);
    expect(mockCheckForUpdates).toHaveBeenCalledWith(true);
  });

  it('displays checking status feedback when updaterStatus is checking', () => {
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'checking',
      currentAppVersion: '1.0.0',
      checkForUpdates: vi.fn()
    };

    render(
      <KanbanContext.Provider value={contextValue}>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </KanbanContext.Provider>
    );

    expect(screen.getByText(/Sedang memeriksa pembaruan/i)).toBeInTheDocument();
  });

  it('displays up-to-date message when updaterStatus is not-available', () => {
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'not-available',
      currentAppVersion: '1.0.0',
      checkForUpdates: vi.fn()
    };

    render(
      <KanbanContext.Provider value={contextValue}>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </KanbanContext.Provider>
    );

    expect(screen.getByText(/KanbanGO sudah menggunakan versi terbaru/i)).toBeInTheDocument();
  });

  it('displays error message when updaterStatus is error', () => {
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'error',
      currentAppVersion: '1.0.0',
      checkForUpdates: vi.fn()
    };

    render(
      <KanbanContext.Provider value={contextValue}>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </KanbanContext.Provider>
    );

    expect(screen.getByText(/Tidak dapat terhubung ke server pembaruan/i)).toBeInTheDocument();
  });

  it('disables check button while updaterStatus is checking', () => {
    const mockCheckForUpdates = vi.fn();
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'checking',
      currentAppVersion: '1.0.0',
      checkForUpdates: mockCheckForUpdates
    };

    render(
      <KanbanContext.Provider value={contextValue}>
        <SettingsModal isOpen={true} onClose={vi.fn()} />
      </KanbanContext.Provider>
    );

    const checkBtn = screen.getByRole('button', { name: /Periksa Pembaruan/i });
    expect(checkBtn).toBeDisabled();
    fireEvent.click(checkBtn);
    expect(mockCheckForUpdates).not.toHaveBeenCalled();
  });

  it('returns null when isOpen is false', () => {
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'idle',
      currentAppVersion: '1.0.0',
      checkForUpdates: vi.fn()
    };

    const { container } = render(
      <KanbanContext.Provider value={contextValue}>
        <SettingsModal isOpen={false} onClose={vi.fn()} />
      </KanbanContext.Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button or escape is pressed', () => {
    const mockClose = vi.fn();
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'idle',
      currentAppVersion: '1.0.0',
      checkForUpdates: vi.fn()
    };

    render(
      <KanbanContext.Provider value={contextValue}>
        <SettingsModal isOpen={true} onClose={mockClose} />
      </KanbanContext.Provider>
    );

    const closeBtn = screen.getByRole('button', { name: /Tutup/i });
    fireEvent.click(closeBtn);
    expect(mockClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockClose).toHaveBeenCalledTimes(2);
  });
});

describe('CommandPalette Check Updates Action', () => {
  it('triggers checkForUpdates(true) and closes palette when check-updates is selected', () => {
    const mockCheckForUpdates = vi.fn();
    const mockClose = vi.fn();
    const contextValue: any = {
      settings: { theme: 'bohemian-light' },
      updaterStatus: 'idle',
      currentAppVersion: '1.0.0',
      checkForUpdates: mockCheckForUpdates
    };

    render(
      <KanbanContext.Provider value={contextValue}>
        <CommandPalette
          isOpen={true}
          onClose={mockClose}
          boards={[]}
          cards={[]}
          onSelectBoard={vi.fn()}
          onSelectCard={vi.fn()}
          onQuickAction={vi.fn()}
        />
      </KanbanContext.Provider>
    );

    const updateAction = screen.getByText(/Periksa Pembaruan Versi/i);
    expect(updateAction).toBeInTheDocument();
    fireEvent.click(updateAction);

    expect(mockCheckForUpdates).toHaveBeenCalledWith(true);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
