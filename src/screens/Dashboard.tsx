import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Users } from "lucide-react";
import { useVacationStore } from "../store/vacationStore";
import VacationCalendar from "../components/VacationCalendar";
import { VacationPeriod } from "../types";

function Dashboard() {
  const { vacations, fetchVacations } = useVacationStore();
  const [currentVacations, setCurrentVacations] = useState<VacationPeriod[]>(
    []
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  useEffect(() => {
    const now = new Date();
    const current = vacations.filter((vacation) => {
      const start = new Date(vacation.startDate || "");
      const end = new Date(vacation.endDate || "");
      return now >= start && now <= end;
    });
    setCurrentVacations(current);
  }, [vacations]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-background overflow-hidden shadow-md rounded-lg border-muted border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Total de Membros
                  </dt>
                  <dd className="text-3xl font-semibold text-foreground">
                    {new Set(vacations.map((v) => v.userId)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background overflow-hidden shadow-md rounded-lg border border-muted">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Atualmente de Férias
                  </dt>
                  <dd className="text-3xl font-semibold text-foreground">
                    {currentVacations.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <VacationCalendar
          vacations={vacations}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>

      <div className="mt-8">
        <div className="bg-background shadow-md rounded-lg border border-muted">
          <div className="px-4 py-5 border-b sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-foreground">
              Ausências Atuais
            </h3>
          </div>
          <ul className="divide-y divide">
            {currentVacations.map((vacation) => (
              <li key={vacation.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {vacation.userName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(vacation.startDate || ""), "PP", {
                        locale: pt,
                      })}
                      -
                      {format(new Date(vacation.endDate || ""), "PP", {
                        locale: pt,
                      })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            {currentVacations.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-muted-foreground text-center">
                Ninguém está ausente atualmente
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
