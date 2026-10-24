import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, Bell, LogOut, ChevronDown, ShieldCheck, Mail } from "lucide-react";
import { useBusiness } from "../../context/BusinessContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Topbar({ onOpenMobileSidebar }) {
  const { searchQuery, setSearchQuery, stats } = useBusiness();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Cerrar menú desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    toast.info("Has cerrado sesión exitosamente.");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/80 bg-white/75 px-3 sm:px-6 backdrop-blur-2xl transition-all">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
        {/* Botón de Menú Móvil */}
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Abrir menú de navegación"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-slate-600 hover:bg-white lg:hidden shadow-xs active:scale-95 transition-all"
        >
          <Menu size={19} />
        </button>

        {/* Buscador Global Responsivo */}
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar negocio..."
            className="w-full rounded-2xl border border-white/80 bg-white/60 pl-8 sm:pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 shadow-xs"
          />
        </div>
      </div>

      {/* Stats rápidas, Botón de Salir & Perfil */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Badge de estado rápido */}
        <div className="hidden md:flex items-center gap-2 glass-pill text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            <strong>{stats.activas}</strong> de {stats.total} activos
          </span>
        </div>

        {/* Notificaciones */}
        <button
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-white/80 bg-white/60 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-xs active:scale-95"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600 shadow-glow-blue" />
        </button>

        {/* Botón directo de Cerrar Sesión en Módulo Administrativo (Desktop y Móvil) */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="flex items-center gap-1.5 rounded-2xl border border-red-200/80 bg-red-50/80 hover:bg-red-100 text-red-600 hover:text-red-700 px-2.5 sm:px-3 py-1.5 text-xs font-semibold shadow-xs active:scale-95 transition-all"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>

        {/* Perfil Administrador Interactivo con Dropdown */}
        <div className="relative border-l border-slate-200/80 pl-2 sm:pl-3" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-2xl p-1 hover:bg-white/80 transition-all text-left"
            aria-expanded={isProfileOpen}
            aria-label="Menú de perfil"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white font-bold text-xs shadow-glow-blue">
              {user?.avatar || "AD"}
            </div>
            <div className="hidden lg:block text-left max-w-[130px]">
              <p className="text-xs font-bold text-slate-900 leading-none truncate">
                {user?.name || "Administrador"}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 leading-none font-medium truncate">
                {user?.role === "admin" ? "Super Administrador" : user?.role || "Admin"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`hidden sm:block text-slate-400 transition-transform ${
                isProfileOpen ? "rotate-180 text-brand-600" : ""
              }`}
            />
          </button>

          {/* Menú Desplegable de Perfil */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-glass p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="pb-2.5 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white font-bold text-sm shadow-glow-blue">
                    {user?.avatar || "AD"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.name || "Administrador"}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                      <Mail size={11} className="shrink-0 text-slate-400" />
                      <span className="truncate">{user?.email || "admin@saas.com"}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-md px-2 py-0.5 uppercase tracking-wider">
                    <ShieldCheck size={11} /> Rol Administrador
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
