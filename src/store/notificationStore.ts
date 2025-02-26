import { create } from "zustand";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../helpers/firebase";
import { Notification, User } from "../types";

const NOTIFICATIONS_COLLECTION = "notifications";

interface NotificationState {
  notificationsById: Notification[];
  notificationsByEmail: Notification[];
  unreadCountById: number;
  unreadCountByEmail: number;
  loading: boolean;
  error: string | null;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  subscribeToNotifications: (user: User) => () => void;
  clearError: () => void;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notificationsByEmail: [],
  notificationsById: [],
  unreadCountById: 0,
  unreadCountByEmail: 0,
  loading: false,
  error: null,

  addNotification: async (notification) => {
    try {
      set({ loading: true, error: null });
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notification,
        createdAt: serverTimestamp(),
        read: false, // valor default explícito
      });
    } catch (error: unknown) {
      const err = error as Error;
      set({ error: err.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    debugger;
    try {
      set({ loading: true, error: null });
      // await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
      //   read: true,
      // });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where("userId", "==", userId),
        where("read", "==", false)
      );
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, { read: true })
      );
      await Promise.all(updates);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteNotification: async (notificationId: string) => {
    debugger;
    try {
      set({ loading: true, error: null });
      //await deleteDoc(doc(db, "notifications", notificationId));
    } catch (error: unknown) {
      const err = error as Error;
      set({ error: err.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  subscribeToNotifications: (user) => {
    if (!user?.email || !user?.id) {
      set({ error: "Usuário inválido" });
      return () => {};
    }

    set({ loading: true });

    const emailQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("email", "==", user.email),
      orderBy("createdAt", "desc")
    );

    const idQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    );

    const processSnapshot = (
      snapshot: any,
      key: "notificationsByEmail" | "notificationsById"
    ) => {
      const notifications = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      const unreadCount = notifications.filter((n) => !n.read).length;

      set((prev) => ({
        ...prev,
        [key]: notifications,
        [`unreadCount${key.slice(13)}`]: unreadCount,
        loading: false,
      }));
    };

    const unsubscribeEmail = onSnapshot(emailQuery, (snapshot) =>
      processSnapshot(snapshot, "notificationsByEmail")
    );

    const unsubscribeId = onSnapshot(idQuery, (snapshot) =>
      processSnapshot(snapshot, "notificationsById")
    );

    return () => {
      unsubscribeEmail();
      unsubscribeId();
    };
  },

  clearError: () => set({ error: null }),
}));
