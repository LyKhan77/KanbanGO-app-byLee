import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { KanbanProvider, useKanban } from '../src/renderer/src/context/KanbanContext';
import { db } from '../src/renderer/src/db';

describe('KanbanContext Updater State', () => {
  beforeEach(async () => {
    await db.boards.clear();
    await db.settings.clear();
    delete (window as any).electronAPI;
  });

  it('initializes with idle updaterStatus and closed modal', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(KanbanProvider, null, children);
    const { result } = renderHook(() => useKanban(), { wrapper });

    expect(result.current.updaterStatus).toBe('idle');
    expect(result.current.isUpdateModalOpen).toBe(false);
  });

  it('persists ignoredUpdateVersion in userSettings when ignoreUpdateVersion is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(KanbanProvider, null, children);
    const { result } = renderHook(() => useKanban(), { wrapper });

    await act(async () => {
      await result.current.ignoreUpdateVersion('1.1.0');
    });

    expect(result.current.settings.ignoredUpdateVersion).toBe('1.1.0');
    expect(result.current.isUpdateModalOpen).toBe(false);
  });

  it('allows opening and closing the update modal', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(KanbanProvider, null, children);
    const { result } = renderHook(() => useKanban(), { wrapper });

    act(() => {
      result.current.openUpdateModal();
    });
    expect(result.current.isUpdateModalOpen).toBe(true);

    act(() => {
      result.current.closeUpdateModal();
    });
    expect(result.current.isUpdateModalOpen).toBe(false);
  });

  it('calls electronAPI updater check on checkForUpdates', async () => {
    const checkMock = vi.fn().mockResolvedValue({ success: true });
    window.electronAPI = {
      updater: {
        check: checkMock,
        startDownload: vi.fn(),
        quitAndInstall: vi.fn(),
        getCurrentVersion: vi.fn().mockResolvedValue('1.0.0'),
        onStatus: vi.fn().mockReturnValue(() => {}),
        onProgress: vi.fn().mockReturnValue(() => {})
      }
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(KanbanProvider, null, children);
    const { result } = renderHook(() => useKanban(), { wrapper });

    await act(async () => {
      await result.current.checkForUpdates(true);
    });

    expect(checkMock).toHaveBeenCalledWith(true);
  });

  it('handles startAppUpdate and installAppUpdate calls', async () => {
    const downloadMock = vi.fn().mockResolvedValue({ success: true });
    const installMock = vi.fn().mockResolvedValue({ success: true });
    window.electronAPI = {
      updater: {
        check: vi.fn(),
        startDownload: downloadMock,
        quitAndInstall: installMock,
        getCurrentVersion: vi.fn().mockResolvedValue('1.0.0'),
        onStatus: vi.fn().mockReturnValue(() => {}),
        onProgress: vi.fn().mockReturnValue(() => {})
      }
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(KanbanProvider, null, children);
    const { result } = renderHook(() => useKanban(), { wrapper });

    await act(async () => {
      await result.current.startAppUpdate();
    });
    expect(downloadMock).toHaveBeenCalled();
    expect(result.current.updaterStatus).toBe('downloading');

    await act(async () => {
      await result.current.installAppUpdate();
    });
    expect(installMock).toHaveBeenCalled();
  });

  it('handles status events and ignores modal when version is in ignoredUpdateVersion', async () => {
    let statusCallback: any;
    let progressCallback: any;
    window.electronAPI = {
      updater: {
        check: vi.fn().mockResolvedValue({}),
        startDownload: vi.fn(),
        quitAndInstall: vi.fn(),
        getCurrentVersion: vi.fn().mockResolvedValue('1.0.2'),
        onStatus: vi.fn((cb) => {
          statusCallback = cb;
          return () => {};
        }),
        onProgress: vi.fn((cb) => {
          progressCallback = cb;
          return () => {};
        })
      }
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(KanbanProvider, null, children);
    const { result } = renderHook(() => useKanban(), { wrapper });

    // Simulate update available when not ignored
    act(() => {
      statusCallback?.('available', { version: '1.2.0', releaseDate: '2026-09-23' });
    });
    expect(result.current.updaterStatus).toBe('available');
    expect(result.current.updateInfo?.version).toBe('1.2.0');
    expect(result.current.isUpdateModalOpen).toBe(true);

    // Now ignore this version
    await act(async () => {
      await result.current.ignoreUpdateVersion('1.2.0');
    });
    expect(result.current.isUpdateModalOpen).toBe(false);

    // Simulate same version available again in background - modal should remain closed
    act(() => {
      statusCallback?.('available', { version: '1.2.0' });
    });
    expect(result.current.isUpdateModalOpen).toBe(false);

    // When manual check is performed, modal SHOULD open even for the ignored version
    await act(async () => {
      await result.current.checkForUpdates(true);
    });
    act(() => {
      statusCallback?.('available', { version: '1.2.0' });
    });
    expect(result.current.isUpdateModalOpen).toBe(true);

    // Close modal
    act(() => {
      result.current.closeUpdateModal();
    });
    expect(result.current.isUpdateModalOpen).toBe(false);

    // Simulate new version available - modal should open
    act(() => {
      statusCallback?.('available', { version: '1.3.0' });
    });
    expect(result.current.isUpdateModalOpen).toBe(true);
    expect(result.current.updateInfo?.version).toBe('1.3.0');

    // Simulate download progress
    act(() => {
      progressCallback?.({ percent: 75, transferred: 750, total: 1000, bytesPerSecond: 100 });
    });
    expect(result.current.updateProgress?.percent).toBe(75);

    // Simulate downloaded status
    act(() => {
      statusCallback?.('downloaded');
    });
    expect(result.current.updaterStatus).toBe('downloaded');
    expect(result.current.isUpdateModalOpen).toBe(true);

    // Simulate error status
    act(() => {
      statusCallback?.('error', { message: 'Network timeout' });
    });
    expect(result.current.updaterStatus).toBe('error');
    expect(result.current.updateErrorMessage).toBe('Network timeout');
  });
});
