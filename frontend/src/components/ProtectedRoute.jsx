import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../lib/session";

function ProtectedRoute() {
  const token = getToken();

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
