import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Scissors, Power, Plus, Pencil, Trash2, CalendarOff, Check, X, CalendarCheck } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import BotToggle from "../components/common/BotToggle";
import { money, fechaLarga, DIAS, uid } from "../utils/formatters";

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

  const empresa = empresas.find((e) => e.id === Number(id));

  const [tab, setTab] = useState("servicios");
  const [creandoServicio, setCreandoServicio] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState(null);

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

  if (!empresa) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-base font-semibold text-slate-900">Comercio no encontrado</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary mt-4">
          Volver a la lista
        </button>
      </div>
    );
  }

  const handleGuardarServicio = (e) => {
    e.preventDefault();
    if (!formServicio.nombre.trim()) return;
    agregarServicio(empresa.id, {
      ...formServicio,
      id: formServicio.id || uid(),
    });
    setFormServicio({ nombre: "", duracion: 30, precio: 0, nota: "" });
    setCreandoServicio(false);
    setEditandoServicio(null);
  };

  const handleAgregarCierre = (e) => {
    e.preventDefault();
    if (!fechaCierre) return;
    agregarCierre(empresa.id, {
      id: uid(),
      fecha: fechaCierre,
      motivo: motivoCierre.trim() || "Cerrado",
    });
    setFechaCierre("");
    setMotivoCierre("");
  };

  const setHorarioDia = (key, patch) => {
    actualizarEmpresa(empresa.id, {
      horario: {
        ...empresa.horario,
        [key]: { ...empresa.horario[key], ...patch },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Todos los Negocios
      </button>

      {/* Header del Comercio */}
      <div className="card-base flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-normal text-slate-900">
              {empresa.nombre}
            </h1>
            <span className={empresa.activo ? "badge-active" : "badge-inactive"}>
              {empresa.activo ? "Bot Activo" : "En Pausa"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Scissors size={14} /> {empresa.rubro}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} /> {empresa.telefono}</span>
            <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 font-medium">
              <CalendarCheck size={13} className="text-blue-600" />
              Calendar: {empresa.googleCalendarEmail || "Sin vincular"}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CalendarCheck size={14} className="text-brand-600" /> {empresa.citasSemana} citas esta semana
            </span>
          </div>
        </div>

        {/* Card de activación rápida del Bot */}
        <div className={`flex items-center gap-4 rounded-2xl p-4 border transition-colors ${
          empresa.activo ? "bg-emerald-50/70 border-emerald-200/60" : "bg-slate-100/70 border-slate-200"
        }`}>
          <Power size={20} className={empresa.activo ? "text-emerald-600" : "text-slate-400"} />
          <div>
            <p className="text-xs font-semibold text-slate-900">
              {empresa.activo ? "El bot está respondiendo" : "El bot está en pausa"}
            </p>
            <p className="text-[11px] text-slate-500">
              {empresa.activo ? "Atiende y agenda automáticamente" : "Mensajes quedan sin responder"}
            </p>
          </div>
          <BotToggle
            activo={empresa.activo}
            onChange={(val) => actualizarEmpresa(empresa.id, { activo: val })}
            ariaLabel="Toggle Bot para este negocio"
          />
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "servicios", label: `Servicios (${empresa.servicios.length})` },
          { id: "disponibilidad", label: "Horarios y Días Cerrados" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-5 py-3 text-sm font-medium transition-colors ${
              tab === t.id ? "text-brand-600 font-semibold" : "text-slate-500 hover:text-slate-900"
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
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              El bot utiliza la duración de cada servicio para calcular los horarios libres en Google Calendar.
            </p>
            {!creandoServicio && !editandoServicio && (
              <button onClick={() => setCreandoServicio(true)} className="btn-primary text-xs">
                <Plus size={16} /> Agregar Servicio
              </button>
            )}
          </div>

          {/* Formulario Crear/Editar */}
          {(creandoServicio || editandoServicio) && (
            <form onSubmit={handleGuardarServicio} className="card-base bg-slate-50/80 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {editandoServicio ? "Editar Servicio" : "Nuevo Servicio"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-base">Nombre del Servicio</label>
                  <input
                    type="text"
                    required
                    value={formServicio.nombre}
                    onChange={(e) => setFormServicio({ ...formServicio, nombre: e.target.value })}
                    placeholder="Ej: Corte Dama + Secado"
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
                  <label className="label-base">Precio (COP)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
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
                    placeholder="Ej: Incluye prueba previa o lavado"
                    className="input-base"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary text-xs">
                  <Check size={16} /> Guardar Servicio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreandoServicio(false);
                    setEditandoServicio(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de Servicios */}
          <div className="grid gap-3">
            {empresa.servicios.map((s) => (
              <div
                key={s.id}
                className="card-base flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.nombre}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.duracion} min · <strong className="text-slate-700">{money(s.precio)}</strong>
                    {s.nota ? ` · ${s.nota}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditandoServicio(s.id);
                      setFormServicio(s);
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => eliminarServicio(empresa.id, s.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pestaña 2: Horarios y Días Cerrados */}
      {tab === "disponibilidad" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Horario Semanal */}
          <div className="card-base space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Horario Semanal</h3>
              <p className="text-xs text-slate-500">Los días desactivados no serán ofrecidos por el bot.</p>
            </div>
            <div className="space-y-3">
              {DIAS.map((d) => {
                const h = empresa.horario[d.key];
                return (
                  <div key={d.key} className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-3">
                      <BotToggle
                        activo={h.abre}
                        onChange={(v) => setHorarioDia(d.key, { abre: v })}
                        ariaLabel={`Horario ${d.label}`}
                      />
                      <span className={`text-sm font-medium ${h.abre ? "text-slate-900" : "text-slate-400"}`}>
                        {d.label}
                      </span>
                    </div>

                    {h.abre ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={h.desde}
                          onChange={(e) => setHorarioDia(d.key, { desde: e.target.value })}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800"
                        />
                        <span className="text-xs text-slate-400">a</span>
                        <input
                          type="time"
                          value={h.hasta}
                          onChange={(e) => setHorarioDia(d.key, { hasta: e.target.value })}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800"
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Días Cerrados Puntuales */}
          <div className="card-base space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Días Cerrados Programados</h3>
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
              <button type="submit" className="btn-secondary text-xs w-full">
                <Plus size={16} /> Marcar Día Cerrado
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {empresa.cierres.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No hay días cerrados programados.</p>
              ) : (
                empresa.cierres.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-amber-50 p-3 border border-amber-200/60">
                    <div>
                      <p className="text-xs font-semibold text-amber-900">{fechaLarga(c.fecha)}</p>
                      <p className="text-xs text-amber-700">{c.motivo}</p>
                    </div>
                    <button
                      onClick={() => eliminarCierre(empresa.id, c.id)}
                      className="text-amber-700 hover:text-amber-900 p-1"
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
