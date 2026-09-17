import { Search, Menu, Bell, User } from "lucide-react";
import { useBusiness } from "../../context/BusinessContext";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onOpenMobileSidebar }) {
  const { searchQuery, setSearchQuery, stats } = useBusiness();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/80 bg-white/70 px-4 sm:px-6 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        {/* Botón de Menú Móvil */}
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Abrir menú de navegación"
          className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/80 bg-white/60 text-slate-600 hover:bg-white lg:hidden shadow-xs"
        >
          <Menu size={20} />
        </button>

        {/* Buscador Global */}
        <div className="relative w-48 sm:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por negocio o teléfono..."
            className="w-full rounded-2xl border border-white/80 bg-white/60 pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 shadow-xs"
          />
        </div>
      </div>

      {/* Stats rápidas & Perfil */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Badge de estado rápido */}
        <div className="hidden md:flex items-center gap-2 glass-pill text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span><strong>{stats.activas}</strong> de {stats.total} activos</span>
        </div>

        {/* Notificaciones */}
        <button
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-white/80 bg-white/60 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-xs"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600 shadow-glow-blue" />
        </button>

        {/* Perfil Administrador */}
        <div className="flex items-center gap-3 border-l border-slate-200/80 pl-3 sm:pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white font-bold text-xs shadow-glow-blue">
            {user?.avatar || "CR"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">
              {user?.name || "Camila Restrepo"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 leading-none font-medium">
              {user?.role || "Administrador Platform"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
