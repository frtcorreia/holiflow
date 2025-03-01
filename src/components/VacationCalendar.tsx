import React from "react";
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isWeekend,
  isSameDay,
} from "date-fns";
import { pt } from "date-fns/locale/pt";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { VacationPeriod } from "../types";

interface Props {
  vacations: VacationPeriod[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const VacationCalendar = ({
  vacations,
  currentMonth,
  onMonthChange,
}: Props) => {
  const { user } = useAuthStore();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getVacationsForDay = (date: Date) => {
    if (isWeekend(date)) return [];

    return vacations.filter((vacation) => {
      const start = new Date(vacation.startDate || "");
      const end = new Date(vacation.endDate || "");
      return date >= start && date <= end;
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
    return "?";
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
    <div className="bg-background dark:bg-foreground/[0.05] rounded-lg shadow-lg border">
      <div className="flex items-center justify-between p-6 border-b border  ">
        <h2 className="text-xl font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy", { locale: pt })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-px">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {daysInMonth.map((date, dayIdx) => {
            const dayVacations = getVacationsForDay(date);
            const isWeekendDay = isWeekend(date);
            const isToday = isSameDay(date, new Date());
            const isCurrentMonth = isSameMonth(date, currentMonth);

            return (
              <div
                key={date.toString()}
                className={`
                  min-h-[120px] p-2 border
                  ${!isCurrentMonth ? "bg-muted" : "bg-background"}
                  ${isWeekendDay ? "bg-muted" : ""}
                  ${isToday ? "ring-2 ring-primary" : ""}
                `}
                style={{
                  gridColumnStart: dayIdx === 0 ? date.getDay() + 1 : undefined,
                }}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`
                      text-sm font-medium px-2 py-1 rounded-full
                      ${
                        isWeekendDay
                          ? "text-muted-foreground"
                          : isToday
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      }
                    `}
                  >
                    {format(date, "d")}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {dayVacations.map((vacation) => (
                    <div
                      key={vacation.id}
                      className="group relative"
                      title={vacation.userName}
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md"
                        style={{ backgroundColor: user?.color || "#3B82F6" }}
                      >
                        {getInitials(
                          user?.firstName || "",
                          user?.lastName || ""
                        )}
                      </div>

                      <div className="absolute z-10 invisible group-hover:visible bg-popover text-popover-foreground text-xs rounded-md py-1.5 px-3 left-1/2 transform -translate-x-1/2 -translate-y-full -mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                        <div className="relative">
                          {vacation.userName}
                          <div className="absolute w-2 h-2 bg-popover transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-4 border-t border border-muted">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-primary mr-2" />
            <span className="text-foreground">Hoje</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-muted mr-2" />
            <span className="text-foreground">Fim de Semana</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-primary/20 mr-2" />
            <span className="text-foreground">Com Ausências</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationCalendar;
