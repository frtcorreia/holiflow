import React, { useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVacationStore } from "../store/vacationStore";
import { format, eachDayOfInterval, isWeekend } from "date-fns";
import { pt } from "date-fns/locale/pt";
import { AbsenceType, VacationsStatus } from "../types";

import { getStatusColor, getStatusText } from "../helpers/vacations";

const MyAbsences = () => {
  const navigate = useNavigate();
  const { vacations, deleteVacation, fetchVacations } = useVacationStore();

  useEffect(() => {
    fetchVacations();
  }, []);

  const getUsedVacationDays = () => {
    const currentYear = new Date().getFullYear();
    return vacations
      .filter((vacation) => {
        const vacationYear = new Date(vacation.startDate || "").getFullYear();
        return vacationYear === currentYear && vacation.type === "ferias";
      })
      .reduce((total, vacation) => {
        const start = new Date(vacation.startDate || "");
        const end = new Date(vacation.endDate || "");
        const days = eachDayOfInterval({ start, end });
        const workingDays = days.filter((day) => !isWeekend(day));
        return total + workingDays.length;
      }, 0);
  };

  const getLocalHolidaysCount = () => {
    const currentYear = new Date().getFullYear();
    return vacations.filter((vacation) => {
      const vacationYear = new Date(vacation.startDate || "").getFullYear();
      return vacationYear === currentYear && vacation.type === "feriado_local";
    }).length;
  };

  const handleDelete = async (id?: string) => {
    if (window.confirm("Tem certeza que deseja excluir este período?")) {
      await deleteVacation(id);
    }
  };

  const getAbsenceTypeLabel = (type?: string) => {
    switch (type) {
      case AbsenceType.vacation:
        return "Férias";
      case AbsenceType.holiday:
        return "Feriado Local";
      case AbsenceType.leave:
        return "Licença";
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Minhas Ausências
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Visualize e gerencie suas ausências
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => navigate("/absences/new")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Ausência
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white dark:bg-slate-900 shadow dark:shadow-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Dias de Férias
            </h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {getUsedVacationDays()}/22
              </p>
              <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                dias úteis usados
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Restam {22 - getUsedVacationDays()} dias para marcar
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 shadow dark:shadow-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Feriado Local
            </h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {getLocalHolidaysCount()}/1
              </p>
              <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                dia usado
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {getLocalHolidaysCount() === 0
                ? "Disponível para marcar"
                : "Limite atingido"}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-slate-900 shadow dark:shadow-slate-900/50 rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Histórico de Ausências
            </h3>
            <div className="mt-4 divide-y divide-gray-200 dark:divide-slate-700">
              {vacations?.map((vacation) => (
                <div key={vacation.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getAbsenceTypeLabel(vacation.type)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(vacation.startDate || ""), "PP", {
                          locale: pt,
                        })}
                        -
                        {format(new Date(vacation.endDate || ""), "PP", {
                          locale: pt,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${getStatusColor(
                          vacation.status
                        )}`}
                      >
                        {getStatusText(vacation.status)}
                      </span>
                      <button
                        onClick={() => handleDelete(vacation.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {vacation.status === VacationsStatus.rejected &&
                          "Apagar"}

                        {vacation.status === VacationsStatus.approved &&
                          "Cancelar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {vacations.length === 0 && (
                <p className="py-4 text-gray-500 dark:text-gray-400 text-center">
                  Nenhuma ausência registrada
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAbsences;
