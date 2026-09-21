import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BrowserWindow } from 'electron';
import { createTrayMenuTemplate, setupSystemTray } from '../src/main/tray';

const { mockTrayConstructor, MockTray, mockTrayInstances, MockMenu, MockNativeImage } = vi.hoisted(() => {
  const instances: any[] = [];
  const mockTrayConstructor = vi.fn();

  class MockTray {
    public image: any;
    public tooltip: string = '';
    public contextMenu: any = null;
    public listeners: Record<string, Function> = {};

    constructor(image: any) {
      mockTrayConstructor(image);
      this.image = image;
      instances.push(this);
    }

    setToolTip = vi.fn((tooltip: string) => {
      this.tooltip = tooltip;
    });

    setContextMenu = vi.fn((menu: any) => {
      this.contextMenu = menu;
    });

    on = vi.fn((event: string, cb: Function) => {
      this.listeners[event] = cb;
      return this;
    });

    destroy = vi.fn();
  }

  const MockMenu = {
    buildFromTemplate: vi.fn((template: any) => ({
      template
    }))
  };

  const MockNativeImage = {
    createFromBuffer: vi.fn((buf: Buffer) => ({
      buffer: buf,
      isNativeImage: true
    }))
  };

  return {
    mockTrayConstructor,
    MockTray,
    mockTrayInstances: instances,
    MockMenu,
    MockNativeImage
  };
});

vi.mock('electron', () => {
  return {
    Tray: MockTray,
    Menu: MockMenu,
    nativeImage: MockNativeImage,
    BrowserWindow: vi.fn()
  };
});

