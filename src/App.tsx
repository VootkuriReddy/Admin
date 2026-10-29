import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAdmin } from "./store/AdminContext";
import ErrorBoundary from "./utils/ErrorBoundary";
import Layout from "./components/Layout";
import { Toast } from "./components/ui";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddUser from "./pages/AddUser";
import Credentials from "./pages/Credentials";
import YearEnd from "./pages/YearEnd";
import Reminders from "./pages/Reminders";

interface GuardProps {
  children: ReactNode;
}

function Guard({ children }: GuardProps) {
  const { signedIn, authReady } = useAdmin();
  const location = useLocation();
  if (!authReady) return null;
  if (!signedIn)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toast />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <Guard>
              <Dashboard />
            </Guard>
          }
        />
        <Route
          path="/add-user"
          element={
            <Guard>
              <AddUser />
            </Guard>
          }
        />
        <Route
          path="/credentials"
          element={
            <Guard>
              <Credentials />
            </Guard>
          }
        />
        <Route
          path="/year-end"
          element={
            <Guard>
              <YearEnd />
            </Guard>
          }
        />
        <Route
          path="/reminders"
          element={
            <Guard>
              <Reminders />
            </Guard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
