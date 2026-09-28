import { Navigate } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AlertsPage from "./pages/AlertsPage";
import InvestigationsPage from "./pages/investigation/InvestigationsPage";
import InvestigationDetailPage from "./pages/investigation/InvestigationDetailPage";
import ModelMonitoringPage from "./pages/ModelMonitoringPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";
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
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/admin/login",
    element: <LoginPage adminMode />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/transactions", element: <TransactionsPage /> },
      { path: "/alerts", element: <AlertsPage /> },
      { path: "/investigations", element: <InvestigationsPage /> },
      { path: "/investigations/detail", element: <InvestigationDetailPage /> },
      { path: "/model-monitoring", element: <ModelMonitoringPage /> },
      { path: "/fraud-simulator", element: <FraudSimulatorPage /> },
      {
        element: <AdminRoute />,
        children: [
          { path: "/admin", element: <Navigate to="/admin/overview" replace /> },
          { path: "/admin/overview", element: <DashboardPage /> },
          { path: "/admin/users", element: <AdminUsersPage /> },
          { path: "/admin/transactions", element: <TransactionsPage /> },
          { path: "/admin/alerts", element: <AlertsPage /> },
          { path: "/admin/investigations", element: <InvestigationsPage /> },
          { path: "/admin/model-monitoring", element: <ModelMonitoringPage /> },
        ],
      },
    ],
  },
  {
    path: "/unauthorized",
    element: <div className="page-content"><h1>403 - Unauthorized</h1><p>You do not have permission to view this page.</p></div>,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default router;