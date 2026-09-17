import { CalendarCheck, Calendar, RefreshCw, CheckCircle2, Clock, User, Scissors } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";

export default function AppointmentsPage() {
  const { empresas } = useBusiness();

  // Citas simuladas sincronizadas con Google Calendar
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
    {
      id: 3,
      cliente: "Mariana Torres",
      telefono: "+57 315 444 3322",
      empresa: "Peluquería Amaranta",
      servicio: "Color completo",
      fecha: "Sábado 19 Sep",
      hora: "10:00 - 12:00",
      estado: "Sincronizado",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-normal text-slate-900">
            Agenda Global & Google Calendar
          </h1>
          <p className="text-sm text-slate-500">
            Consulta en tiempo real el reflejo de las citas agendadas por el bot de WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Google Calendar Sync Activo
          </span>
          <button className="btn-secondary text-xs">
            <RefreshCw size={14} /> Sincronizar Ahora
          </button>
        </div>
      </div>

      {/* Tarjeta de Resumen Google Calendar */}
      <div className="grid gap-4 sm:grid-cols-3">
        {empresas.map((e) => (
          <div key={e.id} className="card-base p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Negocio</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{e.nombre}</p>
              <p className="text-xs text-slate-500 mt-1">{e.citasSemana} citas agendadas esta semana</p>
            </div>
            <div className={`h-3 w-3 rounded-full ${e.calendarConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
          </div>
        ))}
      </div>

      {/* Tabla/Lista de Citas Agendadas */}
      <div className="card-base space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Próximas Citas Agendadas por el Bot</h3>

        <div className="space-y-3">
          {citasMock.map((cita) => (
            <div key={cita.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-semibold text-sm shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{cita.cliente}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Scissors size={12} /> {cita.servicio}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">{cita.empresa}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-slate-200/60 sm:border-0 pt-2 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                    <Calendar size={13} className="text-brand-600" /> {cita.fecha}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 justify-start sm:justify-end mt-0.5">
                    <Clock size={12} /> {cita.hora}
                  </p>
                </div>

                <span className="badge-active">
                  <CheckCircle2 size={13} /> {cita.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
