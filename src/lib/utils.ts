import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getDaysInMonth, startOfMonth, startOfWeek, addDays, getWeek } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeeksForMonth(month: number, year: number, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn });
  const endDate = lastDayOfMonth;

  const weeks = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    weeks.push(week);
     if (currentDate.getMonth() !== month && currentDate > endDate) {
      break;
    }
  }
  return weeks;
}
