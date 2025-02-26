import React, { useState, useEffect } from "react";
import {
  format,
  eachDayOfInterval,
  isAfter,
  isBefore,
  isWeekend,
} from "date-fns";
import { pt } from "date-fns/locale/pt";
import { Calendar, Trash2, Edit, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useVacationStore } from "../store/vacationStore";
import { VacationPeriod, AbsenceType } from "../types";
import AbsenceCalendar from "../components/AbsenceCalendar";
import toast from "react-hot-toast";

const AbsenceManagement = () => {
  const { user } = useAuthStore();
  const {
    addVacation,
    updateVacation,
    deleteVacation,
    subscribeToUserVacations,
  } = useVacationStore();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [absenceType, setAbsenceType] = useState<AbsenceType | undefined>(
    AbsenceType.vacation
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [userVacations, setUserVacations] = useState<VacationPeriod[]>([]);
  const [editingVacation, setEditingVacation] = useState<VacationPeriod | null>(
    null
  );

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = subscribeToUserVacations(user?.id, (vacations) => {
        const sortedVacations = [...vacations].sort((a, b) => {
          const dateA = new Date(a.startDate || "");
          const dateB = new Date(b.startDate || "");
          const today = new Date();

          if (isBefore(dateA, today) && isBefore(dateB, today)) {
            return isAfter(dateA, dateB) ? -1 : 1;
          }
          if (isAfter(dateA, today) && isAfter(dateB, today)) {
            return isBefore(dateA, dateB) ? -1 : 1;
          }
          if (isBefore(dateA, today) && isAfter(dateB, today)) {
            return 1;
          }
          if (isAfter(dateA, today) && isBefore(dateB, today)) {
            return -1;
          }
          return 0;
        });
        setUserVacations(sortedVacations);
      });
      return () => unsubscribe();
    }
  }, [user?.id, subscribeToUserVacations]);

  const getUsedVacationDays = () => {
    const currentYear = new Date().getFullYear();
    return userVacations
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
        // Contar apenas dias úteis (excluindo fins de semana e feriados)
        const workingDays = days.filter((day) => !isWeekend(day));
        return total + workingDays.length;
      }, 0);
  };

  const getLocalHolidaysCount = () => {
    const currentYear = new Date().getFullYear();
    return userVacations.filter((vacation) => {
      const vacationYear = new Date(vacation.startDate || "").getFullYear();
      return (
        vacationYear === currentYear && vacation.type === AbsenceType.holiday
      );
    }).length;
  };

  const validateDaysSelection = () => {
    const workingDays = selectedDays.filter((day) => !isWeekend(day));

    if (absenceType === "ferias") {
      const currentUsed = getUsedVacationDays();
      const totalDays = editingVacation
        ? currentUsed - workingDays.length + selectedDays.length
        : currentUsed + workingDays.length;

      if (totalDays > 22) {
        toast.error("Você só pode ter 22 dias úteis de férias por ano");
        return false;
      }
    } else if (absenceType === "feriado_local") {
      const currentCount = getLocalHolidaysCount();
      const totalCount = editingVacation ? currentCount : currentCount + 1;

      if (workingDays.length > 1) {
        toast.error("Feriados locais devem ser de apenas 1 dia");
        return false;
      }

      if (totalCount > 1) {
        toast.error("Você só pode ter 1 feriado local por ano");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0 || !user) return;

    if (!validateDaysSelection()) {
      return;
    }

    const sortedDays = [...selectedDays].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const startDate = sortedDays[0];
    const endDate = sortedDays[sortedDays.length - 1];

    const vacationData = {
      userId: user.id,
      userName: user.firstName
        ? `${user.firstName} ${user.lastName}`
        : user?.email?.split("@")[0],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type: absenceType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingVacation) {
        await updateVacation(editingVacation?.id, vacationData);
        toast.success("Ausência atualizada com sucesso");
      } else {
        await addVacation(vacationData);
        toast.success("Ausência registrada com sucesso");
      }

      setSelectedDays([]);
      setEditingVacation(null);
      setShowCalendar(false);
    } catch (error) {
      toast.error("Erro ao salvar ausência");
    }
  };

  const handleEdit = (vacation: VacationPeriod) => {
    setEditingVacation(vacation);
    setAbsenceType(vacation?.type);

    const start = new Date(vacation.startDate || "");
    const end = new Date(vacation.endDate || "");
    const days = eachDayOfInterval({ start, end });
    setSelectedDays(days);

    setCurrentMonth(start);
    setShowCalendar(true);
  };

  const handleDelete = async (id?: string) => {
    if (window.confirm("Tem certeza que deseja excluir este período?")) {
      await deleteVacation(id);
    }
  };

  const getAbsenceTypeLabel = (type?: AbsenceType) => {
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

  const getAbsenceStatus = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (isAfter(start, today)) {
      return "future";
    } else if (isBefore(end, today)) {
      return "past";
    } else {
      return "current";
    }
  };

  const getStatusLabel = (status: "future" | "past" | "current") => {
    switch (status) {
      case "future":
        return "Agendada";
      case "past":
        return "Concluída";
      case "current":
        return "Em andamento";
    }
  };

  const getStatusColor = (status: "future" | "past" | "current") => {
    switch (status) {
      case "future":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50";
      case "past":
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/50";
      case "current":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/50";
    }
  };

  const getRemainingVacationDays = () => {
    const usedDays = getUsedVacationDays();
    return 22 - usedDays;
  };

  if (showCalendar) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <button
            onClick={() => setShowCalendar(false)}
            className="mb-4 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-slate-900/50 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingVacation ? "Editar Ausência" : "Nova Ausência"}
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
                <option value="ferias">
                  Férias ({getRemainingVacationDays()} dias restantes)
                </option>
                <option value="feriado_local">
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
                onClick={() => {
                  setShowCalendar(false);
                  setEditingVacation(null);
                  setSelectedDays([]);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedDays.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50"
              >
                {editingVacation ? "Atualizar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Minhas Ausências
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gerencie suas férias, feriados locais e licenças
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => {
                setShowCalendar(true);
                setEditingVacation(null);
                setSelectedDays([]);
                setCurrentMonth(new Date());
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              <Calendar className="h-4 w-4 mr-2" />
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
              Restam {getRemainingVacationDays()} dias para marcar
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
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {userVacations.map((vacation) => {
              const status = getAbsenceStatus(
                vacation.startDate || "",
                vacation.endDate || ""
              );
              const statusLabel = getStatusLabel(status);
              const statusColor = getStatusColor(status);

              return (
                <li key={vacation.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getAbsenceTypeLabel(vacation.type)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(vacation.startDate || ""), "PP", {
                          locale: pt,
                        })}{" "}
                        -{" "}
                        {format(new Date(vacation.endDate || ""), "PP", {
                          locale: pt,
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {status !== "past" && (
                        <>
                          <button
                            onClick={() => handleEdit(vacation)}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(vacation.id)}
                            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {userVacations.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400 text-center">
                Nenhuma ausência registrada para este ano
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AbsenceManagement;
