import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarCheck,
  Settings,
  LogOut,
  Sparkles,
  Bot,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { useBusiness } from "../../context/BusinessContext";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { stats } = useBusiness();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      to: "/dashboard",
      icon: Building2,
      label: "Mis Negocios",
      badge: stats.total,
    },
    {
      to: "/dashboard/citas",
      icon: CalendarCheck,
      label: "Agenda & Calendar",
      badge: `${stats.totalCitasSemana} citas`,
    },
    {
      to: "/dashboard/configuracion",
      icon: Settings,
      label: "Ajustes Generales",
    },
  ];

  return (
    <>
      {/* Backdrop overlay para pantallas móviles */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-white/80 bg-white/75 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-glass ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header de la Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue">
              <Bot size={20} />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
                mycitas<span className="text-cyan-500 font-normal text-sm">.glass</span>
              </span>
              <span className="ml-1.5 rounded-md bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold text-brand-700 uppercase tracking-wider border border-brand-200">
                Admin
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Links de navegación */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Gestión de Comercio
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-glow-blue font-bold border border-white"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-xs"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className="transition-colors group-hover:scale-105"
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-white/30 backdrop-blur-xs px-2 py-0.5 text-xs text-inherit font-medium border border-white/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Tarjeta de Estado Global del Bot */}
        <div className="p-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-4 text-white shadow-glass border border-white/10">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                WhatsApp Cloud Engine
              </span>
              <Sparkles size={14} className="text-cyan-300" />
            </div>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              <strong>{stats.activas}</strong> de <strong>{stats.total}</strong> negocios activos en tiempo real.
            </p>

            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{
                  width: `${(stats.activas / (stats.total || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer de la Sidebar */}
        <div className="border-t border-slate-100 p-4 space-y-2">
          <button
            onClick={() => navigate("/demo")}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-600" /> Ver Simulador Demo
            </span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} /> Ver Landing Pública
            </span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
