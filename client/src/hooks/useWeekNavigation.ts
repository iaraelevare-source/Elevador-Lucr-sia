import { useMemo } from "react";

/**
 * Hook for managing week navigation
 * @param selectedDate - Currently selected date (ISO string format)
 * @returns Week days and navigation utilities
 */
export function useWeekNavigation(selectedDate: string) {
  const weekDays = useMemo(() => {
    const getWeekDays = (date: Date) => {
      const week = [];
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      for (let i = 0; i < 7; i++) {
        week.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return week;
    };

    return getWeekDays(new Date(selectedDate));
  }, [selectedDate]);

  return {
    weekDays,
  };
}
