import { describe, it, expect } from 'vitest';
import {
  shouldTriggerDailyBriefing,
  getTodayDateString,
  getCurrentTimeString
} from '../src/renderer/src/utils/scheduler';

describe('Notification Scheduler Utility', () => {
  describe('shouldTriggerDailyBriefing', () => {
    it('returns true when isEnabled is true, reminderTime matches currentTime, and lastBriefingDate !== todayDate', () => {
      const result = shouldTriggerDailyBriefing({
        isEnabled: true,
        reminderTime: '09:00',
        lastBriefingDate: '2026-05-14',
        todayDate: '2026-05-15',
        currentTime: '09:00'
      });
      expect(result).toBe(true);
    });

    it('returns true when lastBriefingDate is undefined and time matches', () => {
      const result = shouldTriggerDailyBriefing({
        isEnabled: true,
        reminderTime: '09:00',
        lastBriefingDate: undefined,
        todayDate: '2026-05-15',
        currentTime: '09:00'
      });
      expect(result).toBe(true);
    });

    it('returns false when lastBriefingDate === todayDate', () => {
      const result = shouldTriggerDailyBriefing({
        isEnabled: true,
        reminderTime: '09:00',
        lastBriefingDate: '2026-05-15',
        todayDate: '2026-05-15',
        currentTime: '09:00'
      });
      expect(result).toBe(false);
    });

    it('returns false when currentTime !== reminderTime', () => {
      const result = shouldTriggerDailyBriefing({
        isEnabled: true,
        reminderTime: '09:00',
        lastBriefingDate: '2026-05-14',
        todayDate: '2026-05-15',
        currentTime: '09:01'
      });
      expect(result).toBe(false);
    });

    it('returns false when isEnabled: false', () => {
      const result = shouldTriggerDailyBriefing({
        isEnabled: false,
        reminderTime: '09:00',
        lastBriefingDate: undefined,
        todayDate: '2026-05-15',
        currentTime: '09:00'
      });
      expect(result).toBe(false);
    });
  });

  describe('getTodayDateString', () => {
    it('returns date formatted as YYYY-MM-DD', () => {
      const testDate = new Date('2026-05-15T12:00:00.000Z');
      expect(getTodayDateString(testDate)).toBe('2026-05-15');
    });

    it('defaults to current date when no argument is provided', () => {
      const result = getTodayDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getCurrentTimeString', () => {
    it('returns local HH:MM formatted with 2-digit padding', () => {
      const testDate = new Date(2026, 4, 15, 9, 5);
      expect(getCurrentTimeString(testDate)).toBe('09:05');

      const testDate2 = new Date(2026, 4, 15, 14, 30);
      expect(getCurrentTimeString(testDate2)).toBe('14:30');
    });

    it('defaults to current time when no argument is provided', () => {
      const result = getCurrentTimeString();
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});
