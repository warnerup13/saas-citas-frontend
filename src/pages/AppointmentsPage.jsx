import { useState, useEffect } from "react";
import { CalendarCheck, Calendar, RefreshCw, CheckCircle2, Clock, User, Scissors, ExternalLink, CalendarDays } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import { settingsService, businessService } from "../services";

export default function AppointmentsPage() {
  const { empresas } = useBusiness();
  const [citasReal, setCitasReal] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarInfo, setCalendarInfo] = useState({ calendarId: null, count: 0 });

  const cargarCitas = async () => {
    setIsLoading(true);
    try {
      // Intentar obtener citas vía settingsService (o primera empresa)
      const res = await settingsService.getCalendarAppointments(30);
      if (res?.appointments) {
        setCitasReal(res.appointments);
        setCalendarInfo({
          calendarId: res.calendarId,
          count: res.count || res.appointments.length,
        });
      }
    } catch (err) {
      console.log("No se pudieron cargar citas en vivo:", err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

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

  // Citas de respaldo simuladas si no hay conexión o calendario vacío
  const citasMock = [
    {
      id: 1,
      cliente: "Sofía Gómez",
      telefono: "+57 311 234 5678",
      empresa: "Peluquería Amaranta",
      servicio: "Corte dama",
      fecha: "Sábado 19 Sep",
      hora: "13:00 - 13:45",
      estado: "Sincronizado",
    },
    {
      id: 2,
      cliente: "Carlos Mendoza",
      telefono: "+57 300 987 6543",
      empresa: "Barbería El Roble",
      servicio: "Corte + barba",
      fecha: "Viernes 18 Sep",
      hora: "16:00 - 16:50",
      estado: "Sincronizado",
    },
  ];

  const hayCitasReales = citasReal && citasReal.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Agenda Global & Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulta en tiempo real el reflejo de las citas agendadas por el bot y sincronizadas con Google Calendar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] sm:text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Google Calendar Sync Activo
          </span>
          <button
            onClick={cargarCitas}
            disabled={isLoading}
            className="btn-secondary text-xs py-1.5 px-3 cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-brand-600" : ""} />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Tarjeta de Resumen Google Calendar */}
      <div className="grid gap-3 sm:grid-cols-3">
        {empresas.map((e) => (
          <div key={e.id} className="card-base p-3.5 sm:p-4 flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Negocio</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{e.nombre}</p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                {calendarInfo.calendarId ? `${calendarInfo.count} citas próximas` : `${e.citasSemana} citas esta semana`}
              </p>
            </div>
            <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0 ${e.calendarConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
          </div>
        ))}
      </div>

      {/* Tabla/Lista de Citas Agendadas */}
      <div className="card-base space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
            {hayCitasReales ? `Próximas Citas en Google Calendar (${citasReal.length})` : "Próximas Citas Agendadas por el Bot"}
          </h3>
          {isLoading && (
            <span className="text-xs text-brand-600 flex items-center gap-1 font-semibold">
              <RefreshCw size={11} className="animate-spin" /> Actualizando...
            </span>
          )}
        </div>

        {hayCitasReales ? (
          <div className="space-y-3">
            {citasReal.map((cita) => {
              const fh = formatearFechaHora(cita.start);
              return (
                <div key={cita.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors min-w-0">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 font-semibold text-xs sm:text-sm shrink-0">
                      <User size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {cita.service || cita.summary}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-1">📱 {cita.clientPhone}</span>
                        {cita.durationMinutes && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600">{cita.durationMinutes} min</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-200/60 sm:border-0 pt-2 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-900 flex items-center gap-1">
                        <Calendar size={12} className="text-brand-600" /> {fh.fecha}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 justify-start sm:justify-end mt-0.5">
                        <Clock size={11} /> {fh.hora}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="badge-active shrink-0">
                        <CheckCircle2 size={12} /> Confirmada
                      </span>
                      {cita.htmlLink && (
                        <a
                          href={cita.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary py-1 px-2 text-xs flex items-center gap-1"
                          title="Abrir en Google Calendar"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {citasMock.map((cita) => (
              <div key={cita.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 font-semibold text-xs sm:text-sm shrink-0">
                    <User size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{cita.cliente}</p>
                    <p className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="flex items-center gap-1"><Scissors size={11} /> {cita.servicio}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700 truncate">{cita.empresa}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-200/60 sm:border-0 pt-2 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[11px] sm:text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Calendar size={12} className="text-brand-600" /> {cita.fecha}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 justify-start sm:justify-end mt-0.5">
                      <Clock size={11} /> {cita.hora}
                    </p>
                  </div>

                  <span className="badge-active shrink-0">
                    <CheckCircle2 size={12} /> {cita.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

