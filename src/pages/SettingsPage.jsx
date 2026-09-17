import { Settings, ShieldCheck, Bell, Smartphone, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-normal text-slate-900">
          Ajustes de la Plataforma
        </h1>
        <p className="text-sm text-slate-500">
          Configuración global del bot de WhatsApp, tokens de integración y preferencias.
        </p>
      </div>

      <div className="card-base space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <Smartphone className="text-brand-600" size={20} />
          <div>
            <h3 className="text-base font-semibold text-slate-900">WhatsApp Business API</h3>
            <p className="text-xs text-slate-500">Estado de la conexión global del proveedor de WhatsApp.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Número Principal Administrador</label>
            <input type="text" readOnly value="+57 300 000 0000" className="input-base bg-slate-50" />
          </div>
          <div>
            <label className="label-base">Estado de la línea</label>
            <div className="input-base bg-slate-50 flex items-center gap-2 text-emerald-700 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Conectado a WhatsApp Cloud API
            </div>
          </div>
        </div>
      </div>

      <div className="card-base space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <Key className="text-brand-600" size={20} />
          <div>
            <h3 className="text-base font-semibold text-slate-900">Integración con Google Calendar</h3>
            <p className="text-xs text-slate-500">Credenciales OAuth2 y API Key para sincronización bidireccional.</p>
          </div>
        </div>

        <div>
          <label className="label-base">Cuenta Principal de Google Workspace</label>
          <input type="text" readOnly value="admin@mycitas.co" className="input-base bg-slate-50" />
        </div>
      </div>
    </div>
  );
}
