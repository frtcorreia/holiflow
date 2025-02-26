import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTeamStore } from "../store/teamStore";
import toast from "react-hot-toast";
import { Invitation, NotificationType, Role } from "../types";
import { useNotificationStore } from "../store/notificationStore";

const TeamManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    team,
    members,
    invitations,
    createTeam,
    updateTeam,
    addMember,
    removeMember,
    fetchTeamByLeader,
    findUserByEmail,
    addToInvitationList,
    fetchTeamInvitations,
    removeTeamInvitation,
    fetchTeamMembers,
  } = useTeamStore();
  const [teamName, setTeamName] = useState<string | undefined>();
  const [teamInvitations, setTeamInvitations] = useState<Invitation[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user?.role === Role.teamLeader) {
      fetchTeamByLeader(user?.id).then((team) => {
        if (team) {
          setTeamName(team?.name);
        }
      });
    }
  }, [user, fetchTeamByLeader]);

  useEffect(() => {
    if (user?.role === Role.teamLeader) {
      fetchTeamInvitations(team?.id).then((data) => {
        setTeamInvitations(data);
      });
    }
  }, [user, fetchTeamInvitations]);

  useEffect(() => {
    if (user?.role === Role.teamLeader) {
      setTeamInvitations(invitations);
    }
  }, [invitations]);

  useEffect(() => {
    if (user?.teamId) {
      fetchTeamMembers(user?.teamId);
    }
  }, [user, fetchTeamMembers]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName?.trim()) {
      toast.error("Por favor, insira um nome para a equipa");
      return;
    }

    try {
      await createTeam(teamName, user?.id);
      toast.success("Equipa criada com sucesso");
      setIsCreating(false);
    } catch (error) {
      toast.error("Erro ao criar equipa");
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName?.trim()) {
      toast.error("Por favor, insira um nome para a equipa");
      return;
    }

    try {
      await updateTeam(team!.id, { name: teamName });
      toast.success("Nome da equipa atualizado");
    } catch (error) {
      toast.error("Erro ao atualizar nome da equipa");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) {
      toast.error("Por favor, insira um email");
      return;
    }

    try {
      const userToAdd = await findUserByEmail(newMemberEmail);
      if (!userToAdd) {
        await addToInvitationList(team, newMemberEmail, Role.collaborator);
        await useNotificationStore.getState().addNotification({
          email: newMemberEmail,
          title: "Foi adicionado a uma equipa",
          message: `Foi adicionado à equipa ${team?.name} pode aceitar o convite na area "A minha equipa"`,
          type: NotificationType.team_invite,
          read: false,
          metadata: {
            teamId: team?.id,
          },
        });
        toast.success("Convite enviado com sucesso");
        return;
      }

      if (userToAdd.teamId) {
        toast.error("Membro já pertence a uma equipa");
        return;
      }

      await addMember(team, newMemberEmail, userToAdd?.id, Role.collaborator);
      toast.success("Membro adicionado com sucesso");
      setNewMemberEmail("");
    } catch (error) {
      console.log(error);
      toast.error(`${error}`);
    }
  };

  const handleRemoveMember = async (memberId?: string) => {
    if (window.confirm("Tem certeza que deseja remover este membro?")) {
      try {
        await removeMember(team!.id, memberId);
        toast.success("Membro removido com sucesso");
      } catch (error) {
        toast.error("Erro ao remover membro");
      }
    }
  };

  const handleRemoveInvitation = async (email?: string) => {
    if (window.confirm("Tem certeza que deseja remover este membro?")) {
      try {
        await removeTeamInvitation(email);
        toast.success("Membro removido com sucesso");
      } catch (error) {
        toast.error("Erro ao remover membro");
      }
    }
  };

  if (user?.role !== "team_leader") {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <p className="text-red-600 dark:text-red-400">
            Acesso não autorizado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <button
          onClick={() => navigate("/team")}
          className="mb-4 inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>

        <div className="bg-background rounded-lg shadow-md border border-muted">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Gerir Equipa
            </h2>

            {!team ? (
              <div>
                {!isCreating ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">
                      Sem equipa
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Comece criando uma nova equipa
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center px-4 py-2 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Equipa
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div>
                      <label
                        htmlFor="teamName"
                        className="block text-sm font-medium text-foreground"
                      >
                        Nome da Equipa
                      </label>
                      <input
                        type="text"
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground text-sm"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent/10"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                      >
                        Criar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <form onSubmit={handleUpdateTeam} className="space-y-4">
                  <div>
                    <label
                      htmlFor="teamName"
                      className="block text-sm font-medium text-foreground"
                    >
                      Nome da Equipa
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="flex-1 p-2 rounded-md border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground text-sm"
                      />
                      <button
                        type="submit"
                        className="ml-3 inline-flex items-center px-4 py-2 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                      >
                        Atualizar
                      </button>
                    </div>
                  </div>
                </form>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Membros da Equipa
                  </h3>

                  <form onSubmit={handleAddMember} className="space-y-4 mb-6">
                    <div>
                      <label
                        htmlFor="newMemberEmail"
                        className="block text-sm font-medium text-foreground"
                      >
                        Adicionar Membro
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="email"
                          id="newMemberEmail"
                          placeholder="Email do colaborador"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="flex-1 p-2 rounded-md border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground text-sm"
                        />
                        <button
                          type="submit"
                          className="ml-3 inline-flex items-center px-4 py-2 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {teamInvitations.length > 0 && (
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Membros convidados
                      </h3>
                    )}

                    {teamInvitations.map((member) => (
                      <div
                        key={member.email}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-foreground">
                              {member.email}
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {member.role}
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {member.joinedAt}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pendente
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleRemoveInvitation(member.email || "")
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {members.length > 0 && (
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Equipa
                      </h3>
                    )}

                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium"
                            style={{ backgroundColor: member.color }}
                          >
                            {member?.firstName?.charAt(0)}
                            {member?.lastName?.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-foreground">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        {member.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member?.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
