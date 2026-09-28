import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import useSessionStore from "../../store/sessionStore";

function ProtectedRoute() {
  const location = useLocation();
  const { currentUser, loading, hydrate } = useSessionStore();

  useEffect(() => {
    if (loading) {
      hydrate();
    }
  }, [hydrate, loading]);

  if (loading) {
    return <div className="page-content">Loading...</div>;
  }

  if (!currentUser) {
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