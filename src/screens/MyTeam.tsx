import React, { useEffect } from "react";
import { Users, UserPlus, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTeamStore } from "../store/teamStore";
import { useVacationStore } from "../store/vacationStore";
import { format } from "date-fns";
import { pt } from "date-fns/locale/pt";
import toast from "react-hot-toast";

const MyTeam = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    team,
    members,
    myInvitations,
    fetchTeamByLeader,
    fetchTeamMembers,
    getMyInvitation,
    acceptTeamInvitation,
    refuseTeamInvitation,
  } = useTeamStore();
  const { vacations } = useVacationStore();

  useEffect(() => {
    const loadTeam = async () => {
      if (user?.role === "team_leader") {
        const team = await fetchTeamByLeader(user.id);
        if (team) {
          await fetchTeamMembers(team.id);
        }
      } else {
        if (user && user?.teamId) {
          await fetchTeamMembers(user?.teamId);
        }
      }
      if (user) {
        await getMyInvitation(user);
      }
    };
    loadTeam();
  }, [user, fetchTeamByLeader, fetchTeamMembers]);

  const getCurrentVacations = (userId?: string) => {
    const now = new Date();
    return vacations.filter(
      (vacation) =>
        vacation.userId === userId &&
        now >= new Date(vacation.startDate || "") &&
        now <= new Date(vacation.endDate || "")
    );
  };

  const getUpcomingVacations = (userId?: string) => {
    const now = new Date();
    return vacations
      .filter(
        (vacation) =>
          vacation.userId === userId && new Date(vacation.startDate || "") > now
      )
      .sort(
        (a, b) =>
          new Date(a.startDate || "").getTime() -
          new Date(b.startDate || "").getTime()
      );
  };

  const handleAcceptInvite = async (email?: string | null, teamId?: string) => {
    console.log("accept");
    await acceptTeamInvitation(email, teamId);
    toast.success("Convite aceite com sucesso");
  };

  const handleRefuseInvite = async (email?: string | null, teamId?: string) => {
    await refuseTeamInvitation(email, teamId);
    toast.success("Convite recusado com sucesso");
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              A Minha Equipa
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {team ? `Equipa ${team.name}` : "Membros da equipa"}
            </p>
          </div>
          {user?.role === "team_leader" && (
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => navigate("/team/manage")}
                className="inline-flex items-center px-4 py-2 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Gerir Equipa
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {myInvitations?.length > 0 && (
            <h2 className="text-lg font-medium text-foreground">
              Convites Pendentes
            </h2>
          )}
          {myInvitations?.map((invitation, i) => (
            <div
              key={i}
              className="bg-background shadow-md rounded-lg overflow-hidden border"
            >
              <div className="flex justify-between p-6">
                <div className="flex items-center">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center mb-4 text-primary-foreground text-2xl font-semibold shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl"
                    style={{ backgroundColor: "red" }}
                  >
                    {invitation?.teamName?.charAt(0).toUpperCase()}
                  </div>

                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Equipa: {invitation?.teamName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(invitation?.joinedAt || ""),
                        "d 'de' MMMM 'às' HH:mm",
                        { locale: pt }
                      )}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() =>
                        handleAcceptInvite(
                          invitation?.email,
                          invitation?.teamId
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition"
                    >
                      <Check size={18} /> Aceitar
                    </button>
                    <button
                      onClick={() =>
                        handleRefuseInvite(
                          invitation?.email,
                          invitation?.teamId
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition"
                    >
                      <X size={18} /> Recusar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {
              const currentVacations = getCurrentVacations(member?.id);
              const upcomingVacations = getUpcomingVacations(member?.id);
              const isOnVacation = currentVacations.length > 0;

              return (
                <div
                  key={member.id}
                  className="bg-background shadow-md rounded-lg overflow-hidden border"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-primary-foreground text-lg font-medium"
                        style={{ backgroundColor: member.color }}
                      >
                        {member?.firstName?.charAt(0)}
                        {member?.lastName?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-foreground">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member.role === "team_leader"
                            ? "Team Leader"
                            : "Colaborador"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            isOnVacation ? "bg-destructive" : "bg-primary"
                          }`}
                        />
                        <span className="ml-2 text-sm text-muted-foreground">
                          {isOnVacation ? "De férias" : "Disponível"}
                        </span>
                      </div>

                      {isOnVacation &&
                        currentVacations.map((vacation) => (
                          <p
                            key={vacation.id}
                            className="mt-2 text-sm text-muted-foreground"
                          >
                            Retorna em
                            {format(
                              new Date(vacation.endDate || ""),
                              "dd/MM/yyyy"
                            )}
                          </p>
                        ))}

                      {upcomingVacations.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-foreground">
                            Próximas Férias
                          </h4>
                          {upcomingVacations.slice(0, 1).map((vacation) => (
                            <p
                              key={vacation.id}
                              className="mt-1 text-sm text-muted-foreground"
                            >
                              {format(
                                new Date(vacation.startDate || ""),
                                "dd/MM/Y",
                                { locale: pt }
                              )}
                              -
                              {format(
                                new Date(vacation.endDate || ""),
                                "dd/MM/Y",
                                {
                                  locale: pt,
                                }
                              )}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {members.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-background rounded-lg border">
                <Users className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  Sem membros
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user?.role === "team_leader"
                    ? "Comece adicionando membros à sua equipa"
                    : "Aguarde ser adicionado a uma equipa"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeam;
