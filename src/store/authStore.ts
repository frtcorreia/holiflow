import { create } from "zustand";
import { auth, db } from "../helpers/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { Role, User } from "../types";

const USERS_COLLECTION = "users";

interface FirebaseError {
  code: string;
  message: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: {
      firstName?: string;
      lastName?: string;
      role?: Role;
      color?: string;
    }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUser: (user: FirebaseUser | null) => Promise<void>;
  updateUserProfile: (profile: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const logAccess = async (user: User | null) => {
  console.log("logAccess", { user });
  if (!user) return;

  try {
    const db = getFirestore();
    const logData = {
      userId: user.id,
      userEmail: user.email,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
    console.log("logData", { logData });
    await addDoc(collection(db, "access_logs"), logData);
  } catch (error) {
    console.error("Erro ao registrar log de acesso:", error);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const db = getFirestore();
      const userDoc = await getDoc(
        doc(db, USERS_COLLECTION, userCredential.user.uid)
      );
      const userData = userDoc.data();

      const user = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        ...userData,
      } as User;

      set({ user, loading: false });
      console.log("user after signIn", { user });
      await logAccess(user);
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      set({ error: firebaseError.message, loading: false });
      throw error;
    }
  },
  signUp: async (email, password, profile) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), {
        email: userCredential.user.email,
        ...profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      set({
        user: {
          email: userCredential.user.email,
          ...profile,
          id: userCredential.user.uid,
        },
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  setUser: async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
      const userData = userDoc.data();
      set({
        user: {
          id: user.uid,
          email: user.email,
          ...userData,
        },
        loading: false,
      });
    } else {
      set({ user: null, loading: false });
    }
  },
  updateUserProfile: async (profile) => {
    const { user } = get();
    if (!user?.id) {
      set({ error: "Usuário não está autenticado" });
      return;
    }

    try {
      set({ loading: true, error: null });
      await setDoc(
        doc(db, USERS_COLLECTION, user.id),
        {
          ...profile,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      set({
        user: {
          ...user,
          ...profile,
        },
      });
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      set({ error: firebaseError.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  clearError: () => set({ error: null }),
}));
