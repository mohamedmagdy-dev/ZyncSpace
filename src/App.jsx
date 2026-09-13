import "./styles/App.css";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChatPage from "./pages/ChatPage";

import ProtectedRoute from "./components/ProtectedRoute";

import { Routes, Route } from "react-router";
import { useEffect } from "react";
import useAuthStore from "./store/useAuthStore";
import { Toaster } from "sonner";

export default function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            color: "#DBEAFE",
            background: "#475569",
            fontWeight: "bold",
            fontSize: "16px",
          },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <ProtectedRoute guestOnly>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute guestOnly>
              <ResetPasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute guestOnly>
              <RegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
