import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Scissors,
  Power,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CalendarCheck,
  Save,
  RefreshCw,
<<<<<<< HEAD
  Bot,
  Mail,
  Building2,
  Globe,
  MessageSquare,
=======
  Share2,
>>>>>>> e858234caf68de8b72fa4230596ef4a27797eeaf
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { useToast } from "../context/ToastContext";
import BotToggle from "../components/common/BotToggle";
<<<<<<< HEAD
import Modal from "../components/common/Modal";
=======
import ShareBusinessModal from "../components/common/ShareBusinessModal";
>>>>>>> e858234caf68de8b72fa4230596ef4a27797eeaf
import { money, fechaLarga, DIAS, uid } from "../utils/formatters";
import { servicesService, settingsService, businessService } from "../services";

export default function BusinessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    empresas,
    actualizarEmpresa,
    agregarServicio,
    eliminarServicio,
    agregarCierre,
    eliminarCierre,
  } = useBusiness();
  const { toast } = useToast();

  const empresa = empresas.find((e) => e.id === Number(id) || String(e.id) === String(id));

  const [tab, setTab] = useState("servicios");
  const [creandoServicio, setCreandoServicio] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState(null);
  const [mostrarModalShare, setMostrarModalShare] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  // Estado para la edición de la información general del comercio
  const [isEditBusinessModalOpen, setIsEditBusinessModalOpen] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [formComercio, setFormComercio] = useState({
    nombre: "",
    rubro: "Peluquería",
    telefonoBot: "",
    telefonoContacto: "",
    email: "",
    googleCalendarEmail: "",
    timezone: "America/Caracas",
    greetingMessage: "",
  });

  // Form state para nuevos servicios
  const [formServicio, setFormServicio] = useState({
    nombre: "",
    duracion: 30,
    precio: 0,
    nota: "",
  });

  // Form state para días cerrados
  const [fechaCierre, setFechaCierre] = useState("");
  const [motivoCierre, setMotivoCierre] = useState("");

  // Cargar servicios, horarios y feriados desde el backend para el comercio
  useEffect(() => {
    async function loadBackendData() {
      try {
        // 1. Cargar Servicios del negocio
        let resServices;
        try {
          resServices = await businessService.getBusinessServices(id);
        } catch {
          resServices = await servicesService.getServices();
        }
        const rawServices = resServices?.data || resServices?.services || (Array.isArray(resServices) ? resServices : null);
        if (rawServices && Array.isArray(rawServices) && rawServices.length > 0) {
          const mappedServices = rawServices.map((s) => ({
            id: s.id,
            nombre: s.name || s.nombre,
            duracion: s.duration_minutes || s.duracion,
            precio: Number(s.price || s.precio),
            nota: s.is_active ? "Servicio Activo" : "Pausado en Bot",
            is_active: s.is_active !== undefined ? s.is_active : true,
          }));
          actualizarEmpresa(empresa.id, { servicios: mappedServices });
        }

        // 2. Cargar Feriados / Días cerrados del negocio
        try {
          const resHolidays = await businessService.getBusinessHolidays(id);
          const rawHolidays = resHolidays?.data || resHolidays?.holidays || (Array.isArray(resHolidays) ? resHolidays : null);
          if (rawHolidays && Array.isArray(rawHolidays)) {
            const mappedHolidays = rawHolidays.map((h) => ({
              id: h.id,
              fecha: (h.closed_date || h.date || "").slice(0, 10),
              motivo: h.reason || "Cerrado",
              source: h.source || "manual",
            }));
            actualizarEmpresa(empresa.id, { cierres: mappedHolidays });
          }
        } catch {
          // Fallback a feriados locales
        }

        // 3. Cargar Horarios del negocio
        try {
          const resSchedule = await businessService.getBusinessSchedule(id);
          const rawSchedule = resSchedule?.data || resSchedule?.schedule || (Array.isArray(resSchedule) ? resSchedule : null);
          if (rawSchedule && Array.isArray(rawSchedule) && rawSchedule.length > 0) {
            const uiSchedule = settingsService.formatScheduleForUi(rawSchedule);
            actualizarEmpresa(empresa.id, { horario: uiSchedule });
          }
        } catch {
          // Fallback a horario local
        }
      } catch (err) {
        console.log("Carga datos backend para comercio omitida o en modo local:", err?.message);
      }
    }

    if (empresa) {
      loadBackendData();
    }
  }, [id]);

  
  if (!empresa) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 sm:p-12 text-center">
        <p className="text-base font-semibold text-slate-900">Comercio no encontrado</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary mt-4 text-xs cursor-pointer">
          Volver a la lista
        </button>
      </div>
    );
  }

  const handleAbrirEditarComercio = () => {
    setFormComercio({
      nombre: empresa.nombre || "",
      rubro: empresa.rubro || "Peluquería",
      telefonoBot: empresa.telefonoBot || empresa.telefono || "",
      telefonoContacto: empresa.telefonoContacto || "",
      email: empresa.email || "",
      googleCalendarEmail: empresa.googleCalendarEmail || "",
      timezone: empresa.timezone || "America/Caracas",
      greetingMessage: empresa.greetingMessage || "",
    });
    setIsEditBusinessModalOpen(true);
  };

  const handleGuardarComercio = async (e) => {
    e.preventDefault();
    if (!formComercio.nombre?.trim()) {
      toast.warning("El nombre del comercio es obligatorio.");
      return;
    }
    if (!formComercio.telefonoBot?.trim()) {
      toast.warning("El teléfono del bot de WhatsApp es obligatorio.");
      return;
    }

    setIsSavingBusiness(true);
    try {
      const res = await actualizarEmpresa(empresa.id, formComercio, false);
      if (res?.success) {
        setIsEditBusinessModalOpen(false);
      }
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleToggleBot = async (val) => {
    actualizarEmpresa(empresa.id, { activo: val });
    try {
      const res = await businessService.updateBusinessBotStatus(empresa.id, val);
      toast.success(
        res?.message || (val ? `Bot activado para ${empresa.nombre}` : `Bot en pausa para ${empresa.nombre}`),
        { titulo: val ? "Bot Encendido" : "Bot en Pausa" }
      );
    } catch (err) {
      toast.error(err, {
        titulo: "Error al actualizar estado del Bot",
      });
    }
  };

  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    if (!formServicio.nombre.trim()) {
      toast.warning("El nombre del servicio es obligatorio");
      return;
    }

    setIsSaving(true);
    const esEdicion = Boolean(editandoServicio);
    const nuevoItem = {
      id: formServicio.id || (esEdicion ? editandoServicio : uid()),
      nombre: formServicio.nombre.trim(),
      duracion: Number(formServicio.duracion) || 30,
      precio: Number(formServicio.precio) || 0,
      nota: formServicio.nota || "",
      is_active: formServicio.is_active !== undefined ? formServicio.is_active : true,
    };

    try {
      let res;
      if (esEdicion) {
        try {
          res = await businessService.updateBusinessService(empresa.id, nuevoItem.id, {
            name: nuevoItem.nombre,
            duration_minutes: nuevoItem.duracion,
            price: nuevoItem.precio,
            is_active: nuevoItem.is_active,
          });
        } catch {
          res = await servicesService.updateService(nuevoItem.id, {
            name: nuevoItem.nombre,
            duration_minutes: nuevoItem.duracion,
            price: nuevoItem.precio,
            is_active: nuevoItem.is_active,
          });
        }
      } else {
        try {
          res = await businessService.createBusinessService(empresa.id, {
            name: nuevoItem.nombre,
            duration_minutes: nuevoItem.duracion,
            price: nuevoItem.precio,
            is_active: nuevoItem.is_active,
          });
        } catch {
          res = await servicesService.createService({
            name: nuevoItem.nombre,
            duration_minutes: nuevoItem.duracion,
            price: nuevoItem.precio,
            is_active: nuevoItem.is_active,
          });
        }
      }

      if (res?.data?.id) {
        nuevoItem.id = res.data.id;
      }

      agregarServicio(empresa.id, nuevoItem);
      toast.success(res?.message || (esEdicion ? "Servicio actualizado exitosamente." : "Servicio registrado exitosamente en el catálogo."), {
        titulo: esEdicion ? "Servicio Actualizado" : "Servicio Guardado",
      });
    } catch (err) {
      // Guardar en estado local y mostrar toast detallado
      agregarServicio(empresa.id, nuevoItem);
      toast.error(err, {
        titulo: `Fallo al ${esEdicion ? "actualizar" : "guardar"} servicio en API`,
      });
    } finally {
      setIsSaving(false);
      setFormServicio({ nombre: "", duracion: 30, precio: 0, nota: "" });
      setCreandoServicio(false);
      setEditandoServicio(null);
    }
  };

  const handleEliminarServicio = async (servicio) => {
    setDeletingServiceId(servicio.id);
    try {
      let res;
      try {
        res = await businessService.deleteBusinessService(empresa.id, servicio.id);
      } catch {
        res = await servicesService.deleteService(servicio.id);
      }
      eliminarServicio(empresa.id, servicio.id, true);
      toast.success(res?.message || `Servicio "${servicio.nombre}" eliminado exitosamente del catálogo.`, {
        titulo: "Servicio Eliminado",
      });
    } catch (err) {
      eliminarServicio(empresa.id, servicio.id, true);
      toast.error(err, {
        titulo: `Error al eliminar servicio "${servicio.nombre}" en API`,
      });
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleAgregarCierre = async (e) => {
    e.preventDefault();
    if (!fechaCierre) {
      toast.warning("Selecciona una fecha");
      return;
    }

    const motivoTexto = motivoCierre.trim() || "Cerrado";
    const nuevoCierre = {
      id: uid(),
      fecha: fechaCierre,
      motivo: motivoTexto,
    };

    try {
      let res;
      try {
        res = await businessService.createBusinessHoliday(empresa.id, {
          date: fechaCierre,
          reason: motivoTexto,
        });
      } catch {
        res = await settingsService.createHoliday({
          date: fechaCierre,
          reason: motivoTexto,
        });
      }

      if (res?.data?.id) {
        nuevoCierre.id = res.data.id;
      }
      agregarCierre(empresa.id, nuevoCierre);
      toast.success(res?.message || "Día cerrado registrado exitosamente.", {
        titulo: "Fecha No Laborable Guardada",
      });
    } catch (err) {
      agregarCierre(empresa.id, nuevoCierre);
      toast.error(err, {
        titulo: "Error al registrar día cerrado en API",
      });
    } finally {
      setFechaCierre("");
      setMotivoCierre("");
    }
  };

  const handleEliminarCierre = async (cierreId) => {
    try {
      try {
        await businessService.deleteBusinessHoliday(empresa.id, cierreId);
      } catch {
        await settingsService.deleteHoliday(cierreId);
      }
      eliminarCierre(empresa.id, cierreId);
      toast.info("Día cerrado eliminado del sistema.");
    } catch (err) {
      eliminarCierre(empresa.id, cierreId);
      toast.error(err, {
        titulo: "Error al eliminar fecha",
      });
    }
  };

  const setHorarioDia = (key, patch) => {
    actualizarEmpresa(empresa.id, {
      horario: {
        ...empresa.horario,
        [key]: { ...empresa.horario[key], ...patch },
      },
    });
  };

  const handleGuardarHorarios = async () => {
    setIsSaving(true);
    const schedulePayload = settingsService.formatScheduleForApi(empresa.horario);
    try {
      let res;
      try {
        res = await businessService.updateBusinessSchedule(empresa.id, schedulePayload);
      } catch {
        res = await settingsService.updateSchedule(schedulePayload);
      }
      toast.success(res?.message || "Horarios sincronizados con el backend.", {
        titulo: "Horario Guardado",
      });
    } catch (err) {
      toast.error(err, {
        titulo: "Error al sincronizar horario semanal",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0 w-full">
      {/* Botón Volver */}
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} /> Volver a Todos los Negocios
      </button>

      {/* Header del Comercio */}
      <div className="card-base flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 truncate max-w-full">
              {empresa.nombre}
            </h1>
            <span className={empresa.activo ? "badge-active" : "badge-inactive"}>
              {empresa.activo ? "Bot Activo" : "En Pausa"}
            </span>
          </div>

<<<<<<< HEAD
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Scissors size={13} className="text-slate-400" /> {empresa.rubro}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-xl border border-emerald-200/60 text-[11px] sm:text-xs">
              <Bot size={13} className="text-emerald-600 shrink-0" />
              <span>Bot WhatsApp: {empresa.telefonoBot || empresa.telefono}</span>
            </span>
            {empresa.telefonoContacto ? (
              <span className="flex items-center gap-1.5 font-semibold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-xl border border-blue-200/60 text-[11px] sm:text-xs">
                <Phone size={12} className="text-blue-600 shrink-0" />
                <span>Contacto Personal: {empresa.telefonoContacto}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                <Phone size={12} className="shrink-0" /> Sin teléfono personal
              </span>
            )}
            {empresa.email && (
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <Mail size={12} className="text-slate-400" /> {empresa.email}
              </span>
            )}
            <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50/80 px-2.5 py-1 rounded-xl border border-cyan-200/60 font-semibold text-[11px] truncate max-w-full">
=======
          <div className="mt-2 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium" title="WhatsApp del Bot"><Phone size={13} /> Bot: {empresa.telefono}</span>
            {empresa.contact_phone && (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60" title="Teléfono del dueño / contacto directo">
                <Phone size={12} className="text-emerald-600" /> Dueño: {empresa.contact_phone}
              </span>
            )}
            <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50/80 px-2 py-0.5 rounded-lg border border-cyan-200/60 font-semibold text-[11px] truncate max-w-full">
>>>>>>> e858234caf68de8b72fa4230596ef4a27797eeaf
              <CalendarCheck size={12} className="text-cyan-600 shrink-0" />
              Calendar: {empresa.googleCalendarEmail || "Sin vincular"}
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <CalendarCheck size={13} className="text-brand-600" /> {empresa.citasSemana} citas esta semana
            </span>
          </div>
        </div>

<<<<<<< HEAD
        {/* Acciones del Comercio: Editar Información y Switch del Bot */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={handleAbrirEditarComercio}
            className="flex items-center gap-1.5 rounded-2xl border border-brand-200 bg-brand-50/70 hover:bg-brand-100 text-brand-700 font-bold px-3 sm:px-4 py-2 sm:py-2.5 text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Pencil size={14} className="text-brand-600" />
            <span>Editar Información</span>
          </button>

          {/* Card de activación rápida del Bot */}
          <div className={`flex items-center justify-between sm:justify-start gap-3 rounded-2xl p-2.5 sm:p-3 border transition-colors shrink-0 ${
            empresa.activo ? "bg-emerald-50/70 border-emerald-200/60" : "bg-slate-100/70 border-slate-200"
          }`}>
            <div className="flex items-center gap-2.5">
              <Power size={17} className={empresa.activo ? "text-emerald-600" : "text-slate-400"} />
              <div>
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {empresa.activo ? "Bot activo" : "En pausa"}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {empresa.activo ? "Agenda citas" : "Sin respuestas"}
=======
        {/* Acciones principales del encabezado */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          <button
            type="button"
            onClick={() => setMostrarModalShare(true)}
            className="btn-primary text-xs py-2.5 px-3.5 flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-emerald-300"
            title="Compartir enlace de WhatsApp o escribirle al comercio"
          >
            <Share2 size={14} />
            <span>Compartir WhatsApp</span>
          </button>

          {/* Card de activación rápida del Bot */}
          <div className={`flex items-center justify-between sm:justify-start gap-3 rounded-2xl p-3 sm:p-4 border transition-colors shrink-0 ${
            empresa.activo ? "bg-emerald-50/70 border-emerald-200/60" : "bg-slate-100/70 border-slate-200"
          }`}>
            <div className="flex items-center gap-3">
              <Power size={18} className={empresa.activo ? "text-emerald-600" : "text-slate-400"} />
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {empresa.activo ? "Bot respondiendo" : "Bot en pausa"}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500">
                  {empresa.activo ? "Atiende y agenda citas" : "Sin respuestas"}
>>>>>>> e858234caf68de8b72fa4230596ef4a27797eeaf
                </p>
              </div>
            </div>
            <BotToggle
              activo={empresa.activo}
              onChange={handleToggleBot}
              ariaLabel="Toggle Bot para este negocio"
            />
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex border-b border-slate-200/80 overflow-x-auto">
        {[
          { id: "servicios", label: `Servicios (${empresa.servicios?.length || 0})` },
          { id: "disponibilidad", label: "Horarios y Días Cerrados" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === t.id ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-600" />
            )}
          </button>
        ))}
      </div>

      {/* Pestaña 1: Servicios */}
      {tab === "servicios" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              El bot utiliza la duración de cada servicio para calcular los horarios libres en Google Calendar.
            </p>
            {!creandoServicio && !editandoServicio && (
              <button
                onClick={() => setCreandoServicio(true)}
                className="btn-primary text-xs self-start sm:self-auto py-2 cursor-pointer"
              >
                <Plus size={15} /> Agregar Servicio
              </button>
            )}
          </div>

          {/* Formulario Crear/Editar */}
          {(creandoServicio || editandoServicio) && (
            <form onSubmit={handleGuardarServicio} className="card-base bg-white/80 space-y-3.5 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {editandoServicio ? "Editar Servicio" : "Nuevo Servicio en Catálogo (POST /api/services)"}
              </h3>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-base">Nombre del Servicio</label>
                  <input
                    type="text"
                    required
                    value={formServicio.nombre}
                    onChange={(e) => setFormServicio({ ...formServicio, nombre: e.target.value })}
                    placeholder="Ej: Blanqueamiento Dental Láser"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">Duración (Minutos)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={formServicio.duracion}
                    onChange={(e) => setFormServicio({ ...formServicio, duracion: Number(e.target.value) })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">Precio ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formServicio.precio}
                    onChange={(e) => setFormServicio({ ...formServicio, precio: Number(e.target.value) })}
                    className="input-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-base">Nota adicional para el cliente (opcional)</label>
                  <input
                    type="text"
                    value={formServicio.nota}
                    onChange={(e) => setFormServicio({ ...formServicio, nota: e.target.value })}
                    placeholder="Ej: Incluye prueba previa o limpieza"
                    className="input-base"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary text-xs py-2 px-4 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={15} />}
                  <span>Guardar Servicio</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreandoServicio(false);
                    setEditandoServicio(null);
                  }}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de Servicios */}
          <div className="grid gap-2.5 sm:gap-3">
            {(!empresa.servicios || empresa.servicios.length === 0) ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No hay servicios registrados en este comercio.</p>
            ) : (
              empresa.servicios.map((s) => (
                <div
                  key={s.id}
                  className="card-base flex items-center justify-between p-3.5 sm:p-4 gap-3 min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{s.nombre}</p>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span>{s.duracion} min</span>
                      <span>·</span>
                      <strong className="text-brand-700 font-bold">{money(s.precio)}</strong>
                      {s.nota && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[180px] sm:max-w-xs">{s.nota}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditandoServicio(s.id);
                        setFormServicio(s);
                      }}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label={`Editar ${s.nombre}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleEliminarServicio(s)}
                      disabled={deletingServiceId === s.id}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                      aria-label={`Eliminar ${s.nombre}`}
                      title={`Eliminar ${s.nombre}`}
                    >
                      {deletingServiceId === s.id ? (
                        <RefreshCw size={15} className="animate-spin text-red-500" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pestaña 2: Horarios y Días Cerrados */}
      {tab === "disponibilidad" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Horario Semanal */}
          <div className="card-base space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">Horario Semanal</h3>
                <p className="text-xs text-slate-500">Los días desactivados no serán ofrecidos por el bot.</p>
              </div>
              <button
                onClick={handleGuardarHorarios}
                disabled={isSaving}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
              >
                {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                <span>Guardar</span>
              </button>
            </div>
            <div className="space-y-3">
              {DIAS.map((d) => {
                const h = empresa.horario[d.key] || { abre: false, desde: "09:00", hasta: "18:00" };
                return (
                  <div key={d.key} className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-3">
                      <BotToggle
                        activo={h.abre}
                        onChange={(v) => setHorarioDia(d.key, { abre: v })}
                        ariaLabel={`Horario ${d.label}`}
                      />
                      <span className={`text-xs sm:text-sm font-semibold ${h.abre ? "text-slate-900" : "text-slate-400"}`}>
                        {d.label}
                      </span>
                    </div>

                    {h.abre ? (
                      <div className="flex items-center gap-1.5 text-xs pl-11 xs:pl-0">
                        <input
                          type="time"
                          value={h.desde}
                          onChange={(e) => setHorarioDia(d.key, { desde: e.target.value })}
                          className="rounded-xl border border-white bg-white/90 px-2 py-1 text-xs text-slate-800 font-semibold shadow-xs"
                        />
                        <span className="text-slate-400 font-medium">a</span>
                        <input
                          type="time"
                          value={h.hasta}
                          onChange={(e) => setHorarioDia(d.key, { hasta: e.target.value })}
                          className="rounded-xl border border-white bg-white/90 px-2 py-1 text-xs text-slate-800 font-semibold shadow-xs"
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 pl-11 xs:pl-0">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Días Cerrados Puntuales */}
          <div className="card-base space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">Días Cerrados Programados</h3>
              <p className="text-xs text-slate-500">Agrega festivos, vacaciones o eventos especiales.</p>
            </div>

            <form onSubmit={handleAgregarCierre} className="space-y-3">
              <div>
                <label className="label-base">Fecha</label>
                <input
                  type="date"
                  required
                  value={fechaCierre}
                  onChange={(e) => setFechaCierre(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">Motivo</label>
                <input
                  type="text"
                  placeholder="Ej: Aniversario del local"
                  value={motivoCierre}
                  onChange={(e) => setMotivoCierre(e.target.value)}
                  className="input-base"
                />
              </div>
              <button type="submit" className="btn-secondary text-xs w-full py-2 cursor-pointer flex items-center justify-center gap-1.5">
                <Plus size={15} /> Marcar Día Cerrado
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {(!empresa.cierres || empresa.cierres.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-4">No hay días cerrados programados.</p>
              ) : (
                empresa.cierres.map((c) => {
                  const isGoogleCalendar = c.source === "google_calendar" || String(c.id).startsWith("gcal_");
                  return (
                    <div key={c.id} className="flex items-center justify-between rounded-xl bg-amber-50/80 p-3 border border-amber-200/60">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-amber-900">{fechaLarga(c.fecha || c.closed_date)}</p>
                          {isGoogleCalendar && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 text-[10px] font-semibold">
                              Google Calendar
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-700 truncate">{c.motivo || c.reason}</p>
                      </div>
                      {isGoogleCalendar ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                          En Calendar
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEliminarCierre(c.id)}
                          className="text-amber-700 hover:text-amber-900 p-1 rounded-lg shrink-0 cursor-pointer"
                          aria-label="Eliminar día cerrado"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD

      {/* Modal para Modificar Información del Comercio */}
      <Modal
        isOpen={isEditBusinessModalOpen}
        onClose={() => setIsEditBusinessModalOpen(false)}
        title="Modificar Información del Comercio"
      >
        <form onSubmit={handleGuardarComercio} className="space-y-4">
          <div>
            <label className="label-base" htmlFor="edit-nombre">
              <span>Nombre del Comercio</span>
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="edit-nombre"
                type="text"
                required
                value={formComercio.nombre}
                onChange={(e) => setFormComercio({ ...formComercio, nombre: e.target.value })}
                placeholder="Nombre del negocio"
                className="input-base pl-9 sm:pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="label-base" htmlFor="edit-rubro">
                <span>Rubro / Categoría</span>
              </label>
              <select
                id="edit-rubro"
                value={formComercio.rubro}
                onChange={(e) => setFormComercio({ ...formComercio, rubro: e.target.value })}
                className="input-base"
              >
                <option value="Peluquería">Peluquería</option>
                <option value="Barbería">Barbería</option>
                <option value="Spas & Uñas">Spas & Uñas</option>
                <option value="Consultorio Medico">Consultorio Médico</option>
                <option value="Estética & Spa">Estética & Spa</option>
                <option value="Servicios Generales">Servicios Generales</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="label-base" htmlFor="edit-email">
                <span>Correo del Comercio</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="edit-email"
                  type="email"
                  value={formComercio.email}
                  onChange={(e) => setFormComercio({ ...formComercio, email: e.target.value })}
                  placeholder="comercio@ejemplo.com"
                  className="input-base pl-9 sm:pl-10"
                />
              </div>
            </div>
          </div>

          {/* Sección de Teléfonos: Bot de WhatsApp y Contacto Personal */}
          <div className="rounded-2xl bg-slate-50/80 p-3 sm:p-4 border border-slate-200/70 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Phone size={14} className="text-brand-600" />
              <span>Números de Teléfono del Comercio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* 1. Teléfono Bot */}
              <div>
                <label className="label-base flex items-center justify-between" htmlFor="edit-telefono-bot">
                  <span>Teléfono Bot (WhatsApp)</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Requerido</span>
                </label>
                <div className="relative">
                  <Bot size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="edit-telefono-bot"
                    type="text"
                    required
                    value={formComercio.telefonoBot}
                    onChange={(e) => setFormComercio({ ...formComercio, telefonoBot: e.target.value })}
                    placeholder="ej: 584121234567"
                    className="input-base pl-9 sm:pl-10"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Número por el cual los clientes conversan y reservan con el Bot.
                </p>
              </div>

              {/* 2. Teléfono Personal / Contacto */}
              <div>
                <label className="label-base flex items-center justify-between" htmlFor="edit-telefono-contacto">
                  <span>Teléfono Contacto / Personal</span>
                  <span className="text-[10px] text-slate-400 font-medium">Personal</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="edit-telefono-contacto"
                    type="text"
                    value={formComercio.telefonoContacto}
                    onChange={(e) => setFormComercio({ ...formComercio, telefonoContacto: e.target.value })}
                    placeholder="ej: 584149876543"
                    className="input-base pl-9 sm:pl-10"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Número privado del encargado para contacto directo con la plataforma.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="label-base" htmlFor="edit-calendar">
                <span>Google Calendar ID / Email</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="edit-calendar"
                  type="email"
                  value={formComercio.googleCalendarEmail}
                  onChange={(e) => setFormComercio({ ...formComercio, googleCalendarEmail: e.target.value })}
                  placeholder="agenda.negocio@gmail.com"
                  className="input-base pl-9 sm:pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-base" htmlFor="edit-timezone">
                <span>Zona Horaria</span>
              </label>
              <div className="relative">
                <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  id="edit-timezone"
                  value={formComercio.timezone}
                  onChange={(e) => setFormComercio({ ...formComercio, timezone: e.target.value })}
                  className="input-base pl-9 sm:pl-10"
                >
                  <option value="America/Caracas">America/Caracas (UTC-4)</option>
                  <option value="America/Bogota">America/Bogota (UTC-5)</option>
                  <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
                  <option value="America/Lima">America/Lima (UTC-5)</option>
                  <option value="America/Santiago">America/Santiago (UTC-4)</option>
                  <option value="America/Argentina/Buenos_Aires">America/Buenos_Aires (UTC-3)</option>
                  <option value="Europe/Madrid">Europe/Madrid (UTC+1)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="label-base" htmlFor="edit-greeting">
              <span>Mensaje de Bienvenida del Bot</span>
            </label>
            <div className="relative">
              <textarea
                id="edit-greeting"
                rows={2}
                value={formComercio.greetingMessage}
                onChange={(e) => setFormComercio({ ...formComercio, greetingMessage: e.target.value })}
                placeholder="¡Hola! Bienvenido a nuestro servicio de reservas. ¿En qué podemos ayudarte hoy?"
                className="input-base text-xs py-2"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditBusinessModalOpen(false)}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingBusiness}
              className="btn-primary text-xs py-2 px-4 cursor-pointer flex items-center gap-1.5"
            >
              {isSavingBusiness ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
=======
      {/* Modal para Compartir Enlace y Número de WhatsApp */}
      <ShareBusinessModal
        isOpen={mostrarModalShare}
        onClose={() => setMostrarModalShare(false)}
        empresa={empresa}
      />
>>>>>>> e858234caf68de8b72fa4230596ef4a27797eeaf
    </div>
  );
}
