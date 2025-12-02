import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getWeeksForMonth(month: Date, weekStartsOn: 0 | 1 = 1) {
  const firstDayOfMonth = startOfMonth(month);
  const lastDayOfMonth = endOfMonth(month);

  const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, { weekStartsOn });
  const lastDayOfLastWeek = endOfWeek(lastDayOfMonth, { weekStartsOn });

  const days = eachDayOfInterval({
    start: firstDayOfFirstWeek,
    end: lastDayOfLastWeek,
  });

  const weeks: Date[][] = [];
  let week: Date[] = [];

  days.forEach((day, index) => {
    week.push(day);
    if ((index + 1) % 7 === 0) {
      weeks.push(week);
      week = [];
    }
  });
  
  if (week.length > 0) {
      weeks.push(week)
  }

  return weeks;
}
