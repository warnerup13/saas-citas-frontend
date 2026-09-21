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
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { useToast } from "../context/ToastContext";
import BotToggle from "../components/common/BotToggle";
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
  const [isSaving, setIsSaving] = useState(false);

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
    const nuevoItem = {
      id: formServicio.id || uid(),
      nombre: formServicio.nombre.trim(),
      duracion: Number(formServicio.duracion) || 30,
      precio: Number(formServicio.precio) || 0,
      nota: formServicio.nota || "",
      is_active: true,
    };

    try {
      let res;
      try {
        res = await businessService.createBusinessService(empresa.id, {
          name: nuevoItem.nombre,
          duration_minutes: nuevoItem.duracion,
          price: nuevoItem.precio,
          is_active: true,
        });
      } catch {
        res = await servicesService.createService({
          name: nuevoItem.nombre,
          duration_minutes: nuevoItem.duracion,
          price: nuevoItem.precio,
          is_active: true,
        });
      }

      if (res?.data?.id) {
        nuevoItem.id = res.data.id;
      }

      agregarServicio(empresa.id, nuevoItem);
      toast.success(res?.message || "Servicio registrado exitosamente en el catálogo.", {
        titulo: "Servicio Guardado",
      });
    } catch (err) {
      // Guardar en estado local y mostrar toast detallado
      agregarServicio(empresa.id, nuevoItem);
      toast.error(err, {
        titulo: "Fallo al guardar servicio en API",
      });
    } finally {
      setIsSaving(false);
      setFormServicio({ nombre: "", duracion: 30, precio: 0, nota: "" });
      setCreandoServicio(false);
      setEditandoServicio(null);
    }
  };

  const handleEliminarServicio = async (servicio) => {
    eliminarServicio(empresa.id, servicio.id, true);
    try {
      await businessService.deleteBusinessService(empresa.id, servicio.id);
      toast.info(`Servicio "${servicio.nombre}" removido`, {
        titulo: "Servicio Eliminado",
      });
    } catch {
      toast.info(`Servicio "${servicio.nombre}" removido`, {
        titulo: "Servicio Eliminado",
      });
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

          <div className="mt-2 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium"><Scissors size={13} /> {empresa.rubro}</span>
            <span className="flex items-center gap-1.5 font-medium"><Phone size={13} /> {empresa.telefono}</span>
            <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50/80 px-2 py-0.5 rounded-lg border border-cyan-200/60 font-semibold text-[11px] truncate max-w-full">
              <CalendarCheck size={12} className="text-cyan-600 shrink-0" />
              Calendar: {empresa.googleCalendarEmail || "Sin vincular"}
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <CalendarCheck size={13} className="text-brand-600" /> {empresa.citasSemana} citas esta semana
            </span>
          </div>
        </div>

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
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label={`Eliminar ${s.nombre}`}
                    >
                      <Trash2 size={15} />
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
                empresa.cierres.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-amber-50/80 p-3 border border-amber-200/60">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-amber-900">{fechaLarga(c.fecha || c.closed_date)}</p>
                      <p className="text-xs text-amber-700 truncate">{c.motivo || c.reason}</p>
                    </div>
                    <button
                      onClick={() => handleEliminarCierre(c.id)}
                      className="text-amber-700 hover:text-amber-900 p-1 rounded-lg shrink-0 cursor-pointer"
                      aria-label="Eliminar día cerrado"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
