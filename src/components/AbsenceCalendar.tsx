import React from "react";
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isWeekend,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { pt } from "date-fns/locale/pt";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface Props {
  selectedDays: Date[];
  onSelectDays: (days: Date[]) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const AbsenceCalendar = ({
  selectedDays,
  onSelectDays,
  currentMonth,
  onMonthChange,
}: Props) => {
  const { user } = useAuthStore();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const toggleDay = (date: Date) => {
    if (isWeekend(date)) return;

    const isSelected = selectedDays.some((selectedDate) =>
      isSameDay(selectedDate, date)
    );

    if (isSelected) {
      onSelectDays(selectedDays.filter((d) => !isSameDay(d, date)));
    } else {
      if (selectedDays.length === 2) {
        onSelectDays([date]);
      } else if (selectedDays.length === 1) {
        const newDays = [selectedDays[0], date].sort(
          (a, b) => a.getTime() - b.getTime()
        );
        const interval = eachDayOfInterval({
          start: newDays[0],
          end: newDays[1],
        });
        onSelectDays(interval.filter((d) => !isWeekend(d)));
      } else {
        onSelectDays([date]);
      }
    }
  };

  const isSelected = (date: Date) => {
    if (selectedDays.length === 0) return false;
    if (selectedDays.length === 1) return isSameDay(date, selectedDays[0]);

    const [start, end] = [
      selectedDays[0],
      selectedDays[selectedDays.length - 1],
    ].sort((a, b) => a.getTime() - b.getTime());

    return isWithinInterval(date, { start, end }) && !isWeekend(date);
  };

  const previousMonth = () => {
    onMonthChange(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    onMonthChange(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, "MMMM yyyy", { locale: pt })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-7 gap-px">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}

          {daysInMonth.map((date, dayIdx) => {
            const isSelected_ = isSelected(date);
            const isWeekendDay = isWeekend(date);

            return (
              <div
                key={date.toString()}
                className={`
                  relative p-2 border border-gray-200 dark:border-slate-700
                  ${
                    !isSameMonth(date, currentMonth)
                      ? "bg-gray-50 dark:bg-slate-800"
                      : "bg-white dark:bg-slate-900"
                  }
                  ${isWeekendDay ? "bg-gray-50 dark:bg-slate-800" : ""}
                  ${isSelected_ ? "bg-opacity-20 dark:bg-opacity-20" : ""}
                `}
                style={{
                  gridColumnStart: dayIdx === 0 ? date.getDay() + 1 : undefined,
                  backgroundColor: isSelected_ ? user?.color : undefined,
                }}
              >
                <button
                  onClick={() => toggleDay(date)}
                  disabled={isWeekendDay}
                  className={`
                    w-full h-full flex flex-col items-center justify-center
                    ${
                      isWeekendDay
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <span
                    className={`
                      text-sm
                      ${isWeekendDay ? "text-gray-400 dark:text-gray-500" : ""} 
                      ${
                        isSelected_
                          ? "text-gray-900 dark:text-white font-semibold"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    `}
                  >
                    {format(date, "d")}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div
              className="h-4 w-4 rounded-full mr-2"
              style={{ backgroundColor: user?.color }}
            />
            <span className="text-gray-700 dark:text-gray-300">
              Selecionado
            </span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-gray-100 dark:bg-slate-700 mr-2" />
            <span className="text-gray-700 dark:text-gray-300">
              Fim de Semana
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceCalendar;
