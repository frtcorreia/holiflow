import React, { useState } from "react";
import { X } from "lucide-react";
import { useVacationStore } from "../store/vacationStore";
import { useAuthStore } from "../store/authStore";
import {
  format,
  addDays,
  startOfYear,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { pt } from "date-fns/locale/pt";
import toast from "react-hot-toast";
import { AbsenceType } from "../types";

interface Props {
  onClose: () => void;
}

const VacationForm = ({ onClose }: Props) => {
  const { user } = useAuthStore();
  const { addVacation, loading } = useVacationStore();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);

  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = new Date(currentYear, 11, 31);

  const allDaysOfYear = eachDayOfInterval({ start: yearStart, end: yearEnd });
  const months = Array.from(
    { length: 12 },
    (_, i) => new Date(currentYear, i, 1)
  );

  const getDaysInMonth = (month: Date) => {
    return allDaysOfYear.filter((day) => day.getMonth() === month.getMonth());
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isSelected = (date: Date) => {
    return selectedDays.some((selectedDate) => isSameDay(selectedDate, date));
  };

  const toggleDay = (date: Date) => {
    if (isWeekend(date)) return;

    setSelectedDays((prev) => {
      if (isSelected(date)) {
        return prev.filter((d) => !isSameDay(d, date));
      } else {
        return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0) {
      toast.error("Por favor, selecione os dias de férias");
      return;
    }

    // Agrupar dias consecutivos em períodos
    const periods: { start: Date; end: Date }[] = [];
    let currentPeriod: { start: Date; end: Date } | null = null;

    selectedDays.forEach((day, index) => {
      const nextDay = selectedDays[index + 1];

      if (!currentPeriod) {
        currentPeriod = { start: day, end: day };
      } else if (nextDay && addDays(day, 1).getTime() === nextDay.getTime()) {
        currentPeriod.end = nextDay;
      } else {
        periods.push(currentPeriod);
        currentPeriod = null;
      }
    });

    if (currentPeriod) {
      periods.push(currentPeriod);
    }

    try {
      // Criar um pedido de férias para cada período
      for (const period of periods) {
        await addVacation({
          userId: user?.id,
          userName: user?.email?.split("@")[0],
          startDate: period.start.toISOString(),
          endDate: period.end.toISOString(),
          type: AbsenceType.vacation,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success("Pedidos de férias submetidos");
      onClose();
    } catch (error) {
      toast.error("Falha ao submeter pedidos de férias");
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div className="bg-background rounded-lg shadow-xl max-w-7xl w-full m-4">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">
              Selecionar Dias de Férias
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {months.map((month) => (
              <div key={month.getTime()} className="border rounded-lg p-2">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  {format(month, "MMMM", { locale: pt })}
                </h4>
                <div className="grid grid-cols-7 gap-1">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                    <div
                      key={i}
                      className="text-xs text-center font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                  {getDaysInMonth(month).map((date, index) => {
                    const dayOfWeek = date.getDay();
                    const offset = index === 0 ? dayOfWeek : 0;

                    return (
                      <React.Fragment key={date.getTime()}>
                        {index === 0 && offset > 0 && (
                          <div style={{ gridColumn: `span ${offset}` }} />
                        )}
                        <button
                          type="button"
                          onClick={() => toggleDay(date)}
                          disabled={isWeekend(date)}
                          className={`
                            text-xs p-1 rounded-full
                            ${
                              isWeekend(date)
                                ? "text-muted-foreground cursor-not-allowed"
                                : isSelected(date)
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "text-foreground hover:bg-accent/10"
                            }
                          `}
                        >
                          {format(date, "d")}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Dias selecionados: {selectedDays.length}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || selectedDays.length === 0}
                className="px-4 py-2 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                Submeter Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationForm;
