import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { admin, token } = useAuth();

  // Also check if token is coming in via URL params
  // This handles the case right after Google redirect
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("token");

  // Allow access if:
  // 1. Already logged in (context has admin + token)
  // 2. OR token is present in URL (just redirected from Google)
  if (!admin && !token && !urlToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;