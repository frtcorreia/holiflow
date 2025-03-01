import React, { useEffect, useState } from "react";
import { useVacationStore } from "../store/vacationStore";
import { useAuthStore } from "../store/authStore";
import { VacationPeriod } from "../types";

const TeamVacations = () => {
  const { user } = useAuthStore();
  const {
    vacations,
    loading,
    approveVacation,
    rejectVacation,
    fetchVacations,
  } = useVacationStore();
  const [pendingVacations, setPendingVacations] = useState<VacationPeriod[]>(
    []
  );

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  useEffect(() => {
    if (user && vacations) {
      const filtered = vacations.filter(
        (vacation) =>
          vacation?.teamLeaderId === user.id && vacation.status === "pending"
      );
      setPendingVacations(filtered);
    }
  }, [vacations, user]);

  const handleApprove = async (vacationId?: string) => {
    try {
      await approveVacation(vacationId);
      await fetchVacations();
    } catch (error) {
      console.error("Erro ao aprovar férias:", error);
    }
  };

  const handleReject = async (vacationId?: string) => {
    try {
      await rejectVacation(vacationId);
      await fetchVacations();
    } catch (error) {
      console.error("Erro ao rejeitar férias:", error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-lg font-medium text-foreground mb-4 ">
        Gestão de Férias da equipa
      </h1>

      {pendingVacations.length === 0 ? (
        <div className="grid gap-4 bg-background dark:bg-foreground/[0.05] shadow-md rounded-lg p-4 border">
          <p className="text-muted-foreground">
            Não há pedidos de férias pendentes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 bg-background dark:bg-foreground/[0.05] shadow-md rounded-lg border">
          {pendingVacations.map((vacation, i) => (
            <div
              key={i}
              className="bg-background shadow-md p-4 rounded-lg border"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {vacation.userName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {`${new Date(
                      vacation.startDate || ""
                    ).toLocaleDateString()} até ${new Date(
                      vacation.endDate || ""
                    ).toLocaleDateString()}`}
                  </p>
                </div>
                <span className="px-2 py-1 text-sm rounded-full bg-primary/20 text-primary">
                  Pendente
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(vacation?.id)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleReject(vacation?.id)}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamVacations;
