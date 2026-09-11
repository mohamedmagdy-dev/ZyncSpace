import "./styles/App.css";

// Pages
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";

// components
import ProtectedRoute from "./components/ProtectedRoute";

// Lib
import { Routes, Route } from "react-router";
import { useEffect } from "react";
import useAuthStore from "./store/useAuthStore";

export default function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

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
