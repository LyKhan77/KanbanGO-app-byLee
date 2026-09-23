import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupAutoUpdater, createMockUpdater } from '../src/main/updater';

describe('Main Process AutoUpdater Module', () => {
  let mockIpcMain: any;
  let mockWindow: any;
  let handlers: Record<string, Function>;

  beforeEach(() => {
    handlers = {};
    mockIpcMain = {
      handle: vi.fn((channel: string, handler: Function) => {
        handlers[channel] = handler;
      }),
      on: vi.fn((channel: string, handler: Function) => {
        handlers[channel] = handler;
      })
    };
    mockWindow = {
      webContents: {
        send: vi.fn()
      }
    };
  });

  it('registers IPC handlers for updater:check, startDownload, quitAndInstall, and getAppVersion', () => {
    const mockUpdater = createMockUpdater();
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    expect(mockIpcMain.handle).toHaveBeenCalledWith('updater:check', expect.any(Function));
    expect(mockIpcMain.handle).toHaveBeenCalledWith('updater:startDownload', expect.any(Function));
    expect(mockIpcMain.handle).toHaveBeenCalledWith('updater:quitAndInstall', expect.any(Function));
    expect(mockIpcMain.handle).toHaveBeenCalledWith('updater:getAppVersion', expect.any(Function));
  });

  it('emits updater:status with available when update is found', async () => {
    const mockUpdater = createMockUpdater();
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    mockUpdater.emit('update-available', {
      version: '1.2.0',
      releaseDate: '2026-09-23',
      releaseNotes: 'Fitur baru'
    });

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('updater:status', 'available', {
      version: '1.2.0',
      releaseDate: '2026-09-23',
      releaseNotes: 'Fitur baru'
    });
  });

  it('emits updater:progress during download', () => {
    const mockUpdater = createMockUpdater();
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    mockUpdater.emit('download-progress', {
      percent: 50,
      bytesPerSecond: 1000,
      transferred: 5000,
      total: 10000
    });

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('updater:progress', {
      percent: 50,
      bytesPerSecond: 1000,
      transferred: 5000,
      total: 10000
    });
  });

  it('handles updater:startDownload and updater:quitAndInstall calls', async () => {
    const mockUpdater = createMockUpdater();
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    await handlers['updater:startDownload']();
    expect(mockUpdater.downloadUpdate).toHaveBeenCalled();

    await handlers['updater:quitAndInstall']();
    expect(mockUpdater.quitAndInstall).toHaveBeenCalled();
  });

  it('emits checking, not-available, downloaded, and error statuses', () => {
    const mockUpdater = createMockUpdater();
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    mockUpdater.emit('checking-for-update');
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('updater:status', 'checking');

    mockUpdater.emit('update-not-available', { version: '1.0.0' });
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('updater:status', 'not-available', {
      version: '1.0.0'
    });

    mockUpdater.emit('update-downloaded', { version: '1.2.0' });
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('updater:status', 'downloaded', {
      version: '1.2.0'
    });

    mockUpdater.emit('error', new Error('Network error'));
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('updater:status', 'error', expect.any(Error));
  });

  it('handles updater:check and updater:getAppVersion calls with error safety', async () => {
    const mockUpdater = createMockUpdater();
    mockUpdater.checkForUpdates = vi.fn().mockResolvedValue({ updateInfo: { version: '1.2.0' } });
    setupAutoUpdater(mockIpcMain, () => mockWindow, mockUpdater);

    const checkResult = await handlers['updater:check']();
    expect(checkResult).toEqual({ updateInfo: { version: '1.2.0' } });

    // Test error handling in updater:check
    mockUpdater.checkForUpdates = vi.fn().mockRejectedValue(new Error('Update server offline'));
    const errorResult = await handlers['updater:check']();
    expect(errorResult).toEqual({ error: 'Update server offline' });

    // Test updater:getAppVersion
    const version = await handlers['updater:getAppVersion']();
    expect(typeof version).toBe('string');
  });

  it('safely ignores window events if window is null or destroyed', () => {
    const mockUpdater = createMockUpdater();
    const destroyedWindow = {
      isDestroyed: vi.fn().mockReturnValue(true),
      webContents: {
        send: vi.fn()
      }
    };
    setupAutoUpdater(mockIpcMain, () => destroyedWindow, mockUpdater);

    mockUpdater.emit('checking-for-update');
    expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
  });
});
