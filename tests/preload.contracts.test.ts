import { describe, it, expect, vi } from 'vitest';
import type { ElectronAPI } from '../src/preload/index.d';

vi.mock('electron', () => {
  return {
    contextBridge: {
      exposeInMainWorld: vi.fn()
    },
    ipcRenderer: {
      invoke: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
      send: vi.fn()
    }
  };
});

describe('Preload Notification and Window API Contracts', () => {
  it('defines the expected interface for notification and window management', () => {
    const mockElectronAPI: ElectronAPI = {
      ping: vi.fn(),
      getAppVersion: vi.fn(),
      getPlatform: vi.fn(),
      showNotification: vi.fn().mockResolvedValue({ success: true }),
      restoreWindow: vi.fn().mockResolvedValue(undefined),
      onTriggerBriefingFromTray: vi.fn().mockReturnValue(() => {})
    };

    expect(typeof mockElectronAPI.showNotification).toBe('function');
    expect(typeof mockElectronAPI.restoreWindow).toBe('function');
    expect(typeof mockElectronAPI.onTriggerBriefingFromTray).toBe('function');
  });

  it('implements IPC bindings for showNotification, restoreWindow, and onTriggerBriefingFromTray', async () => {
    const { ipcRenderer } = await import('electron');
    const { electronAPI } = await import('../src/preload/index');

    // showNotification
    (ipcRenderer.invoke as any).mockResolvedValueOnce({ success: true });
    const notifyRes = await electronAPI.showNotification({ title: 'KanbanGO!', body: 'Task due' });
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('notify:send', {
      title: 'KanbanGO!',
      body: 'Task due'
    });
    expect(notifyRes).toEqual({ success: true });

    // restoreWindow
    (ipcRenderer.invoke as any).mockResolvedValueOnce(undefined);
    await electronAPI.restoreWindow();
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('app:restore');

    // onTriggerBriefingFromTray
    const mockCallback = vi.fn();
    const unsubscribe = electronAPI.onTriggerBriefingFromTray(mockCallback);
    expect(ipcRenderer.on).toHaveBeenCalledWith('tray:trigger-briefing', expect.any(Function));

    // trigger the listener
    const registeredListener = (ipcRenderer.on as any).mock.calls[0][1];
    registeredListener();
    expect(mockCallback).toHaveBeenCalled();

    // unsubscribe
    unsubscribe();
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith('tray:trigger-briefing', registeredListener);
  });
});
