import { Navigate } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AlertsPage from "./pages/AlertsPage";
import ModelMonitoringPage from "./pages/ModelMonitoringPage";
import LoginPage from "./pages/LoginPage";

function InvestigationPage() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Investigations</h1>
      <p>Investigation workspace coming next.</p>
    </div>
  );
}

const router = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/transactions",
    element: <TransactionsPage />,
  },
  {
    path: "/alerts",
    element: <AlertsPage />,
  },
  {
    path: "/investigations",
    element: <InvestigationPage />,
  },
  {
    path: "/model-monitoring",
    element: <ModelMonitoringPage />,
  },
];

export default router;