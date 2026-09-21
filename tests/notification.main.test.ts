import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IpcMain, BrowserWindow } from 'electron';
import {
  setupNotificationHandlers,
  restoreAndFocusWindow,
  activeNotifications
} from '../src/main/notification';
import { Notification } from 'electron';

const { mockConstructor, MockNotification, mockNotificationInstances } = vi.hoisted(() => {
  const instances: any[] = [];
  const mockConstructor = vi.fn();
  class MockNotification {
    public options: any;
    public listeners: Record<string, Function> = {};
    public show = vi.fn();
    public on = vi.fn(function (this: any, event: string, cb: Function) {
      this.listeners[event] = cb;
      return this;
    });

    static isSupported = vi.fn().mockReturnValue(true);

    constructor(options: any) {
      mockConstructor(options);
      this.options = options;
      instances.push(this);
    }
  }

  return { mockConstructor, MockNotification, mockNotificationInstances: instances };
});

vi.mock('electron', () => {
  return {
    Notification: MockNotification,
    BrowserWindow: vi.fn()
  };
});

describe('Main Process Notification and Window Restore IPC Handlers', () => {
  let handlers: Map<string, Function>;
  let mockIpcMain: IpcMain;
  let mockWindow: BrowserWindow | null;
  const getMainWindow = () => mockWindow;

  const createMockWindow = (overrides?: Partial<BrowserWindow>): BrowserWindow => {
    return {
      isDestroyed: vi.fn().mockReturnValue(false),
      isMinimized: vi.fn().mockReturnValue(false),
      restore: vi.fn(),
      show: vi.fn(),
      focus: vi.fn(),
      ...overrides
    } as unknown as BrowserWindow;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationInstances.length = 0;
    activeNotifications.clear();
    mockConstructor.mockReset();
    MockNotification.isSupported.mockReturnValue(true);

    handlers = new Map<string, Function>();
    mockIpcMain = {
      handle: vi.fn((channel: string, handler: Function) => {
        handlers.set(channel, handler);
      })
    } as unknown as IpcMain;

    mockWindow = createMockWindow();
  });

  describe('Handler Registration', () => {
    it('registers notify:send and app:restore handlers on ipcMain', () => {
      setupNotificationHandlers(mockIpcMain, getMainWindow);

      expect(mockIpcMain.handle).toHaveBeenCalledWith('notify:send', expect.any(Function));
      expect(mockIpcMain.handle).toHaveBeenCalledWith('app:restore', expect.any(Function));
      expect(handlers.has('notify:send')).toBe(true);
      expect(handlers.has('app:restore')).toBe(true);
    });
  });

  describe('restoreAndFocusWindow helper', () => {
    it('restores, shows, and focuses window when minimized', () => {
      const win = createMockWindow({ isMinimized: vi.fn().mockReturnValue(true) });
      restoreAndFocusWindow(win);

      expect(win.restore).toHaveBeenCalledTimes(1);
      expect(win.show).toHaveBeenCalledTimes(1);
      expect(win.focus).toHaveBeenCalledTimes(1);
    });

    it('shows and focuses without restore when not minimized', () => {
      const win = createMockWindow({ isMinimized: vi.fn().mockReturnValue(false) });
      restoreAndFocusWindow(win);

      expect(win.restore).not.toHaveBeenCalled();
      expect(win.show).toHaveBeenCalledTimes(1);
      expect(win.focus).toHaveBeenCalledTimes(1);
    });

    it('handles null or destroyed window gracefully', () => {
      const destroyedWin = createMockWindow({ isDestroyed: vi.fn().mockReturnValue(true) });
      expect(() => restoreAndFocusWindow(destroyedWin)).not.toThrow();
      expect(destroyedWin.restore).not.toHaveBeenCalled();
      expect(destroyedWin.show).not.toHaveBeenCalled();

      expect(() => restoreAndFocusWindow(null)).not.toThrow();
    });
  });

  describe('notify:send handler', () => {
    it('creates and displays a notification when supported and retains in activeNotifications', async () => {
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      const result = await handler({}, { title: 'Test Title', body: 'Test Body' });

      expect(result).toEqual({ success: true });
      expect(mockNotificationInstances.length).toBe(1);
      const instance = mockNotificationInstances[0];
      expect(instance.options).toEqual({
        title: 'Test Title',
        body: 'Test Body',
        silent: false
      });
      expect(instance.show).toHaveBeenCalledTimes(1);
      expect(instance.on).toHaveBeenCalledWith('click', expect.any(Function));
      expect(instance.on).toHaveBeenCalledWith('close', expect.any(Function));

      // Notification is protected from GC in activeNotifications set
      expect(activeNotifications.has(instance as any)).toBe(true);
    });

    it('cleans up notification from activeNotifications on click', async () => {
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      await handler({}, { title: 'Test', body: 'Body' });
      const instance = mockNotificationInstances[0];
      expect(activeNotifications.has(instance as any)).toBe(true);

      const clickListener = instance.listeners['click'];
      expect(clickListener).toBeDefined();
      clickListener();

      expect(activeNotifications.has(instance as any)).toBe(false);
      expect(mockWindow?.show).toHaveBeenCalledTimes(1);
    });

    it('cleans up notification from activeNotifications on close', async () => {
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      await handler({}, { title: 'Test', body: 'Body' });
      const instance = mockNotificationInstances[0];
      expect(activeNotifications.has(instance as any)).toBe(true);

      const closeListener = instance.listeners['close'];
      expect(closeListener).toBeDefined();
      closeListener();

      expect(activeNotifications.has(instance as any)).toBe(false);
    });

    it('falls back to default title and empty body when empty strings provided', async () => {
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      const result = await handler({}, { title: '', body: '' });

      expect(result).toEqual({ success: true });
      const instance = mockNotificationInstances[0];
      expect(instance.options).toEqual({
        title: 'KanbanGO!',
        body: '',
        silent: false
      });
    });

    it('safely handles missing or undefined payload', async () => {
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      const result = await handler({});

      expect(result).toEqual({ success: true });
      const instance = mockNotificationInstances[0];
      expect(instance.options).toEqual({
        title: 'KanbanGO!',
        body: '',
        silent: false
      });
    });

    it('returns unsupported reason if Notification.isSupported() returns false', async () => {
      MockNotification.isSupported.mockReturnValue(false);
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      const result = await handler({}, { title: 'Test Title', body: 'Test Body' });

      expect(result).toEqual({ success: false, reason: 'unsupported' });
      expect(mockNotificationInstances.length).toBe(0);
      expect(activeNotifications.size).toBe(0);
    });

    it('restores, shows, and focuses window when notification is clicked and window is minimized', async () => {
      mockWindow = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(true)
      });
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      await handler({}, { title: 'Test', body: 'Body' });
      const instance = mockNotificationInstances[0];
      const clickListener = instance.listeners['click'];

      clickListener();

      expect(mockWindow.restore).toHaveBeenCalledTimes(1);
      expect(mockWindow.show).toHaveBeenCalledTimes(1);
      expect(mockWindow.focus).toHaveBeenCalledTimes(1);
    });

    it('shows and focuses window without restoring if not minimized on click', async () => {
      mockWindow = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(false)
      });
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      await handler({}, { title: 'Test', body: 'Body' });
      const instance = mockNotificationInstances[0];
      const clickListener = instance.listeners['click'];

      clickListener();

      expect(mockWindow.restore).not.toHaveBeenCalled();
      expect(mockWindow.show).toHaveBeenCalledTimes(1);
      expect(mockWindow.focus).toHaveBeenCalledTimes(1);
    });

    it('handles click gracefully if window is null or destroyed', async () => {
      mockWindow = createMockWindow({
        isDestroyed: vi.fn().mockReturnValue(true)
      });
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      await handler({}, { title: 'Test', body: 'Body' });
      const instance = mockNotificationInstances[0];
      const clickListener = instance.listeners['click'];

      expect(() => clickListener()).not.toThrow();
      expect(mockWindow.restore).not.toHaveBeenCalled();
      expect(mockWindow.show).not.toHaveBeenCalled();

      // Also when null
      mockWindow = null;
      expect(() => clickListener()).not.toThrow();
    });

    it('returns error result if Notification constructor throws', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockConstructor.mockImplementationOnce(() => {
        throw new Error('OS Notification Error');
      });

      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('notify:send')!;

      const result = await handler({}, { title: 'Crash', body: 'Fail' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('OS Notification Error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('app:restore handler', () => {
    it('restores, shows, and focuses window when minimized', async () => {
      mockWindow = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(true)
      });
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('app:restore')!;

      await handler();

      expect(mockWindow.restore).toHaveBeenCalledTimes(1);
      expect(mockWindow.show).toHaveBeenCalledTimes(1);
      expect(mockWindow.focus).toHaveBeenCalledTimes(1);
    });

    it('shows and focuses window without restore when not minimized', async () => {
      mockWindow = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(false)
      });
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('app:restore')!;

      await handler();

      expect(mockWindow.restore).not.toHaveBeenCalled();
      expect(mockWindow.show).toHaveBeenCalledTimes(1);
      expect(mockWindow.focus).toHaveBeenCalledTimes(1);
    });

    it('does nothing if window is null or destroyed', async () => {
      mockWindow = createMockWindow({
        isDestroyed: vi.fn().mockReturnValue(true)
      });
      setupNotificationHandlers(mockIpcMain, getMainWindow);
      const handler = handlers.get('app:restore')!;

      await expect(handler()).resolves.toBeUndefined();
      expect(mockWindow.restore).not.toHaveBeenCalled();
      expect(mockWindow.show).not.toHaveBeenCalled();

      mockWindow = null;
      await expect(handler()).resolves.toBeUndefined();
    });
  });
});
