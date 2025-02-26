import { create } from "zustand";
import { fetchHolidays } from "../helpers/holidays";

interface Holiday {
  date: string;
  name: string;
  type: "nacional" | "local";
}

interface HolidayState {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
  fetchHolidaysForYear: (year: number) => Promise<void>;
  isHoliday: (date: Date) => boolean;
  getHolidayName: (date: Date) => string | null;
}

export const useHolidayStore = create<HolidayState>((set, get) => ({
  holidays: [],
  loading: false,
  error: null,
  fetchHolidaysForYear: async (year: number) => {
    try {
      set({ loading: true, error: null });
      const holidays = await fetchHolidays(year);
      set({ holidays, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  isHoliday: (date: Date) => {
    const { holidays } = get();
    const dateString = date.toISOString().split("T")[0];
    return holidays.some((holiday) => holiday.date === dateString);
  },
  getHolidayName: (date: Date) => {
    const { holidays } = get();
    const dateString = date.toISOString().split("T")[0];
    const holiday = holidays.find((h) => h.date === dateString);
    return holiday?.name || null;
  },
}));
