export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const WEEKDAYS_SHORT_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function formatYearMonthIndo(year: number, monthIndex: number): string {
  return `${MONTH_NAMES_ID[monthIndex]} ${year}`;
}

export function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthGridDays(year: number, monthIndex: number): CalendarDay[] {
  const todayIso = formatDateToIso(new Date());

  // First day of target month
  const firstDay = new Date(year, monthIndex, 1);
  // Monday is index 0 in Indonesian calendar (Sunday=0 in JS -> Sunday=6, Mon=0)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Last day of target month
  const lastDay = new Date(year, monthIndex + 1, 0);
  const totalDaysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];

  // Padding days from previous month
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const date = new Date(year, monthIndex - 1, d);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateString === todayIso
    });
  }

  // Days in current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const date = new Date(year, monthIndex, d);
    const dateString = formatDateToIso(date);
    days.push({
      date,
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayIso
    });
  }

  // Padding days from next month to complete standard 7-day rows
  const remainingCells = 7 - (days.length % 7);
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const date = new Date(year, monthIndex + 1, d);
      const dateString = formatDateToIso(date);
      days.push({
        date,
        dateString,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateString === todayIso
      });
    }
  }

  // Ensure at least 5 rows (35 cells) for months like Feb with 28 days starting on Monday
  if (days.length < 35) {
    const lastAdded = days[days.length - 1].isCurrentMonth ? 0 : days[days.length - 1].dayNumber;
    for (let d = 1; d <= 7; d++) {
      const dayNum = lastAdded + d;
      const date = new Date(year, monthIndex + 1, dayNum);
      const dateString = formatDateToIso(date);
      days.push({
        date,
        dateString,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateString === todayIso
      });
    }
  }

  return days;
}
