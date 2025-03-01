import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { User } from "../types";

export const useAccessLogs = (user: User | null) => {
  const location = useLocation();
  const db = getFirestore();

  useEffect(() => {
    const logAccess = async () => {
      if (!user) return;

      try {
        const logData = {
          userId: user?.id,
          userEmail: user.email,
          path: location.pathname,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: {
            width: window.screen.width,
            height: window.screen.height,
          },
        };

        await addDoc(collection(db, "access_logs"), logData);
      } catch (error) {
        console.error("Erro ao registrar log de acesso:", error);
      }
    };

    logAccess();
  }, [location.pathname, user]);
};
