import { Navigate, Outlet, useLocation } from "react-router-dom";

import useSessionStore from "../../store/sessionStore";

function AdminRoute() {
  const location = useLocation();
  const currentUser = useSessionStore((state) => state.currentUser);

  if (!currentUser) {
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    );
  }

  if (String(currentUser.role || "user").toLowerCase() !== "admin") {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default AdminRoute;
