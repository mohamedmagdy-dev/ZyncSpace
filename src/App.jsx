import "./styles/App.css";

// Pages
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// components
import ProtectedRoute from "./components/ProtectedRoute";

// Lib
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/chat"
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
