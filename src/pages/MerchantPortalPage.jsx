import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Power,
  Calendar,
  Clock,
  ExternalLink,
  LogOut,
  CheckCircle2,
  CalendarDays,
  Plus,
  Trash2,
  Smartphone,
  Info,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Users,
  User,
  Search,
  MessageCircle,
  ArrowLeft,
  Sliders,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useToast } from "../context/ToastContext";
import { settingsService } from "../services";

const DIAS_SEMANA = [
  { clave: "lun", nombre: "Lunes", diaNumero: 1 },
  { clave: "mar", nombre: "Martes", diaNumero: 2 },
  { clave: "mie", nombre: "Miércoles", diaNumero: 3 },
  { clave: "jue", nombre: "Jueves", diaNumero: 4 },
  { clave: "vie", nombre: "Viernes", diaNumero: 5 },
  { clave: "sab", nombre: "Sábado", diaNumero: 6 },
  { clave: "dom", nombre: "Domingo", diaNumero: 7 },
];

export default function MerchantPortalPage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { empresas, toggleBotEmpresa, actualizarEmpresa } = useBusiness();
  const { toast } = useToast();

  const empresaActual =
    empresas.find((e) => e.id === (user?.empresaId || 1)) || empresas[0];

  // Pestaña activa ('configuracion' o 'conversaciones')
  const [tabActiva, setTabActiva] = useState("configuracion");

  // Estado local sincronizado con el backend
  const [botActivo, setBotActivo] = useState(
    user?.isBotActive !== undefined ? user.isBotActive : empresaActual?.activo ?? true
  );
  const [horario, setHorario] = useState(
    empresaActual?.horario || {
      lun: { abre: true, desde: "09:00", hasta: "19:00" },
      mar: { abre: true, desde: "09:00", hasta: "19:00" },
      mie: { abre: true, desde: "09:00", hasta: "19:00" },
      jue: { abre: true, desde: "09:00", hasta: "19:00" },
      vie: { abre: true, desde: "09:00", hasta: "19:00" },
      sab: { abre: true, desde: "10:00", hasta: "15:00" },
      dom: { abre: false, desde: "09:00", hasta: "13:00" },
    }
  );
  const [feriados, setFeriados] = useState(
    empresaActual?.cierres || [
      { id: "10", fecha: "2026-12-25", motivo: "Navidad" },
      { id: "11", fecha: "2027-01-01", motivo: "Año Nuevo" },
    ]
  );

  const [nuevoCierreFecha, setNuevoCierreFecha] = useState("");
  const [nuevoCierreMotivo, setNuevoCierreMotivo] = useState("");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isUpdatingBot, setIsUpdatingBot] = useState(false);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [citasCalendar, setCitasCalendar] = useState([]);
  const [isLoadingCitas, setIsLoadingCitas] = useState(false);
  const [calendarEmailReal, setCalendarEmailReal] = useState(null);
  const [mostrarTodasCitas, setMostrarTodasCitas] = useState(false);
  const LIMITE_CITAS = 6;

  // Estados para Clientes y Conversaciones de WhatsApp
  const [clientes, setClientes] = useState([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [conversacion, setConversacion] = useState([]);
  const [isLoadingConversacion, setIsLoadingConversacion] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");

  // Cargar citas reales de Google Calendar
  const cargarCitasCalendar = async () => {
    setIsLoadingCitas(true);
    try {
      const res = await settingsService.getCalendarAppointments(20);
      if (res?.appointments) {
        setCitasCalendar(res.appointments);
        if (res.calendarId) setCalendarEmailReal(res.calendarId);
      }
    } catch (err) {
      console.log("Modo offline o error al consultar citas de Google Calendar:", err?.message);
    } finally {
      setIsLoadingCitas(false);
    }
  };

  // Cargar datos iniciales del backend si hay token
  const cargarDatosBackend = async () => {
    try {
      // 1. Cargar Horarios
      const scheduleRes = await settingsService.getSchedule();
      if (scheduleRes?.data) {
        const formattedSchedule = settingsService.formatScheduleForUi(scheduleRes.data);
        setHorario(formattedSchedule);
      }
    } catch (err) {
      // Si falla por ser primera carga o modo offline, no bloquear
      console.log("Modo offline o backend sin horarios previos:", err?.message);
    }

    try {
      // 2. Cargar Feriados
      const holidaysRes = await settingsService.getHolidays();
      if (holidaysRes?.data) {
        const mappedHolidays = holidaysRes.data.map((h) => ({
          id: h.id,
          fecha: h.closed_date,
          motivo: h.reason,
        }));
        setFeriados(mappedHolidays);
      }
    } catch (err) {
      console.log("Modo offline o backend sin feriados:", err?.message);
    }

    // 3. Cargar Citas en vivo de Google Calendar
    await cargarCitasCalendar();

    // 4. Cargar Clientes registrados en WhatsApp
    await cargarClientes();
  };

  // Cargar lista de clientes y prospectos de WhatsApp
  const cargarClientes = async () => {
    setIsLoadingClientes(true);
    try {
      const res = await settingsService.getClients(100);
      if (res?.data) {
        setClientes(res.data);
        if (clienteSeleccionado) {
          const match = res.data.find((c) => c.phone_number === clienteSeleccionado.phone_number);
          if (match) setClienteSeleccionado(match);
        }
      }
    } catch (err) {
      console.log("Error al cargar clientes:", err?.message);
    } finally {
      setIsLoadingClientes(false);
    }
  };

  // Cargar conversación completa con un cliente seleccionado
  const handleSeleccionarCliente = async (cliente) => {
    setClienteSeleccionado(cliente);
    setIsLoadingConversacion(true);
    try {
      const res = await settingsService.getConversation(cliente.phone_number, 150);
      if (res?.data) {
        setConversacion(res.data);
      } else {
        setConversacion([]);
      }
    } catch (err) {
      console.log("Error al cargar conversación:", err?.message);
      setConversacion([]);
    } finally {
      setIsLoadingConversacion(false);
    }
  };

  useEffect(() => {
    cargarDatosBackend();
  }, []);

  // 1. Alternar Estado del Bot (PUT /api/settings/bot-status)
  const handleToggleBot = async () => {
    const nuevoEstado = !botActivo;
    setIsUpdatingBot(true);

    try {
      const res = await settingsService.updateBotStatus(nuevoEstado);
      setBotActivo(nuevoEstado);
      if (user) {
        setUser((prev) => ({ ...prev, isBotActive: nuevoEstado }));
      }
      toggleBotEmpresa(empresaActual.id, nuevoEstado, true);
      toast.success(
        res.message || (nuevoEstado ? "Bot activado exitosamente." : "Bot pausado exitosamente."),
        {
          titulo: nuevoEstado ? "Bot WhatsApp Encendido" : "Bot WhatsApp en Pausa",
        }
      );
    } catch (error) {
      // Fallback local con toast informativo
      setBotActivo(nuevoEstado);
      toggleBotEmpresa(empresaActual.id, nuevoEstado, true);
      toast.error(error?.message || "No se pudo actualizar el estado del bot en el servidor.", {
        titulo: "Error al actualizar Bot",
      });
    } finally {
      setIsUpdatingBot(false);
    }
  };

  // 2. Modificar un día en memoria
  const handleCambioDia = (clave, abre, desde, hasta) => {
    setHorario((prev) => ({
      ...prev,
      [clave]: {
        abre: abre !== undefined ? abre : prev[clave]?.abre ?? true,
        desde: desde || prev[clave]?.desde || "09:00",
        hasta: hasta || prev[clave]?.hasta || "19:00",
      },
    }));
  };

  // 3. Guardar Horarios Semanales (PUT /api/settings/schedule)
  const handleGuardarHorarios = async () => {
    setIsSavingSchedule(true);
    const schedulePayload = settingsService.formatScheduleForApi(horario);

    try {
      const res = await settingsService.updateSchedule(schedulePayload);
      actualizarEmpresa(empresaActual.id, { horario }, true);
      toast.success(res.message || "Horarios de atención actualizados exitosamente.", {
        titulo: "Horarios Sincronizados",
      });
    } catch (error) {
      actualizarEmpresa(empresaActual.id, { horario }, true);
      toast.error(error?.message || "Error al sincronizar horarios con el servidor.", {
        titulo: "Error al guardar horarios",
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // 4. Agregar Feriado (POST /api/settings/holidays)
  const handleAgregarCierre = async (e) => {
    e.preventDefault();
    if (!nuevoCierreFecha) {
      toast.warning("Por favor selecciona una fecha de cierre");
      return;
    }

    setIsAddingHoliday(true);
    const motivoTexto = nuevoCierreMotivo.trim() || "Día festivo / Cierre";

    try {
      const res = await settingsService.createHoliday({
        date: nuevoCierreFecha,
        reason: motivoTexto,
      });

      const nuevoFeriado = {
        id: res.data?.id || Date.now(),
        fecha: res.data?.closed_date || nuevoCierreFecha,
        motivo: res.data?.reason || motivoTexto,
      };

      setFeriados((prev) => [...prev, nuevoFeriado].sort((a, b) => a.fecha.localeCompare(b.fecha)));
      setNuevoCierreFecha("");
      setNuevoCierreMotivo("");
      toast.success(res.message || "Día feriado registrado exitosamente.", {
        titulo: "Fecha no laborable agregada",
      });
    } catch (error) {
      // Registrar localmente y mostrar toast con diagnóstico
      const nuevoFeriado = {
        id: Date.now(),
        fecha: nuevoCierreFecha,
        motivo: motivoTexto,
      };
      setFeriados((prev) => [...prev, nuevoFeriado].sort((a, b) => a.fecha.localeCompare(b.fecha)));
      setNuevoCierreFecha("");
      setNuevoCierreMotivo("");
      toast.error(error, {
        titulo: "Fallo al guardar feriado en backend",
      });
    } finally {
      setIsAddingHoliday(false);
    }
  };

  // 5. Eliminar Feriado (DELETE /api/settings/holidays/:id)
  const handleEliminarCierre = async (id) => {
    try {
      const res = await settingsService.deleteHoliday(id);
      setFeriados((prev) => prev.filter((c) => c.id !== id));
      toast.info(res.message || "Día feriado eliminado exitosamente.", {
        titulo: "Fecha eliminada",
      });
    } catch (error) {
      setFeriados((prev) => prev.filter((c) => c.id !== id));
      toast.error(error, {
        titulo: "Error al eliminar feriado del servidor",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast.info("Has cerrado sesión exitosamente.");
    navigate("/login");
  };

  const calendarEmail = calendarEmailReal || user?.email || empresaActual?.googleCalendarEmail || "";

  const handleOpenCalendar = () => {
    if (calendarEmail) {
      window.open(`https://calendar.google.com/calendar/r?authuser=${encodeURIComponent(calendarEmail)}`, "_blank");
    } else {
      window.open("https://calendar.google.com", "_blank");
    }
  };

  const formatearFechaHora = (isoStr) => {
    if (!isoStr) return { fecha: "", hora: "" };
    try {
      const d = new Date(isoStr);
      return {
        fecha: d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }),
        hora: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    } catch {
      return { fecha: isoStr, hora: "" };
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    if (!filtroCliente) return true;
    const term = filtroCliente.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone_number && c.phone_number.includes(term))
    );
  });

  return (
    <div className="min-h-screen text-slate-900 font-sans pb-20 selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Header del Portal de Comercio Nova Glass */}
      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 sm:px-6 py-3 sm:py-3.5 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white font-bold shadow-glow-blue">
              <Bot size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-bold text-slate-900 text-sm sm:text-base truncate">
                  {user?.name || empresaActual?.nombre}
                </span>
                <span className="glass-pill-cyan text-[9px] sm:text-[10px] shrink-0">
                  PORTAL COMERCIO
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium truncate">
                <Smartphone size={11} className="text-emerald-600 shrink-0" />
                <span className="truncate">{user?.whatsappNumber || empresaActual?.telefono || "+58 412 123 4567"}</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenCalendar}
              className="btn-secondary text-xs py-1.5 sm:py-2 px-2.5 sm:px-3.5"
              aria-label="Abrir Google Calendar"
            >
              <Calendar size={13} className="text-brand-600" />
              <span className="hidden sm:inline">Google Calendar</span>
              <ExternalLink size={11} className="text-slate-400" />
            </button>

            <button
              onClick={handleLogout}
              className="btn-danger text-xs py-1.5 sm:py-2 px-2.5 sm:px-3.5"
              aria-label="Cerrar sesión"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Selector de Pestañas Nova Glass */}
      <div className="mx-auto max-w-5xl px-3.5 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-xs w-full sm:w-fit">
          <button
            onClick={() => setTabActiva("configuracion")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tabActiva === "configuracion"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <Sliders size={15} />
            <span>Configuración y Horarios</span>
          </button>

          <button
            onClick={() => {
              setTabActiva("conversaciones");
              cargarClientes();
            }}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tabActiva === "conversaciones"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <MessageSquare size={15} className={tabActiva === "conversaciones" ? "text-emerald-400" : "text-emerald-600"} />
            <span>Clientes y Mensajes</span>
            {clientes.length > 0 && (
              <span className="ml-0.5 rounded-full bg-emerald-500/20 text-emerald-700 font-extrabold px-2 py-0.5 text-[10px]">
                {clientes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="mx-auto max-w-5xl px-3.5 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8 min-w-0">
        {tabActiva === "configuracion" ? (
          <>
            <section>
              <div
                className={`rounded-3xl border p-5 sm:p-8 transition-all duration-300 shadow-glass-lg relative overflow-hidden ${
              botActivo
                ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-emerald-500/40 text-white"
                : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/20 text-white"
            }`}
          >
            <div className={`absolute -right-20 -top-20 h-56 sm:h-64 w-56 sm:w-64 rounded-full blur-3xl pointer-events-none ${
              botActivo ? "bg-emerald-500/20" : "bg-amber-500/10"
            }`} />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20">
                  {botActivo ? (
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

                <h1 className="text-xl sm:text-3xl font-display font-extrabold tracking-tight leading-tight">
                  {botActivo
                    ? "El Bot está atendiendo y agendando citas"
                    : "El Bot está pausado y no agendará citas"}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {botActivo
                    ? "Tus clientes reciben respuesta en menos de 1 segundo con la disponibilidad exacta de tu Google Calendar."
                    : "Los clientes recibirán un aviso cortés informando que las reservas automáticas están en pausa."}
                </p>
              </div>

              {/* Botón Switch Principal */}
              <div className="shrink-0 flex items-center w-full sm:w-auto">
                <button
                  onClick={handleToggleBot}
                  disabled={isUpdatingBot}
                  className={`group relative flex items-center justify-center gap-2.5 sm:gap-3 rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 font-extrabold text-xs sm:text-base transition-all duration-200 shadow-lg active:scale-95 border w-full sm:w-auto cursor-pointer ${
                    botActivo
                      ? "bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 border-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.4)]"
                      : "bg-slate-800 hover:bg-slate-700 text-white border-white/20 shadow-black/20"
                  }`}
                >
                  <Power size={20} className={botActivo ? "text-slate-950" : "text-amber-400"} />
                  <span>{botActivo ? "BOT ENCENDIDO" : "BOT APAGADO"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. SECCIÓN GOOGLE CALENDAR NOVA GLASS */}
        {/* ============================================================ */}
        <section className="glass-panel p-4 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-slate-200/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue">
                <CalendarDays size={20} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                    Tu Google Calendar
                  </h2>
                  <span className="glass-pill-cyan text-[10px]">
                    <CheckCircle2 size={11} className="text-cyan-600" /> Sync En Vivo
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Vinculado: <strong className="text-brand-700">{calendarEmail || "agenda@gmail.com"}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={cargarCitasCalendar}
                disabled={isLoadingCitas}
                className="btn-secondary text-xs sm:text-sm py-2 px-3 cursor-pointer"
                title="Refrescar citas desde Google Calendar"
              >
                <RefreshCw size={13} className={isLoadingCitas ? "animate-spin text-brand-600" : ""} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              <button
                onClick={handleOpenCalendar}
                className="btn-primary text-xs sm:text-sm py-2 px-4 cursor-pointer"
              >
                <Calendar size={14} />
                Ver en Calendar
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Citas sincronizadas */}
          <div className="mt-4 sm:mt-5">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Próximas citas agendadas ({citasCalendar.length}):
              </h3>
              {isLoadingCitas && (
                <span className="text-[11px] text-brand-600 flex items-center gap-1 font-semibold">
                  <RefreshCw size={11} className="animate-spin" /> Sincronizando con Google...
                </span>
              )}
            </div>

            {citasCalendar.length === 0 && !isLoadingCitas ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <CalendarDays size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-slate-600">No hay citas próximas en tu Google Calendar</p>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Cuando un cliente agende una cita mediante WhatsApp, se sincronizará automáticamente aquí y en tu calendario.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-3">
                  {(mostrarTodasCitas ? citasCalendar : citasCalendar.slice(0, LIMITE_CITAS)).map((cita) => {
                    const fh = formatearFechaHora(cita.start);
                    return (
                      <div
                        key={cita.id}
                        className="rounded-2xl border border-white/90 bg-white/70 p-3.5 sm:p-4 shadow-xs hover:bg-white hover:shadow-glass transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-1">
                            <span className="glass-pill-brand text-[10px] font-bold py-0.5 px-2 truncate">
                              <Clock size={11} className="shrink-0" />
                              {fh.fecha ? `${fh.fecha} · ${fh.hora}` : cita.start}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold shrink-0">
                              ● Agendada
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={cita.service}>
                            {cita.service}
                          </p>
                          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                            📱 {cita.clientPhone}
                          </p>
                        </div>

                        {cita.htmlLink && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                            <a
                              href={cita.htmlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700 font-semibold"
                            >
                              Abrir cita <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Botón desplegable para ver todas las citas */}
                {citasCalendar.length > LIMITE_CITAS && (
                  <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Mostrando {mostrarTodasCitas ? citasCalendar.length : LIMITE_CITAS} de {citasCalendar.length} citas
                    </span>
                    <button
                      onClick={() => setMostrarTodasCitas(!mostrarTodasCitas)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3.5 py-1.5 rounded-xl border border-brand-200/60 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {mostrarTodasCitas ? (
                        <>
                          <ChevronUp size={14} /> Mostrar solo las {LIMITE_CITAS} primeras
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} /> Desplegar todas (+{citasCalendar.length - LIMITE_CITAS} citas)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-3.5 sm:mt-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/70 p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-cyan-900">
              <Info size={15} className="text-cyan-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Tip de sincronización:</strong> Las citas se leen en tiempo real de Google Calendar. Cualquier bloqueo de agenda que hagas en Google Calendar será respetado inmediatamente por el bot de WhatsApp.
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. CONTROL DE HORARIOS Y DÍAS */}
        {/* ============================================================ */}
        <section className="glass-panel p-4 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-200/60">
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                Horarios y Días de Atención Semanal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Enciende o apaga los días que abre tu local y define las horas en que el bot puede agendar citas.
              </p>
            </div>

            <button
              onClick={handleGuardarHorarios}
              disabled={isSavingSchedule}
              className="btn-primary text-xs py-2 px-4 self-start sm:self-auto flex items-center gap-1.5"
            >
              {isSavingSchedule ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Guardar Horarios
                </>
              )}
            </button>
          </div>

          <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3">
            {DIAS_SEMANA.map((dia) => {
              const config = horario[dia.clave] || {
                abre: true,
                desde: "09:00",
                hasta: "19:00",
              };

              return (
                <div
                  key={dia.clave}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-4 transition-all ${
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
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {dia.nombre}
                      </span>
                      <span
                        className={`ml-2 text-[11px] sm:text-xs font-semibold ${
                          config.abre ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {config.abre ? "Abierto" : "Cerrado"}
                      </span>
                    </div>
                  </div>

                  {/* Horario Desde / Hasta */}
                  {config.abre ? (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs pl-14 sm:pl-0">
                      <span className="text-slate-500 font-semibold">Desde:</span>
                      <input
                        type="time"
                        value={config.desde}
                        onChange={(e) =>
                          handleCambioDia(dia.clave, true, e.target.value, config.hasta)
                        }
                        className="rounded-xl border border-white bg-white/90 px-2 py-1 font-bold text-slate-800 outline-none focus:border-brand-500 text-xs shadow-xs"
                      />
                      <span className="text-slate-500 font-semibold">Hasta:</span>
                      <input
                        type="time"
                        value={config.hasta}
                        onChange={(e) =>
                          handleCambioDia(dia.clave, true, config.desde, e.target.value)
                        }
                        className="rounded-xl border border-white bg-white/90 px-2 py-1 font-bold text-slate-800 outline-none focus:border-brand-500 text-xs shadow-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic pl-14 sm:pl-0">
                      El bot pausará reservas este día
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. DÍAS DE CIERRE TEMPORAL (FERIADOS / VACACIONES) */}
        {/* ============================================================ */}
        <section className="glass-panel p-4 sm:p-7">
          <div className="pb-4 sm:pb-5 border-b border-slate-200/60">
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
              Días Cerrados por Festivos o Vacaciones
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Si vas a cerrar tu local en una fecha especial, agrégala aquí y el bot pausará automáticamente ese día.
            </p>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleAgregarCierre}
            className="mt-4 sm:mt-5 grid gap-3 sm:grid-cols-12 items-end bg-white/60 border border-white/90 p-3.5 sm:p-4 rounded-2xl shadow-xs"
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
                placeholder="Ej. Navidad, Año Nuevo, Vacaciones"
                className="input-base text-xs py-2"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={isAddingHoliday}
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isAddingHoliday ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={15} />}
                <span>Agregar Fecha</span>
              </button>
            </div>
          </form>

          {/* Lista de cierres programados */}
          <div className="mt-4 sm:mt-5 space-y-2.5">
            {feriados.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center sm:text-left">
                No tienes días cerrados especiales programados.
              </p>
            ) : (
              feriados.map((cierre) => (
                <div
                  key={cierre.id}
                  className="flex items-center justify-between rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3 sm:p-3.5 min-w-0"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                      <Calendar size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900">
                        {cierre.fecha}
                      </p>
                      <p className="text-[11px] sm:text-xs text-amber-900 font-medium truncate">
                        {cierre.motivo || "Cerrado"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEliminarCierre(cierre.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar día cerrado"
                    aria-label="Eliminar día cerrado"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
        </>
      ) : (
        /* ============================================================ */
        /* VISTA DE CONVERSACIONES Y CLIENTES (AUDITORÍA COMPLETA)     */
        /* ============================================================ */
        <section className="glass-panel p-4 sm:p-6 overflow-hidden">
          {/* Header de la sección */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <MessageCircle size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                  Registro de Clientes y Mensajes de WhatsApp
                </h2>
                <p className="text-xs text-slate-500">
                  Audita y visualiza en tiempo real las conversaciones que el bot mantiene con tus clientes y prospectos.
                </p>
              </div>
            </div>

            <button
              onClick={cargarClientes}
              disabled={isLoadingClientes}
              className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={isLoadingClientes ? "animate-spin text-brand-600" : ""} />
              <span>Actualizar Lista</span>
            </button>
          </div>

          {/* Layout dividido: Directorio de Clientes (izq) y Chat Historial (der) */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[520px]">
            {/* 1. Directorio de Clientes (Lado Izquierdo) */}
            <div className={`lg:col-span-4 flex flex-col rounded-2xl border border-slate-200/80 bg-white/60 p-3 ${clienteSeleccionado ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Contactos ({clientesFiltrados.length})
                </span>
                {isLoadingClientes && (
                  <span className="text-[10px] text-brand-600 font-semibold flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Cargando
                  </span>
                )}
              </div>

              {/* Buscador */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  placeholder="Buscar por nombre o teléfono..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Contenedor de lista */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[460px]">
                {isLoadingClientes && clientes.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-brand-600" />
                    Cargando directorio de clientes...
                  </div>
                ) : clientesFiltrados.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400 px-4">
                    <Users size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No hay clientes aún</p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      Cuando un cliente escriba al bot de WhatsApp, quedará registrado automáticamente aquí.
                    </p>
                  </div>
                ) : (
                  clientesFiltrados.map((cli) => {
                    const isSelected = clienteSeleccionado?.phone_number === cli.phone_number;
                    const fechaUltima = cli.updated_at ? formatearFechaHora(cli.updated_at) : null;

                    return (
                      <div
                        key={cli.id}
                        onClick={() => handleSeleccionarCliente(cli)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-brand-50 border-brand-300 shadow-sm"
                            : "bg-white/80 border-slate-200/70 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-xs shadow-xs">
                          {cli.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {cli.name || "Cliente WhatsApp"}
                            </p>
                            {cli.total_appointments > 0 && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                                {cli.total_appointments} cita{cli.total_appointments > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <Smartphone size={10} className="text-emerald-600 shrink-0" />
                            <span>{cli.phone_number}</span>
                          </p>
                          {cli.last_interaction && (
                            <p className="text-[10px] text-slate-400 truncate mt-1">
                              {cli.last_interaction.sender === 'bot' ? '🤖 ' : '👤 '}
                              {cli.last_interaction.content}
                            </p>
                          )}
                          {fechaUltima?.fecha && (
                            <p className="text-[9px] text-slate-300 text-right mt-0.5">
                              {fechaUltima.fecha}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Visor de Conversación (Lado Derecho) */}
            <div className={`lg:col-span-8 flex flex-col rounded-2xl border border-slate-200/80 bg-white/70 overflow-hidden ${!clienteSeleccionado ? 'hidden lg:flex' : 'flex'}`}>
              {clienteSeleccionado ? (
                <>
                  {/* Top Bar del Chat */}
                  <div className="p-3.5 border-b border-slate-200 bg-white/90 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => setClienteSeleccionado(null)}
                        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                        title="Volver a la lista de clientes"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold text-xs shadow-sm">
                        {clienteSeleccionado.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {clienteSeleccionado.name || "Cliente WhatsApp"}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Smartphone size={11} />
                          <span>{clienteSeleccionado.phone_number}</span>
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSeleccionarCliente(clienteSeleccionado)}
                        disabled={isLoadingConversacion}
                        className="btn-secondary text-xs py-1.5 px-2.5 cursor-pointer"
                        title="Recargar mensajes"
                      >
                        <RefreshCw size={12} className={isLoadingConversacion ? "animate-spin text-brand-600" : ""} />
                        <span className="hidden sm:inline">Refrescar</span>
                      </button>
                      <a
                        href={`https://wa.me/${clienteSeleccionado.phone_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        <span className="hidden sm:inline">Abrir en WhatsApp</span>
                        <span className="sm:hidden">WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Área de Mensajes */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[440px] min-h-[380px] bg-slate-50/50">
                    {isLoadingConversacion ? (
                      <div className="py-24 text-center text-xs text-slate-400">
                        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-brand-600" />
                        Cargando historial de mensajes...
                      </div>
                    ) : conversacion.length === 0 ? (
                      <div className="py-24 text-center text-xs text-slate-400">
                        <MessageSquare size={28} className="mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">Sin mensajes en este registro</p>
                        <p className="text-[11px] mt-1 text-slate-400">
                          Los mensajes intercambiados entre el cliente y el bot se mostrarán aquí.
                        </p>
                      </div>
                    ) : (
                      conversacion.map((msg) => {
                        const esBot = msg.sender === 'bot';
                        const hora = formatearFechaHora(msg.created_at);

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${esBot ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs text-xs ${
                                esBot
                                  ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-br-xs border border-white/10"
                                  : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-bold opacity-75">
                                <span>{esBot ? '🤖 Bot de WhatsApp' : (clienteSeleccionado.name || 'Cliente')}</span>
                                <span>{hora.hora ? `${hora.fecha} · ${hora.hora}` : ''}</span>
                              </div>
                              <p className="whitespace-pre-line leading-relaxed text-[11px] sm:text-xs">
                                {msg.content}
                              </p>
                              {msg.message_type === 'confirmation' && (
                                <div className="mt-2 pt-1.5 border-t border-emerald-400/30 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0" /> Cita confirmada y sincronizada en Google Calendar
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer informativo */}
                  <div className="p-2.5 bg-slate-100/70 border-t border-slate-200/60 text-[10px] sm:text-[11px] text-slate-500 text-center">
                    💡 <strong>Registro de atención automatizada:</strong> Puedes ver en vivo cada respuesta del bot y hacer seguimiento a tus clientes.
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 min-h-[380px]">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-3 shadow-xs">
                    <MessageSquare size={28} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Selecciona un cliente</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Elige un contacto del directorio a la izquierda para leer el historial completo de su conversación con el bot de WhatsApp.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      </main>
    </div>
  );
}
