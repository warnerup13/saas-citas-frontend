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

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/demo" element={<DemoPage />} />

      {/* 2. Portal Exclusivo para el Comercio (Encender/Apagar Bot & Google Calendar) */}
      <Route path="/comercio" element={<MerchantPortalPage />} />

      {/* 3. Panel de Super Administradores (Nosotros - Gestión Global) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
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
