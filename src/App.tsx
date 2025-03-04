import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import PasswordRecoveryScreen from "./screens/PasswordRecoveryScreen";
import Layout from "./components/Layout";
import Dashboard from "./screens/Dashboard";
import MyAbsences from "./screens/MyAbsences";
import NewAbsence from "./screens/NewAbsence";
import UserProfile from "./screens/UserProfile";
import MyTeam from "./screens/MyTeam";
import TeamManagement from "./screens/TeamManagement";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./helpers/firebase";
import TeamVacations from "./screens/TeamVacations";
import Privacy from "./screens/Privacy";
import AccessLogs from "./screens/AccessLogs";
import { LoadingSpinner } from "./components/LoadingSpinner";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<SignInScreen />} />
        <Route path="/auth/signin" element={<SignInScreen />} />
        <Route path="/auth/signup" element={<SignUpScreen />} />
        <Route path="/auth/recover" element={<PasswordRecoveryScreen />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="/admin/logs"
          element={
            <PrivateRoute>
              <Layout>
                <AccessLogs />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/absences"
          element={
            <PrivateRoute>
              <Layout>
                <MyAbsences />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/absences/new"
          element={
            <PrivateRoute>
              <Layout>
                <NewAbsence />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/team"
          element={
            <PrivateRoute>
              <Layout>
                <MyTeam />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/team/manage"
          element={
            <PrivateRoute>
              <Layout>
                <TeamManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/team/vacations"
          element={
            <PrivateRoute>
              <Layout>
                <TeamVacations />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
