import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Phone, Heart, Sparkles } from "lucide-react";

export default function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50/60 font-sans relative overflow-x-hidden flex flex-col">
      {/* Sidebar Fija en Desktop y Drawer en Móvil */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Área Contenido Principal con margen a la izquierda en lg */}
      <div className="flex min-h-screen min-h-[100dvh] flex-col lg:pl-64 min-w-0 w-full flex-1">
        {/* Topbar Superior */}
        <Topbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Render de las subpáginas */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        {/* Footer Principal de la Interfaz */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-4 sm:py-5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                <span>mycitas</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">Plataforma SaaS</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Desarrollo y Soporte: <strong>Josberly Rodríguez</strong> & <strong>Wainerth Yépez</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs">
              <a
                href="https://wa.me/584247437909"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 transition-all font-medium shadow-2xs"
                title="Escribir por WhatsApp a Josberly Rodríguez"
              >
                <Phone size={13} className="text-emerald-600 shrink-0" />
                <span>Josberly Rodríguez:</span>
                <strong className="font-mono text-slate-900">0424-7437909</strong>
              </a>

              <a
                href="https://wa.me/584147107631"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 transition-all font-medium shadow-2xs"
                title="Escribir por WhatsApp a Wainerth Yépez"
              >
                <Phone size={13} className="text-emerald-600 shrink-0" />
                <span>Wainerth Yépez:</span>
                <strong className="font-mono text-slate-900">0414-7107631</strong>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
