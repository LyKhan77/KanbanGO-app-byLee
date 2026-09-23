import { describe, it, expect, vi } from 'vitest';
import { createUpdaterBridge } from '../src/preload/updaterBridge';

describe('Preload Updater Bridge', () => {
  it('exposes check, startDownload, quitAndInstall, getCurrentVersion, and listener registration', async () => {
    const mockIpcRenderer = {
      invoke: vi.fn().mockResolvedValue({ success: true }),
      on: vi.fn(),
      removeListener: vi.fn()
    };

    const bridge = createUpdaterBridge(mockIpcRenderer as any);

    await bridge.check(true);
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('updater:check', true);

    await bridge.startDownload();
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('updater:startDownload');

    await bridge.quitAndInstall();
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('updater:quitAndInstall');

    mockIpcRenderer.invoke.mockResolvedValueOnce('1.0.0');
    const version = await bridge.getCurrentVersion();
    expect(version).toBe('1.0.0');
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('updater:getAppVersion');

    const statusCb = vi.fn();
    const unsubStatus = bridge.onStatus(statusCb);
    expect(mockIpcRenderer.on).toHaveBeenCalledWith('updater:status', expect.any(Function));
    unsubStatus();
    expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith('updater:status', expect.any(Function));

    const progressCb = vi.fn();
    const unsubProgress = bridge.onProgress(progressCb);
    expect(mockIpcRenderer.on).toHaveBeenCalledWith('updater:progress', expect.any(Function));
    unsubProgress();
    expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith('updater:progress', expect.any(Function));
  });
});
