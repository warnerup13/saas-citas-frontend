import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DemoPage from "../pages/DemoPage";
import MerchantPortalPage from "../pages/MerchantPortalPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import BusinessDetailPage from "../pages/BusinessDetailPage";
import AppointmentsPage from "../pages/AppointmentsPage";
import SettingsPage from "../pages/SettingsPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/demo" element={<DemoPage />} />

      {/* 2. Portal Exclusivo para el Comercio (Requiere estar autenticado con rol 'comercio' o 'business') */}
      <Route
        path="/comercio"
        element={
          <ProtectedRoute allowedRoles={["comercio", "business"]}>
            <MerchantPortalPage />
          </ProtectedRoute>
        }
      />

      {/* 3. Panel de Super Administradores (Requiere estar autenticado con rol 'admin') */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="empresa/:id" element={<BusinessDetailPage />} />
        <Route path="citas" element={<AppointmentsPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>

      {/* Fallback a Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

