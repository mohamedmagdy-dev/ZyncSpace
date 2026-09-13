import useAuthStore from "../store/useAuthStore";
import { Navigate } from "react-router";

export default function ProtectedRoute({ children, guestOnly = false }) {
  const { user, authReady } = useAuthStore();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-title">Loading...</p>
        </div>
      </div>
    );
  }

  if (guestOnly) {
    if (user) {
      return <Navigate to="/chat" replace />;
    }
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
