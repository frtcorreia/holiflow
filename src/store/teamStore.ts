import { create } from "zustand";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  limit,
  writeBatch,
} from "firebase/firestore";

import { db } from "../helpers/firebase";
import {
  Invitation,
  InvitationStatus,
  NotificationType,
  Role,
  Team,
  User,
} from "../types";
import {
  sendEmailInvitation,
  sendEmailRegisterInvitation,
} from "../helpers/email";
import { useNotificationStore } from "./notificationStore";

// Constantes
const COLLECTIONS = {
  TEAMS: "teams",
  TEAM_MEMBERS: "team_members",
  INVITATION_LIST: "invitation_list",
  USERS: "users",
} as const;

// Tipos de erro personalizados
class TeamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamError";
  }
}

interface TeamState {
  team: Team | null;
  invitations: Invitation[];
  myInvitations: Invitation[];
  members: User[];
  loading: boolean;
  error: string | null;
  createTeam: (name?: string, leaderId?: string) => Promise<Team>;
  updateTeam: (id: string, data: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addMember: (
    team: Team | null,
    email: string,
    userId?: string,
    role?: Role
  ) => Promise<void>;
  removeMember: (teamId?: string, userId?: string) => Promise<void>;
  fetchTeamByLeader: (leaderId?: string) => Promise<Team | null>;
  fetchTeamMembers: (teamId?: string) => Promise<User[]>;
  findUserByEmail: (email: string) => Promise<User | null>;
  addToInvitationList: (
    team: Team | null,
    email: string,
    role?: Role
  ) => Promise<void>;
  fetchTeamInvitations: (teamId?: string) => Promise<Invitation[]>;
  removeTeamInvitation: (email?: string) => Promise<void>;
  getMyInvitation: (
    user?: User | null
  ) => Promise<Invitation[] | undefined | null>;
  acceptTeamInvitation: (
    email?: string | null,
    teamId?: string
  ) => Promise<void>;
  refuseTeamInvitation: (
    email?: string | null,
    teamId?: string
  ) => Promise<void>;
  findInvitation: (teamId: string, email: string) => Promise<boolean>;
  findInvitationDoc: (email: string, teamId: string) => Promise<any>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  team: null,
  invitations: [],
  myInvitations: [],
  members: [],
  loading: false,
  error: null,

  findUserByEmail: async (email) => {
    try {
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", email),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        return null;
      }

      const userDoc = userSnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  },

  createTeam: async (name, leaderId) => {
    try {
      set({ loading: true, error: null });
      const teamData = {
        name,
        leaderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "teams"), teamData);
      const team = { id: docRef.id, ...teamData };

      await addDoc(collection(db, "team_members"), {
        teamId: team.id,
        userId: leaderId,
        role: Role.teamLeader,
        joinedAt: new Date().toISOString(),
      });

      if (leaderId) {
        await updateDoc(doc(db, "users", leaderId), {
          teamId: team.id,
        });
      }

      set({ team });
      return team;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTeam: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "teams", id), updateData);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTeam: async (id) => {
    try {
      set({ loading: true, error: null });
      const membersQuery = query(
        collection(db, "team_members"),
        where("teamId", "==", id)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const memberDeletions = membersSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(memberDeletions);

      await deleteDoc(doc(db, "teams", id));
      set({ team: null, members: [] });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addMember: async (team, email, userId, role) => {
    if (!team?.id || !email) {
      throw new TeamError("Dados da equipe ou email inválidos");
    }

    try {
      set({ loading: true, error: null });

      // Verificar se já existe convite
      const existingInvitation = await get().findInvitation(team.id, email);
      if (existingInvitation) {
        throw new TeamError("O membro já tem um convite pendente");
      }

      // Criar convite
      await addDoc(collection(db, COLLECTIONS.INVITATION_LIST), {
        teamId: team.id,
        userId,
        email,
        role,
        joinedAt: new Date().toISOString(),
        status: InvitationStatus.pending,
      });

      // Notificar usuário
      await useNotificationStore.getState().addNotification({
        title: "Convite de nova equipa",
        message: `Recebeu um convite para se juntar à equipa: ${team.name}`,
        email,
        type: NotificationType.team_joined,
        read: false,
        metadata: { teamId: team.id },
      });

      await sendEmailInvitation(team, email, role);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeMember: async (teamId, userId) => {
    try {
      set({ loading: true, error: null });
      const memberQuery = query(
        collection(db, "team_members"),
        where("teamId", "==", teamId),
        where("userId", "==", userId)
      );
      const memberSnapshot = await getDocs(memberQuery);
      if (!memberSnapshot.empty && userId) {
        await deleteDoc(memberSnapshot.docs[0].ref);

        await updateDoc(doc(db, "users", userId), {
          teamId: null,
        });
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTeamByLeader: async (leaderId) => {
    try {
      set({ loading: true, error: null });
      const teamQuery = query(
        collection(db, "teams"),
        where("leaderId", "==", leaderId)
      );
      const teamSnapshot = await getDocs(teamQuery);
      if (!teamSnapshot.empty) {
        const teamDoc = teamSnapshot.docs[0];
        const team = { id: teamDoc.id, ...teamDoc.data() } as Team;
        set({ team });
        return team;
      }
      return null;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTeamMembers: async (teamId) => {
    if (!teamId) {
      throw new TeamError("ID da equipe não fornecido");
    }

    try {
      set({ loading: true, error: null });

      const membersQuery = query(
        collection(db, COLLECTIONS.TEAM_MEMBERS),
        where("teamId", "==", teamId)
      );

      const membersSnapshot = await getDocs(membersQuery);
      const membersPromises = membersSnapshot.docs.map(async (memberDoc) => {
        const memberData = memberDoc.data();
        const userDoc = await getDoc(
          doc(db, COLLECTIONS.USERS, memberData.userId)
        );

        if (!userDoc.exists()) return null;

        return {
          id: userDoc.id,
          ...userDoc.data(),
        } as User;
      });

      const members = (await Promise.all(membersPromises)).filter(
        (member): member is User => member !== null
      );
      set({ members });
      return members;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar membros";
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTeamInvitations: async (teamId) => {
    try {
      set({ loading: true, error: null });
      const membersQuery = query(
        collection(db, "invitation_list"),
        where("teamId", "==", teamId)
      );
      const membersSnapshot = await getDocs(membersQuery);

      const invitations: Invitation[] = membersSnapshot.docs.map(
        (memberDoc) => {
          const data = memberDoc.data();
          return {
            email: data.email || "",
            joinedAt: data.joinedAt || "",
            role: data.role || "",
            teamId: data.teamId || "",
            teamName: data.teamName || "",
          } as Invitation;
        }
      );

      set({ myInvitations: invitations });
      return invitations;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addToInvitationList: async (team, email, role) => {
    try {
      set({ loading: true, error: null });

      const memberQuery = query(
        collection(db, "invitation_list"),
        where("email", "==", email),
        where("teamId", "==", team)
      );
      const memberSnapshot = await getDocs(memberQuery);

      if (!memberSnapshot.empty) {
        throw new Error("O membro já tem um convite pendente");
      }

      await addDoc(collection(db, "invitation_list"), {
        teamId: team?.id,
        teamName: team?.name,
        email: email,
        role: role,
        joinedAt: new Date().toISOString(),
        status: "pending",
      });

      const membersQuery = query(
        collection(db, "invitation_list"),
        where("teamId", "==", team?.id)
      );
      const membersSnapshot = await getDocs(membersQuery);

      const invitations: Invitation[] = membersSnapshot.docs.map(
        (memberDoc) => {
          const data = memberDoc.data();
          return {
            email: data.email || "",
            joinedAt: data.joinedAt || "",
            role: data.role || "",
            teamId: data.teamId || "",
            teamName: data.teamName || "",
          } as Invitation;
        }
      );

      sendEmailRegisterInvitation(team, email, role);

      set({ invitations });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeTeamInvitation: async (email) => {
    try {
      set({ loading: true, error: null });
      const memberQuery = query(
        collection(db, "invitation_list"),
        where("email", "==", email)
      );
      const memberSnapshot = await getDocs(memberQuery);
      const docSnap = memberSnapshot.docs[0];
      const data = docSnap.data();
      if (!memberSnapshot.empty) {
        await deleteDoc(memberSnapshot.docs[0].ref);
      }

      const membersQuery = query(
        collection(db, "invitation_list"),
        where("teamId", "==", data?.teamId)
      );
      const membersSnapshot = await getDocs(membersQuery);

      const invitations: Invitation[] = membersSnapshot.docs.map(
        (memberDoc) => {
          const data = memberDoc.data();
          return {
            email: data.email || "",
            joinedAt: data.joinedAt || "",
            role: data.role || "",
            teamId: data.teamId || "",
            teamName: data.teamName || "",
          } as Invitation;
        }
      );

      set({ invitations });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getMyInvitation: async (user) => {
    try {
      set({ loading: true, error: null });
      const iQuery = query(
        collection(db, "invitation_list"),
        where("email", "==", user?.email)
      );
      const iSnapshot = await getDocs(iQuery);

      const invitations: Invitation[] = iSnapshot.docs.map((iDoc) => {
        const data = iDoc.data();

        return {
          email: data.email || "",
          joinedAt: data.joinedAt || "",
          role: data.role || "",
          teamId: data.teamId || "",
          teamName: data.teamName || "",
        } as Invitation;
      });

      set({ myInvitations: invitations });
      return invitations;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  acceptTeamInvitation: async (email, teamId) => {
    if (!email || !teamId) {
      throw new TeamError("Email ou ID da equipe não fornecidos");
    }

    try {
      set({ loading: true, error: null });

      const batch = writeBatch(db);

      const [invitationDoc, userDoc] = await Promise.all([
        get().findInvitationDoc(email, teamId),
        get().findUserByEmail(email),
      ]);

      if (!invitationDoc || !userDoc) {
        throw new TeamError("Convite ou user não encontrado");
      }

      // Preparar operações em batch
      batch.delete(invitationDoc.ref);

      batch.set(doc(collection(db, COLLECTIONS.TEAM_MEMBERS)), {
        teamId,
        userId: userDoc.id,
        role: invitationDoc.data().role,
        joinedAt: new Date().toISOString(),
      });

      if (typeof userDoc.id === "string") {
        const userRef = doc(db, COLLECTIONS.USERS, userDoc.id);
        batch.update(userRef, { teamId });
      } else {
        console.error("Erro: userDoc.id não é uma string válida.", userDoc.id);
      }

      await batch.commit();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao aceitar convite";
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  refuseTeamInvitation: async (email, teamId) => {
    try {
      set({ loading: true, error: null });

      const iQuery = query(
        collection(db, "invitation_list"),
        where("email", "==", email),
        where("teamId", "==", teamId)
      );
      const iSnapshot = await getDocs(iQuery);
      if (!iSnapshot.empty) {
        await deleteDoc(iSnapshot.docs[0].ref);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Helper functions
  findInvitation: async (teamId: string, email: string) => {
    const memberQuery = query(
      collection(db, COLLECTIONS.INVITATION_LIST),
      where("email", "==", email),
      where("teamId", "==", teamId)
    );
    const snapshot = await getDocs(memberQuery);
    return !snapshot.empty;
  },

  findInvitationDoc: async (email: string, teamId: string) => {
    const memberQuery = query(
      collection(db, COLLECTIONS.INVITATION_LIST),
      where("email", "==", email),
      where("teamId", "==", teamId)
    );
    const snapshot = await getDocs(memberQuery);
    return snapshot.docs[0];
  },
}));
