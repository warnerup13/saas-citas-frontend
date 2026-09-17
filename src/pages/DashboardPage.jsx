import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mis Negocios
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona el bot de WhatsApp, los horarios y las cuentas de Google Calendar.
          </p>
        </div>

        {/* Acciones principales & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Agregar Negocio
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

      {/* Barra de Filtro y Buscador en móvil/tablet */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Comercios Registrados ({empresasFiltradas.length})
        </p>

        <div className="relative w-full max-w-xs sm:hidden">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="input-base pl-9 py-2 text-xs"
          />
        </div>
      </div>

      {/* Lista de Comercios */}
      {empresasFiltradas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-base font-medium text-slate-800">
            No se encontraron negocios para "{searchQuery}"
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Intenta buscar con otro nombre, rubro o número de teléfono.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="btn-secondary mt-4"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
        <form onSubmit={handleCrearNegocio} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-base mb-0">Correo vinculado a Google Calendar</label>
              <span className="text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                <Calendar size={12} /> Sync Automático
              </span>
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={nuevoNegocio.googleCalendarEmail}
                onChange={(e) => setNuevoNegocio({ ...nuevoNegocio, googleCalendarEmail: e.target.value })}
                placeholder="agenda.negocio@gmail.com"
                className="input-base pl-10"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              La cuenta de Google Calendar donde el bot agendará y consultará la disponibilidad en tiempo real.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary text-xs">
              <Check size={16} /> Crear Comercio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
