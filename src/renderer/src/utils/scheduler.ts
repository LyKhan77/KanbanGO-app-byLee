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
  return params.currentTime >= params.reminderTime;
}

export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
