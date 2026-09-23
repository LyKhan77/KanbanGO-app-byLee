import { describe, it, expect } from 'vitest';
import { UserSettings, UpdateInfo, UpdateProgress, UpdaterStatus } from '../src/shared/types';

describe('Updater Types and Settings', () => {
  it('allows ignoredUpdateVersion in UserSettings', () => {
    const settings: UserSettings = {
      defaultColumnId: 'col-1',
      enableNotifications: true,
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      theme: 'bohemian-light',
      activeViewMode: 'kanban',
      ignoredUpdateVersion: '1.2.0'
    };
    expect(settings.ignoredUpdateVersion).toBe('1.2.0');
  });

  it('validates UpdateInfo structure', () => {
    const info: UpdateInfo = {
      version: '1.1.0',
      releaseDate: '2026-09-23',
      releaseNotes: '### Perbaikan bug\n- Peningkatan performa kalender'
    };
    expect(info.version).toBe('1.1.0');
    expect(info.releaseNotes).toContain('Perbaikan bug');
  });

  it('validates UpdateProgress calculation', () => {
    const progress: UpdateProgress = {
      percent: 45.5,
      bytesPerSecond: 1048576,
      transferred: 47185920,
      total: 104857600
    };
    expect(progress.percent).toBeCloseTo(45.5);
  });
});
