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
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../helpers/firebase";
import { NotificationType, VacationPeriod } from "../types";
import { useNotificationStore } from "./notificationStore";

interface VacationState {
  vacations: VacationPeriod[];
  loading: boolean;
  error: string | null;
  fetchVacations: () => Promise<void>;
  addVacation: (vacation: Omit<VacationPeriod, "id">) => Promise<void>;
  updateVacation: (
    id?: string,
    vacation?: Partial<VacationPeriod>
  ) => Promise<void>;
  deleteVacation: (id?: string) => Promise<void>;
  subscribeToUserVacations: (
    userId: string,
    callback: (vacations: VacationPeriod[]) => void
  ) => () => void;
  approveVacation: (vacationId?: string) => Promise<void>;
  rejectVacation: (vacationId?: string) => Promise<void>;
}

export const useVacationStore = create<VacationState>((set, get) => ({
  vacations: [],
  loading: false,
  error: null,
  fetchVacations: async () => {
    try {
      set({ loading: true });
      const querySnapshot = await getDocs(collection(db, "vacations"));
      const vacations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VacationPeriod[];
      set({ vacations, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  addVacation: async (vacation) => {
    try {
      set({ loading: true });

      const teamMemberDoc = await getDocs(
        query(
          collection(db, "team_members"),
          where("userId", "==", vacation.userId)
        )
      );

      if (teamMemberDoc.empty) {
        throw new Error("Membro da equipe não encontrado");
      }

      const teamId = teamMemberDoc.docs[0].data().teamId;

      const teamDoc = await getDoc(doc(db, "teams", teamId));

      if (!teamDoc.exists()) {
        throw new Error("Equipe não encontrada");
      }

      const leaderId = teamDoc.data().leaderId;

      const vacationData = {
        ...vacation,
        status: "pending",
        teamLeaderId: leaderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "vacations"), vacationData);

      await updateDoc(doc(db, "vacations", docRef.id), {
        id: docRef.id,
      });

      await useNotificationStore.getState().addNotification({
        userId: leaderId,
        title: "Novo Pedido de Férias",
        message: `${vacation.userName} solicitou férias de ${new Date(
          vacation?.startDate || ""
        ).toLocaleDateString()} a ${new Date(
          vacation?.endDate || ""
        ).toLocaleDateString()}`,
        type: NotificationType.vacation_request,
        read: false,
        metadata: {
          vacationId: docRef.id,
        },
      });

      await get().fetchVacations();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  updateVacation: async (id, vacation) => {
    try {
      set({ loading: true });
      const updateData = {
        ...vacation,
        updatedAt: new Date().toISOString(),
      };
      if (id) {
        await updateDoc(doc(db, "vacations", id), updateData);
      }
      await get().fetchVacations();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  deleteVacation: async (id) => {
    try {
      set({ loading: true });

      if (id) {
        await deleteDoc(doc(db, "vacations", id));
        await get().fetchVacations();
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  subscribeToUserVacations: (userId, callback) => {
    const q = query(collection(db, "vacations"), where("userId", "==", userId));

    return onSnapshot(q, (snapshot) => {
      const vacations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VacationPeriod[];
      callback(vacations);
    });
  },
  approveVacation: async (vacationId?: string) => {
    try {
      set({ loading: true });

      if (!vacationId) {
        throw new Error("vacationId obrigatorio");
      }

      await updateDoc(doc(db, "vacations", vacationId || ""), {
        status: "approved",
        updatedAt: new Date().toISOString(),
      });

      const vacationDoc = await getDocs(
        query(collection(db, "vacations"), where("id", "==", vacationId))
      );

      const notificationsRef = collection(db, "notifications");
      const notificationsQuery = query(
        notificationsRef,
        where("metadata.vacationId", "==", vacationId)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      await deleteDoc(notificationsSnapshot.docs[0].ref);

      if (!vacationDoc.empty) {
        const vacation = vacationDoc.docs[0].data() as VacationPeriod;

        await useNotificationStore.getState().addNotification({
          userId: vacation.userId,
          title: "Férias Aprovadas",
          message: `As suas férias de ${new Date(
            vacation.startDate || ""
          ).toLocaleDateString()} a ${new Date(
            vacation.endDate || ""
          ).toLocaleDateString()} foram aprovadas`,
          type: NotificationType.vacation_approved,
          read: false,
          metadata: {
            vacationId,
          },
        });
      }

      await get().fetchVacations();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  rejectVacation: async (vacationId?: string) => {
    try {
      set({ loading: true });

      if (!vacationId) {
        throw new Error("vacationId obrigatorio");
      }

      await updateDoc(doc(db, "vacations", vacationId), {
        status: "rejected",
        updatedAt: new Date().toISOString(),
      });

      const vacationDoc = await getDocs(
        query(collection(db, "vacations"), where("id", "==", vacationId))
      );

      if (!vacationDoc.empty) {
        const vacation = vacationDoc.docs[0].data() as VacationPeriod;

        await useNotificationStore.getState().addNotification({
          userId: vacation.userId,
          title: "Férias Rejeitadas",
          message: `As suas férias de ${new Date(
            vacation.startDate || ""
          ).toLocaleDateString()} a ${new Date(
            vacation.endDate || ""
          ).toLocaleDateString()} foram rejeitadas`,
          type: NotificationType.vacation_rejected,
          read: false,
          metadata: {
            vacationId,
          },
        });
      }

      await get().fetchVacations();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
