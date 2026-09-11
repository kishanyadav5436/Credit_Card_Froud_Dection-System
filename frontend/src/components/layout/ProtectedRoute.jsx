import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";

function ProtectedRoute() {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;