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
  Scissors,
  Eye,
  EyeOff,
  Pencil,
  Sparkles,
  DollarSign,
  Check,
  X,
  AlertCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useToast } from "../context/ToastContext";
import { settingsService, servicesService } from "../services";

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

  // Configuración de cuenta de Google Calendar (solución para múltiples cuentas en el navegador)
  const [cuentaGoogleModo, setCuentaGoogleModo] = useState(
    () => localStorage.getItem("gcal_account_mode") || "email"
  );
  const [cuentaGoogleIndex, setCuentaGoogleIndex] = useState(
    () => localStorage.getItem("gcal_account_index") || "1"
  );
  const [correoGoogleManual, setCorreoGoogleManual] = useState(
    () => localStorage.getItem("gcal_account_email") || ""
  );
  const [mostrarModalConfigCalendar, setMostrarModalConfigCalendar] = useState(false);

  // Estados para Clientes y Conversaciones de WhatsApp
  const [clientes, setClientes] = useState([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [conversacion, setConversacion] = useState([]);
  const [isLoadingConversacion, setIsLoadingConversacion] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");

  // ID del comercio autenticado
  const businessId = user?.empresaId || user?.id || empresaActual?.id;

  // Estados para Catálogo de Servicios
  const [servicios, setServicios] = useState(empresaActual?.servicios || []);
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);
  const [isSavingServicio, setIsSavingServicio] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  const [togglingServiceId, setTogglingServiceId] = useState(null);
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [filtroServicio, setFiltroServicio] = useState("todos"); // "todos" | "activos" | "ocultos"
  const [busquedaServicio, setBusquedaServicio] = useState("");
  const [formServicio, setFormServicio] = useState({
    nombre: "",
    duracion: 45,
    precio: 0,
    is_active: true,
  });

  // Cargar catálogo de servicios desde el backend
  const cargarServicios = async () => {
    setIsLoadingServicios(true);
    try {
      const res = await servicesService.getServices(businessId);
      const rawList = res?.data || res?.services || (Array.isArray(res) ? res : null);
      if (rawList && Array.isArray(rawList)) {
        const mapped = rawList.map((s) => ({
          id: s.id,
          nombre: s.name || s.nombre,
          duracion: s.duration_minutes || s.duracion || 60,
          precio: Number(s.price || s.precio || 0),
          is_active: s.is_active !== undefined ? Boolean(s.is_active) : true,
        }));
        setServicios(mapped);
        if (empresaActual?.id) {
          actualizarEmpresa(empresaActual.id, { servicios: mapped });
        }
      }
    } catch (err) {
      console.log("Modo offline o fallback al consultar catálogo de servicios:", err?.message);
      if (empresaActual?.servicios?.length) {
        setServicios(empresaActual.servicios);
      }
    } finally {
      setIsLoadingServicios(false);
    }
  };

  const handleAbrirNuevoServicio = () => {
    setServicioEditando(null);
    setFormServicio({
      nombre: "",
      duracion: 45,
      precio: 0,
      is_active: true,
    });
    setMostrarModalServicio(true);
  };

  const handleAbrirEditarServicio = (s) => {
    setServicioEditando(s);
    setFormServicio({
      nombre: s.nombre || s.name || "",
      duracion: s.duracion || s.duration_minutes || 45,
      precio: s.precio !== undefined ? s.precio : (s.price || 0),
      is_active: s.is_active !== undefined ? Boolean(s.is_active) : true,
    });
    setMostrarModalServicio(true);
  };

  const handleGuardarServicio = async (e) => {
    if (e) e.preventDefault();
    if (!formServicio.nombre.trim()) {
      toast.warning("El nombre del servicio es requerido.");
      return;
    }
    const dur = parseInt(formServicio.duracion, 10);
    if (isNaN(dur) || dur <= 0) {
      toast.warning("La duración debe ser un número mayor a 0 minutos.");
      return;
    }
    const pre = parseFloat(formServicio.precio);
    if (isNaN(pre) || pre < 0) {
      toast.warning("El precio debe ser un número igual o mayor a 0.");
      return;
    }

    setIsSavingServicio(true);
    try {
      const payload = {
        name: formServicio.nombre.trim(),
        duration_minutes: dur,
        price: pre,
        is_active: Boolean(formServicio.is_active),
        businessId,
      };

      if (servicioEditando) {
        await servicesService.updateService(servicioEditando.id, payload);
        toast.success(`Servicio "${payload.name}" actualizado exitosamente.`);
      } else {
        await servicesService.createService(payload);
        toast.success(`Servicio "${payload.name}" agregado al catálogo.`);
      }
      setMostrarModalServicio(false);
      await cargarServicios();
    } catch (err) {
      console.error("Error al guardar servicio:", err);
      if (servicioEditando) {
        const actualizado = {
          ...servicioEditando,
          nombre: formServicio.nombre.trim(),
          duracion: dur,
          precio: pre,
          is_active: Boolean(formServicio.is_active),
        };
        setServicios((prev) => prev.map((s) => (s.id === servicioEditando.id ? actualizado : s)));
        toast.info("Servicio actualizado localmente");
      } else {
        const nuevo = {
          id: "serv_" + Date.now(),
          nombre: formServicio.nombre.trim(),
          duracion: dur,
          precio: pre,
          is_active: Boolean(formServicio.is_active),
        };
        setServicios((prev) => [...prev, nuevo]);
        toast.info("Servicio guardado en catálogo");
      }
      setMostrarModalServicio(false);
    } finally {
      setIsSavingServicio(false);
    }
  };

  const handleToggleVisibilidad = async (servicio) => {
    const nuevoEstado = !servicio.is_active;
    setTogglingServiceId(servicio.id);

    // Actualización inmediata en UI
    setServicios((prev) =>
      prev.map((s) => (s.id === servicio.id ? { ...s, is_active: nuevoEstado } : s))
    );

    try {
      await servicesService.toggleServiceActive(servicio.id, nuevoEstado, businessId);
      if (nuevoEstado) {
        toast.success(`"${servicio.nombre}" ahora está disponible y visible en WhatsApp.`);
      } else {
        toast.info(`"${servicio.nombre}" fue ocultado de los servicios disponibles.`);
      }
    } catch (err) {
      console.error("Error al alternar visibilidad:", err);
      // Revertir si falló
      setServicios((prev) =>
        prev.map((s) => (s.id === servicio.id ? { ...s, is_active: servicio.is_active } : s))
      );
      toast.error("No se pudo cambiar la visibilidad del servicio.");
    } finally {
      setTogglingServiceId(null);
    }
  };

  const handleEliminarServicio = async (servicio) => {
    const confirmacion = window.confirm(
      `¿Deseas eliminar el servicio "${servicio.nombre}" de tu catálogo? Si solo deseas pausarlo temporalmente, puedes ocultarlo.`
    );
    if (!confirmacion) return;

    setDeletingServiceId(servicio.id);
    try {
      await servicesService.deleteService(servicio.id, businessId);
      setServicios((prev) => prev.filter((s) => s.id !== servicio.id));
      toast.success(`Servicio "${servicio.nombre}" eliminado correctamente.`);
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
      setServicios((prev) => prev.filter((s) => s.id !== servicio.id));
      toast.info("Servicio removido del catálogo.");
    } finally {
      setDeletingServiceId(null);
    }
  };

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
          source: h.source || "manual",
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

    // 5. Cargar Servicios del negocio
    await cargarServicios();
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

  // Correo de Google Calendar resuelto
  const calendarEmailBase =
    correoGoogleManual.trim() ||
    (calendarEmailReal && calendarEmailReal.includes("@") && !calendarEmailReal.includes("saas.com") && calendarEmailReal !== "primary" ? calendarEmailReal : "") ||
    (empresaActual?.googleCalendarEmail && empresaActual.googleCalendarEmail.includes("@") ? empresaActual.googleCalendarEmail : "") ||
    (user?.email && user.email.includes("@gmail.com") ? user.email : "");

  const calendarEmail = calendarEmailBase || "agenda@gmail.com";

  // Genera la URL de Google Calendar según la configuración de cuentas del navegador
  const getGoogleCalendarUrl = (customPath = "calendar/r") => {
    // 1. Modo Selector de Cuentas de Google (Account Chooser)
    if (cuentaGoogleModo === "chooser") {
      const emailParam = calendarEmailBase ? `&Email=${encodeURIComponent(calendarEmailBase)}` : "";
      return `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(`https://calendar.google.com/${customPath}`)}${emailParam}`;
    }

    // 2. Modo por índice de cuenta en el navegador (/u/0/, /u/1/, /u/2/)
    if (cuentaGoogleModo === "index") {
      return `https://calendar.google.com/calendar/u/${cuentaGoogleIndex}/r`;
    }

    // 3. Modo por correo electrónico específico
    if (calendarEmailBase) {
      return `https://calendar.google.com/calendar/u/${encodeURIComponent(calendarEmailBase)}/r?authuser=${encodeURIComponent(calendarEmailBase)}`;
    }

    // Fallback: Selector de Cuentas para no abrir ciegamente la cuenta 0 si el usuario tiene varias
    return `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent("https://calendar.google.com/calendar/r")}`;
  };

  const handleOpenCalendar = () => {
    const url = getGoogleCalendarUrl();
    window.open(url, "_blank");
  };

  // Modifica los enlaces de eventos individuales de Google Calendar
  const getEventCalendarUrl = (htmlLink) => {
    if (!htmlLink) return null;
    try {
      if (cuentaGoogleModo === "index") {
        const url = new URL(htmlLink);
        url.pathname = url.pathname.replace(/\/calendar\/event/, `/calendar/u/${cuentaGoogleIndex}/event`);
        url.searchParams.set("authuser", cuentaGoogleIndex);
        return url.toString();
      }
      if (cuentaGoogleModo === "chooser") {
        return `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(htmlLink)}${calendarEmailBase ? `&Email=${encodeURIComponent(calendarEmailBase)}` : ""}`;
      }
      if (calendarEmailBase) {
        const url = new URL(htmlLink);
        url.searchParams.set("authuser", calendarEmailBase);
        return url.toString();
      }
      return htmlLink;
    } catch {
      return htmlLink;
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
            <div className="inline-flex rounded-xl shadow-xs border border-slate-200/80 bg-white/90 overflow-hidden">
              <button
                onClick={handleOpenCalendar}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Abrir Google Calendar"
                title={`Abrir Google Calendar (${cuentaGoogleModo === 'index' ? `Cuenta ${Number(cuentaGoogleIndex) + 1}` : (calendarEmailBase || 'Selector')})`}
              >
                <Calendar size={13} className="text-brand-600" />
                <span className="hidden sm:inline">Google Calendar</span>
                <ExternalLink size={11} className="text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => setMostrarModalConfigCalendar(true)}
                className="px-2 py-1.5 sm:py-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border-l border-slate-200 cursor-pointer"
                title="Configurar con cuál de tus 3 cuentas de Google abrir"
              >
                <Settings size={12} />
              </button>
            </div>

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
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-xs w-full sm:w-fit overflow-x-auto scrollbar-none">
          <button
            onClick={() => setTabActiva("configuracion")}
            className={`flex-1 sm:flex-initial shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === "configuracion"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <Sliders size={15} />
            <span>Configuración<span className="hidden sm:inline"> y Horarios</span></span>
          </button>

          <button
            onClick={() => {
              setTabActiva("servicios");
              cargarServicios();
            }}
            className={`flex-1 sm:flex-initial shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === "servicios"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <Scissors size={15} className={tabActiva === "servicios" ? "text-cyan-400" : "text-brand-600"} />
            <span>Servicios</span>
            {servicios.length > 0 && (
              <span className={`ml-0.5 rounded-full font-extrabold px-2 py-0.5 text-[10px] ${
                tabActiva === "servicios"
                  ? "bg-white/20 text-white"
                  : "bg-brand-500/15 text-brand-700"
              }`}>
                {servicios.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setTabActiva("conversaciones");
              cargarClientes();
            }}
            className={`flex-1 sm:flex-initial shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === "conversaciones"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <MessageSquare size={15} className={tabActiva === "conversaciones" ? "text-emerald-400" : "text-emerald-600"} />
            <span>Clientes<span className="hidden sm:inline"> y Mensajes</span></span>
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
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <p className="text-xs text-slate-500 truncate">
                    Vinculado: <strong className="text-brand-700">
                      {cuentaGoogleModo === "index"
                        ? `Cuenta ${Number(cuentaGoogleIndex) + 1} de Google (/u/${cuentaGoogleIndex})`
                        : cuentaGoogleModo === "chooser"
                        ? "Selector de cuentas de Google"
                        : (calendarEmailBase || "agenda@gmail.com")}
                    </strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setMostrarModalConfigCalendar(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-800 hover:underline cursor-pointer"
                    title="Configurar con cuál de tus 3 cuentas de Google abrir"
                  >
                    <Settings size={11} /> Cambiar cuenta
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={cargarCitasCalendar}
                disabled={isLoadingCitas}
                className="btn-secondary text-xs sm:text-sm py-2 px-3 cursor-pointer shrink-0"
                title="Refrescar citas desde Google Calendar"
              >
                <RefreshCw size={13} className={isLoadingCitas ? "animate-spin text-brand-600" : ""} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              <div className="inline-flex rounded-xl shadow-xs overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={handleOpenCalendar}
                  className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 cursor-pointer rounded-r-none"
                  title="Abrir Google Calendar en la cuenta seleccionada"
                >
                  <Calendar size={14} />
                  <span>Ver en Calendar</span>
                  <ExternalLink size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarModalConfigCalendar(true)}
                  className="bg-brand-700 hover:bg-brand-800 text-white px-2.5 py-2 border-l border-brand-500/50 cursor-pointer transition-colors"
                  title="Configurar cuenta de Google (Cuenta 1, Cuenta 2, Cuenta 3 o Selector)"
                >
                  <Settings size={14} />
                </button>
              </div>
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
                              href={getEventCalendarUrl(cita.htmlLink)}
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
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs pl-11 sm:pl-0 flex-wrap sm:flex-nowrap">
                      <span className="text-slate-500 font-semibold">Desde:</span>
                      <input
                        type="time"
                        value={config.desde}
                        onChange={(e) =>
                          handleCambioDia(dia.clave, true, e.target.value, config.hasta)
                        }
                        className="rounded-xl border border-white bg-white/90 px-2 py-1 font-bold text-slate-800 outline-none focus:border-brand-500 text-xs shadow-xs min-w-[76px] max-w-[92px]"
                      />
                      <span className="text-slate-500 font-semibold">Hasta:</span>
                      <input
                        type="time"
                        value={config.hasta}
                        onChange={(e) =>
                          handleCambioDia(dia.clave, true, config.desde, e.target.value)
                        }
                        className="rounded-xl border border-white bg-white/90 px-2 py-1 font-bold text-slate-800 outline-none focus:border-brand-500 text-xs shadow-xs min-w-[76px] max-w-[92px]"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic pl-11 sm:pl-0">
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
              feriados.map((cierre) => {
                const isGoogleCalendar = cierre.source === "google_calendar" || String(cierre.id).startsWith("gcal_");
                return (
                  <div
                    key={cierre.id}
                    className="flex items-center justify-between rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3 sm:p-3.5 min-w-0"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                        <Calendar size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-slate-900">
                            {cierre.fecha}
                          </p>
                          {isGoogleCalendar && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 text-[10px] font-semibold">
                              Google Calendar
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-amber-900 font-medium truncate">
                          {cierre.motivo || "Cerrado"}
                        </p>
                      </div>
                    </div>

                    {isGoogleCalendar ? (
                      <a
                        href={buildGoogleCalendarUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-8 px-2.5 shrink-0 items-center gap-1 rounded-xl text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 transition-colors cursor-pointer"
                        title="Gestionado desde tu Google Calendar (Haz clic para ver o editar)"
                      >
                        <ExternalLink size={13} />
                        <span className="hidden sm:inline">Ver en Calendar</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleEliminarCierre(cierre.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar día cerrado"
                        aria-label="Eliminar día cerrado"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
        </>
      ) : tabActiva === "servicios" ? (
        /* ============================================================ */
        /* VISTA DE CATÁLOGO DE SERVICIOS (GESTIÓN, VISIBILIDAD, ETC) */
        /* ============================================================ */
        <div className="space-y-6">
          {/* Header y Resumen de Servicios */}
          <section className="glass-panel p-4 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-slate-200/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-glow-blue">
                  <Scissors size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                      Catálogo de Servicios y Tratamientos
                    </h2>
                    <span className="glass-pill-brand text-[10px]">
                      <Sparkles size={11} className="text-brand-600" /> WhatsApp Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Agrega, edita, elimina u oculta servicios de la lista disponible para tus clientes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={cargarServicios}
                  disabled={isLoadingServicios}
                  className="btn-secondary text-xs sm:text-sm py-2 px-3 cursor-pointer"
                  title="Refrescar catálogo desde la base de datos"
                >
                  <RefreshCw size={13} className={isLoadingServicios ? "animate-spin text-brand-600" : ""} />
                  <span className="hidden sm:inline">Actualizar</span>
                </button>

                <button
                  type="button"
                  onClick={handleAbrirNuevoServicio}
                  className="btn-primary text-xs sm:text-sm py-2 px-4 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Nuevo Servicio</span>
                </button>
              </div>
            </div>

            {/* Tarjetas métricas rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5">
              <div className="rounded-2xl border border-white/90 bg-white/70 p-4 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Servicios</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900 font-display">{servicios.length}</span>
                  <span className="text-xs text-slate-500">en catálogo</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Disponibles</p>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-emerald-950 font-display">
                    {servicios.filter((s) => s.is_active).length}
                  </span>
                  <span className="text-xs text-emerald-700">visibles en WhatsApp</span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Ocultos / Pausados</p>
                  <EyeOff size={13} className="text-amber-600" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-amber-950 font-display">
                    {servicios.filter((s) => !s.is_active).length}
                  </span>
                  <span className="text-xs text-amber-800">no se ofrecen a clientes</span>
                </div>
              </div>
            </div>

            {/* Aviso informativo de funcionamiento */}
            <div className="mt-4 p-3 sm:p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 text-xs text-brand-900 flex items-start gap-2.5">
              <Info size={16} className="text-brand-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>¿Cómo funciona la disponibilidad?</strong> Los servicios marcados como <strong>Disponibles</strong> son los que el bot de WhatsApp muestra cuando un cliente pide ver los servicios. Si un servicio está temporalmente no disponible, puedes hacer clic en <strong>Ocultar</strong> para pausarlo sin necesidad de borrarlo ni perder sus citas previas.
              </p>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200/60">
              {/* Filtros por pestaña/pill */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/50 text-xs overflow-x-auto scrollbar-none max-w-full">
                <button
                  type="button"
                  onClick={() => setFiltroServicio("todos")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    filtroServicio === "todos"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Todos ({servicios.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroServicio("activos")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    filtroServicio === "activos"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-emerald-700"
                  }`}
                >
                  Disponibles ({servicios.filter((s) => s.is_active).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroServicio("ocultos")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    filtroServicio === "ocultos"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-amber-800"
                  }`}
                >
                  Ocultos ({servicios.filter((s) => !s.is_active).length})
                </button>
              </div>

              {/* Input de Búsqueda */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busquedaServicio}
                  onChange={(e) => setBusquedaServicio(e.target.value)}
                  placeholder="Buscar servicio..."
                  className="w-full rounded-xl border border-slate-200 bg-white/90 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-xs"
                />
                {busquedaServicio && (
                  <button
                    type="button"
                    onClick={() => setBusquedaServicio("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Listado de Servicios */}
            <div className="mt-5">
              {isLoadingServicios && servicios.length === 0 ? (
                <div className="p-12 text-center">
                  <RefreshCw size={24} className="animate-spin text-brand-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">Cargando catálogo de servicios...</p>
                </div>
              ) : (
                (() => {
                  const serviciosFiltrados = servicios.filter((s) => {
                    const matchText = !busquedaServicio.trim() ||
                      (s.nombre || s.name || "").toLowerCase().includes(busquedaServicio.trim().toLowerCase());
                    if (!matchText) return false;
                    if (filtroServicio === "activos") return s.is_active;
                    if (filtroServicio === "ocultos") return !s.is_active;
                    return true;
                  });

                  if (serviciosFiltrados.length === 0) {
                    return (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                        <Scissors size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs sm:text-sm font-semibold text-slate-600">
                          {busquedaServicio || filtroServicio !== "todos"
                            ? "No se encontraron servicios con los filtros aplicados"
                            : "Tu catálogo de servicios aún está vacío"}
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          {busquedaServicio || filtroServicio !== "todos"
                            ? "Intenta cambiar la búsqueda o restablecer el filtro."
                            : "Agrega los servicios y tratamientos que ofreces para que tus clientes puedan agendarlos por WhatsApp."}
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                          {busquedaServicio || filtroServicio !== "todos" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setBusquedaServicio("");
                                setFiltroServicio("todos");
                              }}
                              className="btn-secondary text-xs py-1.5 px-3"
                            >
                              Restablecer Filtros
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleAbrirNuevoServicio}
                              className="btn-primary text-xs py-2 px-4 cursor-pointer"
                            >
                              <Plus size={14} /> Añadir mi primer servicio
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {serviciosFiltrados.map((servicio) => {
                        const isToggling = togglingServiceId === servicio.id;
                        const isDeleting = deletingServiceId === servicio.id;

                        return (
                          <div
                            key={servicio.id}
                            className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-glass ${
                              servicio.is_active
                                ? "border-white/90 bg-white/80 hover:bg-white"
                                : "border-slate-200/70 bg-slate-50/80 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <div>
                              {/* Header de la Tarjeta */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                                  servicio.is_active
                                    ? "bg-gradient-to-tr from-brand-50 to-indigo-50 border border-brand-200/60 text-brand-700"
                                    : "bg-slate-200 text-slate-500"
                                }`}>
                                  <Scissors size={18} />
                                </div>

                                {/* Badge de estado / visibilidad */}
                                {servicio.is_active ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Disponible en WhatsApp
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                                    <EyeOff size={10} className="text-amber-600" />
                                    Oculto del Menú
                                  </span>
                                )}
                              </div>

                              {/* Nombre del Servicio */}
                              <h3
                                className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate"
                                title={servicio.nombre}
                              >
                                {servicio.nombre}
                              </h3>

                              {/* Detalles: Duración y Precio */}
                              <div className="mt-2.5 flex items-center justify-between text-xs">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-[11px]">
                                  <Clock size={12} className="text-slate-400" />
                                  {servicio.duracion} min
                                </span>

                                <span className="text-base sm:text-lg font-extrabold text-slate-900 font-display">
                                  ${Number(servicio.precio || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Barra de Acciones de la Tarjeta */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              {/* Botón Switch Ocultar / Mostrar */}
                              <button
                                type="button"
                                onClick={() => handleToggleVisibilidad(servicio)}
                                disabled={isToggling}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  servicio.is_active
                                    ? "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                                }`}
                                title={
                                  servicio.is_active
                                    ? "Ocultar este servicio para que el bot no lo ofrezca"
                                    : "Mostrar este servicio para que vuelva a estar disponible en WhatsApp"
                                }
                              >
                                {isToggling ? (
                                  <RefreshCw size={12} className="animate-spin text-brand-600" />
                                ) : servicio.is_active ? (
                                  <>
                                    <EyeOff size={13} className="text-slate-500" />
                                    <span>Ocultar</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye size={13} className="text-emerald-600" />
                                    <span>Mostrar</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center gap-1">
                                {/* Botón Editar */}
                                <button
                                  type="button"
                                  onClick={() => handleAbrirEditarServicio(servicio)}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                                  title="Editar servicio"
                                  aria-label="Editar servicio"
                                >
                                  <Pencil size={14} />
                                </button>

                                {/* Botón Eliminar */}
                                <button
                                  type="button"
                                  onClick={() => handleEliminarServicio(servicio)}
                                  disabled={isDeleting}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Eliminar servicio"
                                  aria-label="Eliminar servicio"
                                >
                                  {isDeleting ? (
                                    <RefreshCw size={13} className="animate-spin text-red-600" />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          </section>
        </div>
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
                              <p className="whitespace-pre-line leading-relaxed text-[11px] sm:text-xs break-words">
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

      {/* Modal para Crear / Editar Servicio */}
      {mostrarModalServicio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-glass-xl border border-white/90 relative overflow-hidden max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-glow-blue">
                  <Scissors size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-slate-900">
                    {servicioEditando ? "Editar Servicio" : "Nuevo Servicio en Catálogo"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configura la información y disponibilidad para reservas de WhatsApp
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalServicio(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulario con scroll interno para pantallas móviles */}
            <form onSubmit={handleGuardarServicio} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Campo Nombre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre del Servicio o Tratamiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formServicio.nombre}
                  onChange={(e) => setFormServicio({ ...formServicio, nombre: e.target.value })}
                  placeholder="Ej: Corte de Cabello y Barba, Limpieza Facial..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                />
              </div>

              {/* Fila: Duración y Precio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Duración */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Duración (Minutos) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="5"
                      step="5"
                      required
                      value={formServicio.duracion}
                      onChange={(e) => setFormServicio({ ...formServicio, duracion: e.target.value })}
                      placeholder="60"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 font-bold focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                    />
                  </div>
                  {/* Botones rápidos de duración */}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {[15, 30, 45, 60, 90].map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setFormServicio({ ...formServicio, duracion: min })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          Number(formServicio.duracion) === min
                            ? "bg-brand-50 border-brand-300 text-brand-700"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Precio ($)
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formServicio.precio}
                      onChange={(e) => setFormServicio({ ...formServicio, precio: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 font-bold focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Precio referencial informado al cliente.
                  </p>
                </div>
              </div>

              {/* Toggle de Visibilidad / Disponibilidad en el Menú */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {formServicio.is_active ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <Eye size={16} />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <EyeOff size={16} />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {formServicio.is_active
                          ? "Disponible en WhatsApp (Visible)"
                          : "Oculto del Menú (Pausado)"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formServicio.is_active
                          ? "Los clientes podrán seleccionar este servicio al agendar."
                          : "El bot no ofrecerá este servicio hasta que lo actives de nuevo."}
                      </p>
                    </div>
                  </div>

                  {/* Switch button */}
                  <button
                    type="button"
                    onClick={() => setFormServicio({ ...formServicio, is_active: !formServicio.is_active })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formServicio.is_active ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                    role="switch"
                    aria-checked={formServicio.is_active}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        formServicio.is_active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setMostrarModalServicio(false)}
                  disabled={isSavingServicio}
                  className="btn-secondary text-xs sm:text-sm py-2 px-4 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingServicio}
                  className="btn-primary text-xs sm:text-sm py-2 px-5 cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingServicio ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{servicioEditando ? "Guardar Cambios" : "Crear Servicio"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Configurar Cuenta de Google Calendar (Solución Multi-Cuentas) */}
      {mostrarModalConfigCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-glass-xl border border-white/90 relative overflow-hidden max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white shadow-glow-blue">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-slate-900">
                    Cuenta de Google Calendar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Elige con cuál de tus cuentas de Google abrir el calendario en este navegador
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalConfigCalendar(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido / Opciones con scroll */}
            <div className="mt-4 space-y-3.5 sm:space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="p-3 rounded-2xl bg-brand-50/80 border border-brand-100 text-xs text-brand-900">
                <p className="leading-relaxed">
                  💡 <strong>¿Tienes varias cuentas de Google en tu PC?</strong> Google por defecto abre siempre la cuenta principal. Aquí puedes forzar que abra la cuenta secundaria de tu negocio o activar el selector de cuentas.
                </p>
              </div>

              {/* Opción 1: Selector de Cuenta de Google (Recomendado para múltiples cuentas) */}
              <div
                onClick={() => {
                  setCuentaGoogleModo("chooser");
                  localStorage.setItem("gcal_account_mode", "chooser");
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  cuentaGoogleModo === "chooser"
                    ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="google_mode"
                    checked={cuentaGoogleModo === "chooser"}
                    onChange={() => {
                      setCuentaGoogleModo("chooser");
                      localStorage.setItem("gcal_account_mode", "chooser");
                    }}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Selector Oficial de Cuentas de Google (Recomendado)</span>
                      <span className="glass-pill-cyan text-[9px]">Multi-Cuenta</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Google te mostrará la pantalla con tus 3 cuentas para que elijas directamente la del negocio con un clic, sin abrir la cuenta equivocada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción 2: Por Número de Cuenta en el Navegador (/u/0, /u/1, /u/2) */}
              <div
                onClick={() => {
                  setCuentaGoogleModo("index");
                  localStorage.setItem("gcal_account_mode", "index");
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  cuentaGoogleModo === "index"
                    ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="google_mode"
                    checked={cuentaGoogleModo === "index"}
                    onChange={() => {
                      setCuentaGoogleModo("index");
                      localStorage.setItem("gcal_account_mode", "index");
                    }}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Por Posición de Cuenta en Google Chrome
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Abre directamente la cuenta según el orden en que iniciaste sesión en Google en este navegador:
                    </p>

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2.5">
                      {[
                        { index: "0", label: "Cuenta 1", desc: "Principal" },
                        { index: "1", label: "Cuenta 2", desc: "Secundaria" },
                        { index: "2", label: "Cuenta 3", desc: "Tercera" },
                      ].map((item) => (
                        <button
                          key={item.index}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCuentaGoogleModo("index");
                            setCuentaGoogleIndex(item.index);
                            localStorage.setItem("gcal_account_mode", "index");
                            localStorage.setItem("gcal_account_index", item.index);
                          }}
                          className={`py-1.5 px-1.5 sm:px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            cuentaGoogleModo === "index" && cuentaGoogleIndex === item.index
                              ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span className="block text-[10px] sm:text-[11px] truncate">{item.label}</span>
                          <span className={`block text-[8px] sm:text-[9px] font-normal ${
                            cuentaGoogleModo === "index" && cuentaGoogleIndex === item.index ? "text-brand-100" : "text-slate-400"
                          }`}>{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opción 3: Por Correo Específico de Google */}
              <div
                onClick={() => {
                  setCuentaGoogleModo("email");
                  localStorage.setItem("gcal_account_mode", "email");
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  cuentaGoogleModo === "email"
                    ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="google_mode"
                    checked={cuentaGoogleModo === "email"}
                    onChange={() => {
                      setCuentaGoogleModo("email");
                      localStorage.setItem("gcal_account_mode", "email");
                    }}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Por Correo de Google / Gmail Específico
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Indica el correo de Google Calendar al que debe saltar automáticamente:
                    </p>

                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="email"
                        value={correoGoogleManual}
                        onChange={(e) => {
                          setCorreoGoogleManual(e.target.value);
                          localStorage.setItem("gcal_account_email", e.target.value.trim());
                        }}
                        placeholder={calendarEmailBase || "ej: negocio.citas@gmail.com"}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con Botones */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const url = getGoogleCalendarUrl();
                  window.open(url, "_blank");
                }}
                className="btn-secondary text-xs py-2 px-3.5 cursor-pointer inline-flex items-center justify-center gap-1.5"
                title="Abre el calendario en una nueva pestaña para probar la cuenta"
              >
                <ExternalLink size={13} />
                <span>Probar Abrir Ahora</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("gcal_account_mode", cuentaGoogleModo);
                  localStorage.setItem("gcal_account_index", cuentaGoogleIndex);
                  if (correoGoogleManual) {
                    localStorage.setItem("gcal_account_email", correoGoogleManual.trim());
                  }
                  toast.success("Preferencia de Google Calendar guardada correctamente.");
                  setMostrarModalConfigCalendar(false);
                }}
                className="btn-primary text-xs sm:text-sm py-2 px-5 cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                <span>Listo / Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
