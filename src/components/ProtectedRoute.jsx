import useAuthStore from "../store/useAuthStore";
import { Navigate } from "react-router";

export default function ProtectedRoute({ children }) {
  const { user, authReady } = useAuthStore();

  if (!authReady) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
