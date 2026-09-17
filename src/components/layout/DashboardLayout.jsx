import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Toast from "../common/Toast";
import { useBusiness } from "../../context/BusinessContext";

export default function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { toast, showToast } = useBusiness();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50/60 font-sans relative overflow-x-hidden">
      {/* Sidebar Fija en Desktop y Drawer en Móvil */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Área Contenido Principal con margen a la izquierda en lg */}
      <div className="flex min-h-screen min-h-[100dvh] flex-col lg:pl-64 min-w-0 w-full">
        {/* Topbar Superior */}
        <Topbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Render de las subpáginas */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Toast de notificaciones globales */}
      <Toast toast={toast} onClose={() => showToast(null)} />
    </div>
  );
}
