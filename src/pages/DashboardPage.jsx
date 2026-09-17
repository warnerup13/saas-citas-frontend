import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Bot, CalendarCheck, Plus, Check, Mail, Calendar } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import EmpresaCard from "../components/dashboard/EmpresaCard";
import Modal from "../components/common/Modal";

export default function DashboardPage() {
  const {
    empresasFiltradas,
    searchQuery,
    setSearchQuery,
    toggleBotEmpresa,
    agregarEmpresa,
    stats,
  } = useBusiness();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoNegocio, setNuevoNegocio] = useState({
    nombre: "",
    rubro: "Peluquería",
    telefono: "+57 ",
    googleCalendarEmail: "",
  });

  const handleCrearNegocio = (e) => {
    e.preventDefault();
    if (!nuevoNegocio.nombre.trim()) return;
    agregarEmpresa({
      ...nuevoNegocio,
      servicios: [
        { id: Date.now(), nombre: "Servicio General", duracion: 30, precio: 30000, nota: "" }
      ]
    });
    setNuevoNegocio({ nombre: "", rubro: "Peluquería", telefono: "+57 ", googleCalendarEmail: "" });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0 w-full">
      {/* Header del Dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mis Negocios
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Gestiona el bot de WhatsApp, los horarios y las cuentas de Google Calendar.
          </p>
        </div>

        {/* Acciones principales & Stats */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto text-xs sm:text-sm py-2.5">
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

      {/* Lista de Comercios */}
      {empresasFiltradas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 sm:p-12 text-center">
          <Building2 size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm sm:text-base font-medium text-slate-800">
            No se encontraron negocios para "{searchQuery}"
          </p>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Intenta buscar con otro nombre, rubro o número de teléfono.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="btn-secondary mt-4 text-xs"
          >
            Limpiar búsqueda
          </button>
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
        title="Registrar Nuevo Comercio"
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
              placeholder="+57 300 123 4567"
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
                required
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
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-4">
              <Check size={15} /> Crear Comercio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
