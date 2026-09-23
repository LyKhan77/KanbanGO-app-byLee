import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { db } from '../src/renderer/src/db/db';
import { seedInitialData } from '../src/renderer/src/db/seed';
import { App } from '../src/renderer/src/App';
import { UpdaterStatus, UpdateInfo, UpdateProgress } from '../src/shared/types';

describe('Auto-Updater End-to-End User Journeys', () => {
  let statusCallback: ((status: UpdaterStatus, info?: UpdateInfo, error?: string) => void) | null = null;
  let progressCallback: ((progress: UpdateProgress) => void) | null = null;
  let mockCheck: ReturnType<typeof vi.fn>;
  let mockStartDownload: ReturnType<typeof vi.fn>;
  let mockQuitAndInstall: ReturnType<typeof vi.fn>;
  let mockGetCurrentVersion: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    await db.boards.clear();
    await db.columns.clear();
    await db.cards.clear();
    await db.checklists.clear();
    await db.settings.clear();
    await seedInitialData(db);

    mockCheck = vi.fn().mockImplementation(async (manual?: boolean) => {
      return { success: true };
    });
    mockStartDownload = vi.fn().mockResolvedValue({ success: true });
    mockQuitAndInstall = vi.fn().mockResolvedValue({ success: true });
    mockGetCurrentVersion = vi.fn().mockResolvedValue('1.0.0');

    (window as any).electronAPI = {
      ...(window as any).electronAPI,
      updater: {
        check: mockCheck,
        startDownload: mockStartDownload,
        quitAndInstall: mockQuitAndInstall,
        getCurrentVersion: mockGetCurrentVersion,
        onStatus: vi.fn((cb) => {
          statusCallback = cb;
          return () => {
            statusCallback = null;
          };
        }),
        onProgress: vi.fn((cb) => {
          progressCallback = cb;
          return () => {
            progressCallback = null;
          };
        })
      }
    };
  });

  afterEach(() => {
    delete (window as any).electronAPI?.updater;
    statusCallback = null;
    progressCallback = null;
  });

  it('Journey 1 & 2: Detects update on startup, displays Bohemian UpdateModal, and respects "Nanti Saja"', async () => {
    render(<App />);

    // Wait for App to mount and load initial board & settings from Dexie
    await screen.findByText('Welcome to KanbanGO!');
    await waitFor(() => {
      expect(statusCallback).not.toBeNull();
    });

    const updatePayload: UpdateInfo = {
      version: '1.2.0',
      files: [],
      path: 'kanbango-1.2.0.exe',
      sha512: 'fake-hash',
      releaseDate: '2026-09-23T12:00:00Z',
      releaseNotes: '### Fitur Baru\n- Dukungan dark mode bohemian\n- Peningkatan performa'
    };

    // Simulate main process notifying update is available
    await act(async () => {
      statusCallback?.('available', updatePayload);
    });

    // UpdateModal should be open
    const modalHeading = await screen.findByText('Pembaruan Versi Tersedia');
    expect(modalHeading).toBeDefined();
    expect(screen.getByText('v1.2.0')).toBeDefined();
    expect(screen.getByText(/Fitur Baru/i)).toBeDefined();

    // Verify the 3 Bohemian action choices
    const laterBtn = screen.getByRole('button', { name: /Nanti Saja/i });
    const ignoreBtn = screen.getByRole('button', { name: /Abaikan Versi Ini/i });
    const updateNowBtn = screen.getByRole('button', { name: /Perbarui Sekarang/i });
    expect(laterBtn).toBeDefined();
    expect(ignoreBtn).toBeDefined();
    expect(updateNowBtn).toBeDefined();

    // Click "Nanti Saja" to postpone
    await act(async () => {
      fireEvent.click(laterBtn);
    });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Pembaruan Versi Tersedia')).toBeNull();
    });

    // Version should NOT be ignored in user settings
    const settings = await db.settings.get('default');
    expect(settings?.ignoredUpdateVersion).toBeUndefined();
  });

  it('Journey 3: "Abaikan Versi Ini" saves ignored version to Dexie and suppresses background popups', async () => {
    render(<App />);

    await screen.findByText('Welcome to KanbanGO!');
    await waitFor(() => {
      expect(statusCallback).not.toBeNull();
    });

    const updatePayload: UpdateInfo = {
      version: '1.2.0',
      files: [],
      path: 'kanbango-1.2.0.exe',
      sha512: 'fake-hash',
      releaseDate: '2026-09-23T12:00:00Z',
      releaseNotes: 'Catatan rilis v1.2.0'
    };

    // Simulate update detected
    await act(async () => {
      statusCallback?.('available', updatePayload);
    });

    const ignoreBtn = await screen.findByRole('button', { name: /Abaikan Versi Ini/i });

    // Click "Abaikan Versi Ini"
    await act(async () => {
      fireEvent.click(ignoreBtn);
    });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Pembaruan Versi Tersedia')).toBeNull();
    });

    // Verify Dexie settings persisted ignoredUpdateVersion
    const settings = await db.settings.get('default');
    expect(settings?.ignoredUpdateVersion).toBe('1.2.0');

    // Subsequent background check should be suppressed
    await act(async () => {
      statusCallback?.('available', updatePayload);
    });

    expect(screen.queryByText('Pembaruan Versi Tersedia')).toBeNull();
  });

  it('Journey 4: Manual check from SettingsModal overrides ignored version and opens UpdateModal', async () => {
    // Pre-seed ignored version 1.2.0 in Dexie
    await db.settings.update('default', {
      ignoredUpdateVersion: '1.2.0'
    });

    render(<App />);

    await screen.findByText('Welcome to KanbanGO!');
    await waitFor(() => {
      expect(statusCallback).not.toBeNull();
    });

    // Open Settings Modal via the Sidebar settings button
    const settingsBtn = screen.getByRole('button', { name: /Pengaturan Aplikasi/i });
    fireEvent.click(settingsBtn);

    // Settings Modal should appear
    expect(await screen.findByRole('dialog', { name: 'Pengaturan Aplikasi' })).toBeDefined();

    // Click "Periksa Pembaruan" button
    const checkUpdatesBtn = screen.getByRole('button', { name: /Periksa Pembaruan/i });
    await act(async () => {
      fireEvent.click(checkUpdatesBtn);
    });

    expect(mockCheck).toHaveBeenCalledWith(true);

    const updatePayload: UpdateInfo = {
      version: '1.2.0',
      files: [],
      path: 'kanbango-1.2.0.exe',
      sha512: 'fake-hash',
      releaseDate: '2026-09-23T12:00:00Z',
      releaseNotes: 'Fitur rilis v1.2.0'
    };

    // Even though 1.2.0 is ignored, manual check triggers modal
    await act(async () => {
      statusCallback?.('available', updatePayload);
    });

    await waitFor(() => {
      expect(screen.getByText('Pembaruan Versi Tersedia')).toBeDefined();
    });
  });

  it('Journey 5: Manual check can be triggered from Bohemian Command Palette', async () => {
    render(<App />);

    await screen.findByText('Welcome to KanbanGO!');

    // Open Command Palette via keyboard shortcut
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    const searchInput = await screen.findByPlaceholderText(/Ketik nama board, kartu/i);
    expect(searchInput).toBeDefined();

    // Search for updater action
    fireEvent.change(searchInput, { target: { value: 'Pembaruan' } });

    const updateAction = await screen.findByText('Periksa Pembaruan Versi');
    fireEvent.click(updateAction);

    expect(mockCheck).toHaveBeenCalledWith(true);
  });

  it('Journey 6: Download progress and "Pasang & Muat Ulang Sekarang" lifecycle', async () => {
    render(<App />);

    await screen.findByText('Welcome to KanbanGO!');
    await waitFor(() => {
      expect(statusCallback).not.toBeNull();
      expect(progressCallback).not.toBeNull();
    });

    const updatePayload: UpdateInfo = {
      version: '1.3.0',
      files: [],
      path: 'kanbango-1.3.0.exe',
      sha512: 'fake-hash',
      releaseDate: '2026-09-23T12:00:00Z',
      releaseNotes: 'Pembaruan stabilitas'
    };

    // 1. Emit available
    await act(async () => {
      statusCallback?.('available', updatePayload);
    });

    const updateNowBtn = await screen.findByRole('button', { name: /Perbarui Sekarang/i });

    // 2. Start download
    await act(async () => {
      fireEvent.click(updateNowBtn);
    });

    expect(mockStartDownload).toHaveBeenCalled();

    // 3. Emit downloading status & progress
    await act(async () => {
      statusCallback?.('downloading', updatePayload);
      progressCallback?.({
        percent: 62.4,
        bytesPerSecond: 1048576, // 1 MB/s
        transferred: 6543210,
        total: 10485760
      });
    });

    // Check downloading UI state
    expect(await screen.findByText('Mengunduh pembaruan...')).toBeDefined();
    expect(screen.getByText(/62.4%/)).toBeDefined();

    // 4. Emit downloaded status
    await act(async () => {
      statusCallback?.('downloaded', updatePayload);
    });

    expect(await screen.findByText('Pembaruan Siap Dipasang!')).toBeDefined();

    // 5. Install & Relaunch
    const installBtn = screen.getByRole('button', { name: /Mulai Ulang & Pasang/i });
    await act(async () => {
      fireEvent.click(installBtn);
    });

    expect(mockQuitAndInstall).toHaveBeenCalled();
  });
});
