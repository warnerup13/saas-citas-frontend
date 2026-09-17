import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  Power,
  Calendar,
  Clock,
  ExternalLink,
  LogOut,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Plus,
  Trash2,
  Smartphone,
  Info,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import Toast from "../components/common/Toast";

const DIAS_SEMANA = [
  { clave: "lun", nombre: "Lunes" },
  { clave: "mar", nombre: "Martes" },
  { clave: "mie", nombre: "Miércoles" },
  { clave: "jue", nombre: "Jueves" },
  { clave: "vie", nombre: "Viernes" },
  { clave: "sab", nombre: "Sábado" },
  { clave: "dom", nombre: "Domingo" },
];

export default function MerchantPortalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    empresas,
    toggleBotEmpresa,
    actualizarEmpresa,
    agregarCierre,
    eliminarCierre,
    toast,
    showToast,
  } = useBusiness();

  // Encontrar la empresa correspondiente al usuario logueado
  const empresaActual =
    empresas.find((e) => e.id === (user?.empresaId || 1)) || empresas[0];

  const [nuevoCierreFecha, setNuevoCierreFecha] = useState("");
  const [nuevoCierreMotivo, setNuevoCierreMotivo] = useState("");

  const handleToggleBot = () => {
    toggleBotEmpresa(empresaActual.id, !empresaActual.activo);
  };

  const handleCambioDia = (clave, abre, desde, hasta) => {
    const horarioActualizado = {
      ...empresaActual.horario,
      [clave]: {
        abre: abre !== undefined ? abre : empresaActual.horario[clave]?.abre ?? true,
        desde: desde || empresaActual.horario[clave]?.desde || "09:00",
        hasta: hasta || empresaActual.horario[clave]?.hasta || "19:00",
      },
    };
    actualizarEmpresa(empresaActual.id, { horario: horarioActualizado });
  };

  const handleAgregarCierre = (e) => {
    e.preventDefault();
    if (!nuevoCierreFecha) {
      showToast("Por favor selecciona una fecha", "info");
      return;
    }
    agregarCierre(empresaActual.id, {
      id: Date.now(),
      fecha: nuevoCierreFecha,
      motivo: nuevoCierreMotivo.trim() || "Cerrado por descanso / mantenimiento",
    });
    setNuevoCierreFecha("");
    setNuevoCierreMotivo("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const citasHoyCalendar = [
    { hora: "10:30 AM", servicio: "Corte de Cabello", cliente: "Carlos Méndez", estado: "Confirmada por Bot" },
    { hora: "01:00 PM", servicio: "Corte + Barba", cliente: "Andrés Restrepo", estado: "Confirmada por Bot" },
    { hora: "04:15 PM", servicio: "Corte de Cabello", cliente: "Mateo Giraldo", estado: "Confirmada por Bot" },
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans pb-20 selection:bg-brand-500 selection:text-white">
      <Toast toast={toast} />

      {/* Header del Portal de Comercio Nova Glass */}
      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white font-bold shadow-glow-blue">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-slate-900 text-base">
                  {empresaActual?.nombre || user?.name}
                </span>
                <span className="glass-pill-cyan text-[10px]">
                  PORTAL COMERCIO
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <Smartphone size={12} className="text-emerald-600" />
                WhatsApp: <strong>{empresaActual?.telefono || "+57 310 000 0000"}</strong>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.open("https://calendar.google.com", "_blank")}
              className="btn-secondary text-xs py-2 px-3.5"
            >
              <Calendar size={14} className="text-brand-600" />
              <span className="hidden sm:inline">Google Calendar</span>
              <ExternalLink size={12} className="text-slate-400" />
            </button>

            <button
              onClick={handleLogout}
              className="btn-danger text-xs py-2 px-3.5"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 space-y-8">
        
        {/* ============================================================ */}
        {/* 1. INTERRUPTOR MAESTRO DEL BOT NOVA GLASS */}
        {/* ============================================================ */}
        <section>
          <div
            className={`rounded-3xl border p-6 sm:p-8 transition-all duration-300 shadow-glass-lg relative overflow-hidden ${
              empresaActual?.activo
                ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-emerald-500/40 text-white"
                : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/20 text-white"
            }`}
          >
            {/* Resplandor ambiental interno */}
            <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl pointer-events-none ${
              empresaActual?.activo ? "bg-emerald-500/20" : "bg-amber-500/10"
            }`} />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20">
                  {empresaActual?.activo ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-300">Bot de WhatsApp Activo 24/7</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="text-amber-300">Bot en Pausa Temporal</span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                  {empresaActual?.activo
                    ? "El Bot está atendiendo y agendando citas en tiempo real"
                    : "El Bot está pausado y no agendará citas en este momento"}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {empresaActual?.activo
                    ? "Tus clientes reciben respuesta en menos de 1 segundo con la disponibilidad exacta de tu Google Calendar."
                    : "Los clientes recibirán un aviso cortés informando que las reservas automáticas están en pausa."}
                </p>
              </div>

              {/* Botón Switch Principal */}
              <div className="shrink-0 flex items-center">
                <button
                  onClick={handleToggleBot}
                  className={`group relative flex items-center gap-3 rounded-2xl px-6 py-4 font-extrabold text-sm sm:text-base transition-all duration-200 shadow-lg active:scale-95 border ${
                    empresaActual?.activo
                      ? "bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 border-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.4)]"
                      : "bg-slate-800 hover:bg-slate-700 text-white border-white/20 shadow-black/20"
                  }`}
                >
                  <Power size={22} className={empresaActual?.activo ? "text-slate-950" : "text-amber-400"} />
                  <span>{empresaActual?.activo ? "BOT ENCENDIDO" : "BOT APAGADO"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. SECCIÓN GOOGLE CALENDAR NOVA GLASS */}
        {/* ============================================================ */}
        <section className="glass-panel p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue">
                <CalendarDays size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-display font-bold text-slate-900">
                    Tu Google Calendar
                  </h2>
                  <span className="glass-pill-cyan text-[10px]">
                    <CheckCircle2 size={11} className="text-cyan-600" /> Sincronizado
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vinculado a: <strong className="text-brand-700">{empresaActual?.googleCalendarEmail || "agenda@gmail.com"}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => window.open("https://calendar.google.com", "_blank")}
              className="btn-primary text-xs sm:text-sm py-2.5 px-4 self-start sm:self-auto"
            >
              <Calendar size={15} />
              Ver en Google Calendar
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Citas sincronizadas */}
          <div className="mt-5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Próximas citas sincronizadas en tu agenda:
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              {citasHoyCalendar.map((cita, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/90 bg-white/70 p-4 shadow-xs hover:bg-white hover:shadow-glass transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="glass-pill-brand text-[10px] font-bold py-0.5 px-2">
                      <Clock size={11} />
                      {cita.hora}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      ● Sync OK
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{cita.servicio}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Cliente: {cita.cliente}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/70 p-3.5 flex items-start gap-2.5 text-xs text-cyan-900">
              <Info size={16} className="text-cyan-600 shrink-0 mt-0.5" />
              <span>
                <strong>Tip de automatización:</strong> Cualquier compromiso personal o bloqueo que agregues en tu Google Calendar hará que el bot respete ese espacio y no ofrezca ese horario a los clientes.
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. CONTROL DE HORARIOS Y DÍAS */}
        {/* ============================================================ */}
        <section className="glass-panel p-6 sm:p-7">
          <div className="pb-5 border-b border-slate-200/60">
            <h2 className="text-lg font-display font-bold text-slate-900">
              Horarios y Días de Atención
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Enciende o apaga los días que abre tu local y define las horas en que el bot puede agendar citas.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {DIAS_SEMANA.map((dia) => {
              const config = empresaActual?.horario?.[dia.clave] || {
                abre: true,
                desde: "09:00",
                hasta: "19:00",
              };

              return (
                <div
                  key={dia.clave}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                    config.abre
                      ? "border-white/90 bg-white/70 shadow-xs"
                      : "border-slate-200/50 bg-slate-100/50 opacity-70"
                  }`}
                >
                  {/* Interruptor del Día */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCambioDia(dia.clave, !config.abre)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.abre ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          config.abre ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div>
                      <span className="text-sm font-bold text-slate-900">
                        {dia.nombre}
                      </span>
                      <span
                        className={`ml-2 text-xs font-semibold ${
                          config.abre ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {config.abre ? "Abierto (Bot agenda)" : "Cerrado (Bot pausa)"}
                      </span>
                    </div>
                  </div>

                  {/* Horario Desde / Hasta */}
                  {config.abre ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-semibold">Desde:</span>
                      <input
                        type="time"
                        value={config.desde}
                        onChange={(e) =>
                          handleCambioDia(dia.clave, true, e.target.value, config.hasta)
                        }
                        className="rounded-xl border border-white bg-white/80 px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:border-brand-500"
                      />
                      <span className="text-slate-500 font-semibold">Hasta:</span>
                      <input
                        type="time"
                        value={config.hasta}
                        onChange={(e) =>
                          handleCambioDia(dia.clave, true, config.desde, e.target.value)
                        }
                        className="rounded-xl border border-white bg-white/80 px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:border-brand-500"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      El bot informará que este día no hay servicio
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. DÍAS DE CIERRE TEMPORAL (FESTIVOS / VACACIONES) */}
        {/* ============================================================ */}
        <section className="glass-panel p-6 sm:p-7">
          <div className="pb-5 border-b border-slate-200/60">
            <h2 className="text-lg font-display font-bold text-slate-900">
              Días Cerrados por Festivos o Vacaciones
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Si vas a cerrar tu local en una fecha especial, agrégala aquí y el bot pausará automáticamente ese día.
            </p>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleAgregarCierre}
            className="mt-5 grid gap-3 sm:grid-cols-12 items-end bg-white/60 border border-white/90 p-4 rounded-2xl shadow-xs"
          >
            <div className="sm:col-span-4">
              <label className="label-base">
                Fecha de Cierre
              </label>
              <input
                type="date"
                value={nuevoCierreFecha}
                onChange={(e) => setNuevoCierreFecha(e.target.value)}
                className="input-base text-xs py-2"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="label-base">
                Motivo del Cierre
              </label>
              <input
                type="text"
                value={nuevoCierreMotivo}
                onChange={(e) => setNuevoCierreMotivo(e.target.value)}
                placeholder="Ej. Aniversario, Festivo, Capacitación"
                className="input-base text-xs py-2"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                Agregar Fecha
              </button>
            </div>
          </form>

          {/* Lista de cierres programados */}
          <div className="mt-5 space-y-2.5">
            {(!empresaActual?.cierres || empresaActual.cierres.length === 0) ? (
              <p className="text-xs text-slate-400 italic py-2">
                No tienes días cerrados especiales programados.
              </p>
            ) : (
              empresaActual.cierres.map((cierre) => (
                <div
                  key={cierre.id}
                  className="flex items-center justify-between rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                      <Calendar size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {cierre.fecha}
                      </p>
                      <p className="text-xs text-amber-900 font-medium">
                        {cierre.motivo || "Cerrado"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => eliminarCierre(empresaActual.id, cierre.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar día cerrado"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
