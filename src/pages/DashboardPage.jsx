import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  Bot,
  CalendarCheck,
  Plus,
  Check,
  Mail,
  Calendar,
  RefreshCw,
  Server,
  Lock,
  Sparkles,
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { useAuth } from "../context/AuthContext";
import EmpresaCard from "../components/dashboard/EmpresaCard";
import Modal from "../components/common/Modal";

export default function DashboardPage() {
  const {
    empresasFiltradas,
    searchQuery,
    setSearchQuery,
    toggleBotEmpresa,
    agregarEmpresa,
    cargarEmpresas,
    isLoading,
    isBackendLoaded,
    error,
    stats,
  } = useBusiness();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nuevoNegocio, setNuevoNegocio] = useState({
    nombre: "",
    email: "",
    password: "password123",
    rubro: "Peluquería",
    telefono: "+58 412 123 4567",
    googleCalendarEmail: "",
  });

  // Cargar comercios desde /api/business al montar el componente solo si es administrador
  useEffect(() => {
    if (isAdmin || user?.role === "admin") {
      cargarEmpresas();
    }
  }, [cargarEmpresas, isAdmin, user?.role]);

  const handleCrearNegocio = async (e) => {
    e.preventDefault();
    if (!nuevoNegocio.nombre.trim()) return;
    setIsSubmitting(true);
    try {
      await agregarEmpresa({
        ...nuevoNegocio,
        servicios: [
          { id: Date.now(), nombre: "Servicio General", duracion: 30, precio: 30000, nota: "" }
        ]
      });
      setNuevoNegocio({
        nombre: "",
        email: "",
        password: "password123",
        rubro: "Peluquería",
        telefono: "+58 412 123 4567",
        googleCalendarEmail: "",
      });
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0 w-full">
      {/* Header del Dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mis Negocios
            </h1>
            {isBackendLoaded ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                API Conectada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Server size={11} className="text-slate-400" />
                Modo Demo
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Gestiona el bot de WhatsApp, los comercios conectados y los tokens administrativos.
          </p>
        </div>

        {/* Acciones principales & Stats */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => cargarEmpresas()}
            disabled={isLoading}
            title="Refrescar datos desde la API /api/business"
            className="btn-secondary text-xs sm:text-sm py-2.5 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin text-brand-600" : "text-slate-500"} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto text-xs sm:text-sm py-2.5 cursor-pointer">
            <Plus size={16} /> Agregar Negocio
          </button>

          <div className="hidden xl:flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl glass-card px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
                <Bot size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Respondiendo</p>
                <p className="text-xs font-bold text-slate-900">{stats.activas} / {stats.total}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl glass-card px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue font-bold">
                <CalendarCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Citas semana</p>
                <p className="text-xs font-bold text-slate-900">{stats.totalCitasSemana}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtro y Contador */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Comercios Registrados ({empresasFiltradas.length})
        </p>

        <div className="relative w-full max-w-[200px] sm:hidden">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="input-base pl-8 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Estado de Carga */}
      {isLoading && empresasFiltradas.length === 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : empresasFiltradas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 sm:p-12 text-center">
          <Building2 size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm sm:text-base font-medium text-slate-800">
            {searchQuery ? `No se encontraron negocios para "${searchQuery}"` : "No hay comercios registrados en la base de datos."}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {searchQuery
              ? "Intenta buscar con otro nombre, rubro o número de teléfono."
              : "Haz clic en 'Agregar Negocio' para registrar el primer comercio del SaaS."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="btn-secondary mt-4 text-xs cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary mt-4 text-xs cursor-pointer"
            >
              <Plus size={14} /> Registrar Comercio
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {empresasFiltradas.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              onToggle={(id, val) => toggleBotEmpresa(id, val)}
              onAbrir={(id) => navigate(`/dashboard/empresa/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Modal para Crear Negocio */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Comercio en el SaaS"
      >
        <form onSubmit={handleCrearNegocio} className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="label-base">Nombre del Comercio</label>
            <input
              type="text"
              required
              value={nuevoNegocio.nombre}
              onChange={(e) => setNuevoNegocio({ ...nuevoNegocio, nombre: e.target.value })}
              placeholder="Ej: Barbería Capital"
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-base">Correo del Comercio</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={nuevoNegocio.email}
                  onChange={(e) => setNuevoNegocio({ ...nuevoNegocio, email: e.target.value })}
                  placeholder="contacto@barberia.com"
                  className="input-base pl-9 sm:pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-base">Contraseña Inicial</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={nuevoNegocio.password}
                  onChange={(e) => setNuevoNegocio({ ...nuevoNegocio, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-base pl-9 sm:pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label-base">Rubro / Categoría</label>
            <select
              value={nuevoNegocio.rubro}
              onChange={(e) => setNuevoNegocio({ ...nuevoNegocio, rubro: e.target.value })}
              className="input-base"
            >
              <option value="Peluquería">Peluquería</option>
              <option value="Barbería">Barbería</option>
              <option value="Spas & Uñas">Spas & Uñas</option>
              <option value="Consultorio Medico">Consultorio Médico</option>
              <option value="Estética & Spa">Estética & Spa</option>
            </select>
          </div>

          <div>
            <label className="label-base">Teléfono de WhatsApp del Local</label>
            <input
              type="text"
              required
              value={nuevoNegocio.telefono}
              onChange={(e) => setNuevoNegocio({ ...nuevoNegocio, telefono: e.target.value })}
              placeholder="+58 412 123 4567"
              className="input-base"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label-base mb-0">Correo Google Calendar</label>
              <span className="text-[10px] sm:text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                <Calendar size={12} /> Sync Automático
              </span>
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={nuevoNegocio.googleCalendarEmail}
                onChange={(e) => setNuevoNegocio({ ...nuevoNegocio, googleCalendarEmail: e.target.value })}
                placeholder="agenda.negocio@gmail.com"
                className="input-base pl-9 sm:pl-10"
              />
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-500 leading-normal">
              La cuenta donde el bot consultará y bloqueará la disponibilidad.
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-2 px-4 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Crear Comercio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

