import { create } from "zustand";
import { auth, db } from "../helpers/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User } from "../types";

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
  signUp: (email: string, password: string, profile: User) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUser: (user: any) => void;
  updateUserProfile: (profile: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userDoc = await getDoc(
        doc(db, USERS_COLLECTION, userCredential.user.uid)
      );
      const userData = userDoc.data() as Omit<User, "id" | "email">;

      set({
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          ...userData,
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
