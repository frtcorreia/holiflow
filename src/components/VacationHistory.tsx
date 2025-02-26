import React from "react";
import { getStatusColor, getStatusText } from "../helpers/vacations";
import { VacationPeriod } from "../types";

interface VacationHistoryProps {
  vacations: VacationPeriod[];
}

const VacationHistory = ({ vacations }: VacationHistoryProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Histórico de Férias
      </h2>
      <div className="grid gap-4">
        {vacations.map((vacation, i) => (
          <div
            key={i}
            className="bg-background p-4 rounded-lg shadow-md border"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-foreground">
                  {vacation.userName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(vacation.startDate || "").toLocaleDateString()} até
                  {new Date(vacation.endDate || "").toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-sm rounded-full ${getStatusColor(
                  vacation.status
                )}`}
              >
                {getStatusText(vacation.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VacationHistory;