describe('System Tray Module (src/main/tray.ts)', () => {
  const createMockWindow = (overrides?: Partial<BrowserWindow>): BrowserWindow => {
    return {
      isDestroyed: vi.fn().mockReturnValue(false),
      isMinimized: vi.fn().mockReturnValue(false),
      isVisible: vi.fn().mockReturnValue(false),
      restore: vi.fn(),
      show: vi.fn(),
      focus: vi.fn(),
      hide: vi.fn(),
      webContents: {
        send: vi.fn()
      },
      ...overrides
    } as unknown as BrowserWindow;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTrayInstances.length = 0;
  });

  describe('createTrayMenuTemplate', () => {
    it('creates a template containing open, trigger briefing, separator, and quit items', () => {
      const mockWin = createMockWindow();
      const onQuit = vi.fn();
      const template = createTrayMenuTemplate(mockWin, onQuit);

      expect(Array.isArray(template)).toBe(true);
      expect(template.length).toBe(4);

      const openItem = template.find(item => item.label && /Buka/i.test(item.label));
      const briefingItem = template.find(item => item.label && /Picu/i.test(item.label));
      const separatorItem = template.find(item => item.type === 'separator');
      const quitItem = template.find(item => item.label && /Keluar/i.test(item.label));

      expect(openItem).toBeDefined();
      expect(briefingItem).toBeDefined();
      expect(separatorItem).toBeDefined();
      expect(quitItem).toBeDefined();
    });

    it('handles "Buka" click when window is minimized: restores, shows, and focuses', () => {
      const mockWin = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(true)
      });
      const onQuit = vi.fn();
      const template = createTrayMenuTemplate(mockWin, onQuit);
      const openItem = template.find(item => item.label && /Buka/i.test(item.label))!;

      openItem.click!({} as any, mockWin, {} as any);

      expect(mockWin.restore).toHaveBeenCalledTimes(1);
      expect(mockWin.show).toHaveBeenCalledTimes(1);
      expect(mockWin.focus).toHaveBeenCalledTimes(1);
    });

    it('handles "Buka" click when window is not minimized: shows and focuses without restore', () => {
      const mockWin = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(false)
      });
      const onQuit = vi.fn();
      const template = createTrayMenuTemplate(mockWin, onQuit);
      const openItem = template.find(item => item.label && /Buka/i.test(item.label))!;

      openItem.click!({} as any, mockWin, {} as any);

      expect(mockWin.restore).not.toHaveBeenCalled();
      expect(mockWin.show).toHaveBeenCalledTimes(1);
      expect(mockWin.focus).toHaveBeenCalledTimes(1);
    });

    it('handles "Buka" click safely when window is destroyed or null', () => {
      const destroyedWin = createMockWindow({
        isDestroyed: vi.fn().mockReturnValue(true)
      });
      const onQuit = vi.fn();
      const templateDestroyed = createTrayMenuTemplate(destroyedWin, onQuit);
      const openItemDestroyed = templateDestroyed.find(item => item.label && /Buka/i.test(item.label))!;

      expect(() => openItemDestroyed.click!({} as any, destroyedWin, {} as any)).not.toThrow();
      expect(destroyedWin.show).not.toHaveBeenCalled();

      const templateNull = createTrayMenuTemplate(null, onQuit);
      const openItemNull = templateNull.find(item => item.label && /Buka/i.test(item.label))!;
      expect(() => openItemNull.click!({} as any, null as any, {} as any)).not.toThrow();
    });

    it('handles "Picu Hardcore Reminder" click: sends "tray:trigger-briefing" to webContents', () => {
      const mockWin = createMockWindow();
      const onQuit = vi.fn();
      const template = createTrayMenuTemplate(mockWin, onQuit);
      const briefingItem = template.find(item => item.label && /Picu/i.test(item.label))!;

      briefingItem.click!({} as any, mockWin, {} as any);

      expect(mockWin.webContents.send).toHaveBeenCalledWith('tray:trigger-briefing');
    });

    it('handles "Picu Hardcore Reminder" click safely when window is destroyed or null', () => {
      const destroyedWin = createMockWindow({
        isDestroyed: vi.fn().mockReturnValue(true)
      });
      const onQuit = vi.fn();
      const templateDestroyed = createTrayMenuTemplate(destroyedWin, onQuit);
      const briefingItem = templateDestroyed.find(item => item.label && /Picu/i.test(item.label))!;

      expect(() => briefingItem.click!({} as any, destroyedWin, {} as any)).not.toThrow();
      expect(destroyedWin.webContents.send).not.toHaveBeenCalled();

      const templateNull = createTrayMenuTemplate(null, onQuit);
      const briefingNull = templateNull.find(item => item.label && /Picu/i.test(item.label))!;
      expect(() => briefingNull.click!({} as any, null as any, {} as any)).not.toThrow();
    });

    it('handles "Keluar" click: calls onQuit callback', () => {
      const mockWin = createMockWindow();
      const onQuit = vi.fn();
      const template = createTrayMenuTemplate(mockWin, onQuit);
      const quitItem = template.find(item => item.label && /Keluar/i.test(item.label))!;

      quitItem.click!({} as any, mockWin, {} as any);

      expect(onQuit).toHaveBeenCalledTimes(1);
    });

    it('supports window getter function (() => BrowserWindow | null) dynamically', () => {
      let currentWin: BrowserWindow | null = null;
      const onQuit = vi.fn();
      const template = createTrayMenuTemplate(() => currentWin, onQuit);

      const openItem = template.find(item => item.label && /Buka/i.test(item.label))!;
      const briefingItem = template.find(item => item.label && /Picu/i.test(item.label))!;

      // When window is null: safe no-op
      expect(() => openItem.click!({} as any, null as any, {} as any)).not.toThrow();
      expect(() => briefingItem.click!({} as any, null as any, {} as any)).not.toThrow();

      // Later, window becomes available
      const mockWin = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(true)
      });
      currentWin = mockWin;

      openItem.click!({} as any, null as any, {} as any);
      expect(mockWin.restore).toHaveBeenCalledTimes(1);
      expect(mockWin.show).toHaveBeenCalledTimes(1);
      expect(mockWin.focus).toHaveBeenCalledTimes(1);

      briefingItem.click!({} as any, null as any, {} as any);
      expect(mockWin.webContents.send).toHaveBeenCalledWith('tray:trigger-briefing');
    });

    it('supports direct BrowserWindow or null reference', () => {
      const mockWin = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(true)
      });
      const onQuit = vi.fn();
      const template = createTrayMenuTemplate(mockWin, onQuit);

      const openItem = template.find(item => item.label && /Buka/i.test(item.label))!;
      const briefingItem = template.find(item => item.label && /Picu/i.test(item.label))!;

      openItem.click!({} as any, mockWin, {} as any);
      expect(mockWin.restore).toHaveBeenCalledTimes(1);
      expect(mockWin.show).toHaveBeenCalledTimes(1);
      expect(mockWin.focus).toHaveBeenCalledTimes(1);

      briefingItem.click!({} as any, mockWin, {} as any);
      expect(mockWin.webContents.send).toHaveBeenCalledWith('tray:trigger-briefing');
    });
  });

  describe('setupSystemTray', () => {
    it('sets tooltip and sets context menu from template', () => {
      let currentWin: BrowserWindow | null = createMockWindow();
      const onQuit = vi.fn();

      const tray = setupSystemTray(() => currentWin, onQuit);

      expect(MockNativeImage.createFromBuffer).toHaveBeenCalledTimes(1);
      expect(mockTrayConstructor).toHaveBeenCalledTimes(1);
      expect(tray.setToolTip).toHaveBeenCalledWith('KanbanGO! - Bohemian Mindful Organizer');
      expect(MockMenu.buildFromTemplate).toHaveBeenCalledTimes(1);
      expect(tray.setContextMenu).toHaveBeenCalledTimes(1);
      expect(tray.on).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('passes window getter to createTrayMenuTemplate so context menu actions dynamically query current window', () => {
      let currentWin: BrowserWindow | null = null;
      const onQuit = vi.fn();

      setupSystemTray(() => currentWin, onQuit);

      const template = MockMenu.buildFromTemplate.mock.calls[0][0];
      const openItem = template.find((item: any) => item.label && /Buka/i.test(item.label));

      // Initially null window -> safe no-op
      expect(() => openItem.click()).not.toThrow();

      // Later window is created
      const mockWin = createMockWindow({
        isMinimized: vi.fn().mockReturnValue(true)
      });
      currentWin = mockWin;

      openItem.click();
      expect(mockWin.restore).toHaveBeenCalledTimes(1);
      expect(mockWin.show).toHaveBeenCalledTimes(1);
      expect(mockWin.focus).toHaveBeenCalledTimes(1);
    });

    it('toggles window visibility on tray click: hides when visible and not minimized', () => {
      const mockWin = createMockWindow({
        isVisible: vi.fn().mockReturnValue(true),
        isMinimized: vi.fn().mockReturnValue(false)
      });
      const onQuit = vi.fn();

      const tray = setupSystemTray(() => mockWin, onQuit) as any;
      const clickHandler = tray.listeners['click'];
      expect(clickHandler).toBeDefined();

      clickHandler();

      expect(mockWin.hide).toHaveBeenCalledTimes(1);
      expect(mockWin.show).not.toHaveBeenCalled();
    });

    it('toggles window visibility on tray click: restores and focuses window when isVisible is true AND isMinimized is true (Windows minimized visibility trap)', () => {
      const mockWin = createMockWindow({
        isVisible: vi.fn().mockReturnValue(true),
        isMinimized: vi.fn().mockReturnValue(true)
      });
      const onQuit = vi.fn();

      const tray = setupSystemTray(() => mockWin, onQuit) as any;
      const clickHandler = tray.listeners['click'];
      expect(clickHandler).toBeDefined();

      clickHandler();

      // Crucial Windows behavior: should restore and focus, NOT hide!
      expect(mockWin.restore).toHaveBeenCalledTimes(1);
      expect(mockWin.show).toHaveBeenCalledTimes(1);
      expect(mockWin.focus).toHaveBeenCalledTimes(1);
      expect(mockWin.hide).not.toHaveBeenCalled();
    });

    it('toggles window visibility on tray click: restores, shows, focuses when not visible and minimized', () => {
      const mockWin = createMockWindow({
        isVisible: vi.fn().mockReturnValue(false),
        isMinimized: vi.fn().mockReturnValue(true)
      });
      const onQuit = vi.fn();

      const tray = setupSystemTray(() => mockWin, onQuit) as any;
      const clickHandler = tray.listeners['click'];

      clickHandler();

      expect(mockWin.restore).toHaveBeenCalledTimes(1);
      expect(mockWin.show).toHaveBeenCalledTimes(1);
      expect(mockWin.focus).toHaveBeenCalledTimes(1);
      expect(mockWin.hide).not.toHaveBeenCalled();
    });

    it('toggles window visibility on tray click: shows and focuses when not visible and not minimized', () => {
      const mockWin = createMockWindow({
        isVisible: vi.fn().mockReturnValue(false),
        isMinimized: vi.fn().mockReturnValue(false)
      });
      const onQuit = vi.fn();

      const tray = setupSystemTray(() => mockWin, onQuit) as any;
      const clickHandler = tray.listeners['click'];

      clickHandler();

      expect(mockWin.restore).not.toHaveBeenCalled();
      expect(mockWin.show).toHaveBeenCalledTimes(1);
      expect(mockWin.focus).toHaveBeenCalledTimes(1);
      expect(mockWin.hide).not.toHaveBeenCalled();
    });

    it('handles tray click safely when window is destroyed or null', () => {
      const destroyedWin = createMockWindow({
        isDestroyed: vi.fn().mockReturnValue(true)
      });
      const onQuit = vi.fn();

      const tray = setupSystemTray(() => destroyedWin, onQuit) as any;
      const clickHandler = tray.listeners['click'];

      expect(() => clickHandler()).not.toThrow();
      expect(destroyedWin.show).not.toHaveBeenCalled();
      expect(destroyedWin.hide).not.toHaveBeenCalled();

      const trayNull = setupSystemTray(() => null, onQuit) as any;
      const clickNull = trayNull.listeners['click'];
      expect(() => clickNull()).not.toThrow();
    });
  });
});
