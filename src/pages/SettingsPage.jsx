import { Smartphone, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl min-w-0 w-full">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ajustes de la Plataforma
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configuración global del bot de WhatsApp, tokens de integración y preferencias.
        </p>
      </div>

      <div className="card-base space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <Smartphone className="text-brand-600 shrink-0" size={20} />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">WhatsApp Business API</h3>
            <p className="text-xs text-slate-500">Estado de la conexión global del proveedor de WhatsApp.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Número Principal Administrador</label>
            <input type="text" readOnly value="+57 300 000 0000" className="input-base bg-white/50" />
          </div>
          <div>
            <label className="label-base">Estado de la línea</label>
            <div className="input-base bg-white/50 flex items-center gap-2 text-emerald-700 font-semibold text-xs sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Conectado a WhatsApp Cloud API
            </div>
          </div>
        </div>
      </div>

      <div className="card-base space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <Key className="text-brand-600 shrink-0" size={20} />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">Integración con Google Calendar</h3>
            <p className="text-xs text-slate-500">Credenciales OAuth2 y sincronización bidireccional.</p>
          </div>
        </div>

        <div>
          <label className="label-base">Cuenta Principal de Google Workspace</label>
          <input type="text" readOnly value="admin@mycitas.glass" className="input-base bg-white/50" />
        </div>
      </div>
    </div>
  );
}
