import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useVacationStore } from "../store/vacationStore";
import { eachDayOfInterval, isWeekend } from "date-fns";
import { AbsenceType } from "../types";
import AbsenceCalendar from "../components/AbsenceCalendar";
import toast from "react-hot-toast";

const NewAbsence = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { vacations, addVacation } = useVacationStore();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [absenceType, setAbsenceType] = useState<AbsenceType>(
    AbsenceType.vacation
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getUsedVacationDays = () => {
    const currentYear = new Date().getFullYear();
    return vacations
      .filter((vacation) => {
        const vacationYear = new Date(vacation.startDate || "").getFullYear();
        return (
          vacationYear === currentYear && vacation.type === AbsenceType.vacation
        );
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
      return (
        vacationYear === currentYear && vacation.type === AbsenceType.holiday
      );
    }).length;
  };

  const validateDaysSelection = () => {
    const workingDays = selectedDays.filter((day) => !isWeekend(day));

    if (absenceType === AbsenceType.vacation) {
      const currentUsed = getUsedVacationDays();
      const totalDays = currentUsed + workingDays.length;

      if (totalDays > 22) {
        toast.error("Você só pode ter 22 dias úteis de férias por ano");
        return false;
      }
    } else if (absenceType === AbsenceType.holiday) {
      const currentCount = getLocalHolidaysCount();

      if (workingDays.length > 1) {
        toast.error("Feriados locais devem ser de apenas 1 dia");
        return false;
      }

      if (currentCount >= 1) {
        toast.error("Você só pode ter 1 feriado local por ano");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0 || !user) {
      toast.error("Selecione pelo menos um dia");
      return;
    }

    if (!validateDaysSelection()) {
      return;
    }

    const sortedDays = [...selectedDays].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const startDate = sortedDays[0];
    const endDate = sortedDays[sortedDays.length - 1];

    try {
      await addVacation({
        userId: user.id,
        userName: user?.firstName
          ? `${user?.firstName} ${user?.lastName}`
          : user?.email?.split("@")[0],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: absenceType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success("Ausência registrada com sucesso");
      navigate("/absences");
    } catch (error) {
      toast.error("Erro ao registrar ausência");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <button
          onClick={() => navigate("/absences")}
          className="mb-4 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-slate-900/50 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Nova Ausência
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tipo de Ausência
            </label>
            <select
              value={absenceType}
              onChange={(e) => {
                setAbsenceType(e.target.value as AbsenceType);
                setSelectedDays([]);
              }}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400"
            >
              <option value={AbsenceType.vacation}>
                Férias ({22 - getUsedVacationDays()} dias restantes)
              </option>
              <option value={AbsenceType.holiday}>
                Feriado Local (
                {getLocalHolidaysCount() === 0
                  ? "1 disponível"
                  : "limite atingido"}
                )
              </option>
              <option value="licenca">Licença</option>
            </select>
          </div>

          <AbsenceCalendar
            selectedDays={selectedDays}
            onSelectDays={setSelectedDays}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => navigate("/absences")}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedDays.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAbsence;
