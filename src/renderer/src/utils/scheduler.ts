export interface SchedulerCheckParams {
  isEnabled: boolean;
  reminderTime: string;
  lastBriefingDate?: string;
  todayDate: string;
  currentTime: string;
}

export function shouldTriggerDailyBriefing(params: SchedulerCheckParams): boolean {
  if (!params.isEnabled) return false;
  if (params.lastBriefingDate === params.todayDate) return false;
  return params.currentTime === params.reminderTime;
}

export function getTodayDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getCurrentTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
