import { Navigate } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AlertsPage from "./pages/AlertsPage";
import InvestigationsPage from "./pages/investigation/InvestigationsPage";
import InvestigationDetailPage from "./pages/investigation/InvestigationDetailPage";
import ModelMonitoringPage from "./pages/ModelMonitoringPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import FraudSimulatorPage from "./pages/FraudSimulatorPage";

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
    element: <ProtectedRoute />,
    children: [
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
        element: <InvestigationsPage />,
      },
      {
        path: "/investigations/detail",
        element: <InvestigationDetailPage />,
      },
      {
        path: "/model-monitoring",
        element: <ModelMonitoringPage />,
      },
      {
        path: "/fraud-simulator",
        element: <FraudSimulatorPage />,
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default router;