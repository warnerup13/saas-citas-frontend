import { useState } from "react";
import {
  Smartphone,
  Key,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Shield,
} from "lucide-react";
import { API_CONFIG, getActiveBaseUrl, setActiveBaseUrl } from "../config/apiConfig";
import { authService, apiClient } from "../services";
import { useToast } from "../context/ToastContext";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeUrl, setActiveUrlState] = useState(getActiveBaseUrl());
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const currentToken = authService.getToken();

  const handleSelectPreset = (url) => {
    setActiveUrlState(url);
    setActiveBaseUrl(url);
    toast.info(`URL de API cambiada a: ${url}`);
  };

  const handleTestConnection = async () => {
    setTestingPing(true);
    setPingResult(null);
    const startTime = Date.now();

    try {
      // Intentar una llamada de lectura rápida a servicios o schedules
      const response = await apiClient.get("/services");
      const latency = Date.now() - startTime;
      const resData = {
        ok: true,
        latency,
        status: response.status,
        message: "Conexión exitosa con el backend.",
        count: response.data?.count ?? (Array.isArray(response.data?.data) ? response.data.data.length : "OK"),
      };
      setPingResult(resData);
      toast.success(`Conexión exitosa con el backend (${latency}ms) - HTTP ${response.status}`, {
        titulo: "Backend Online & Saludable",
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      const resData = {
        ok: false,
        latency,
        status: error.status || 0,
        message: error.message || "Fallo en la conexión",
        detalle: error.detalle,
      };
      setPingResult(resData);
      toast.error(error, {
        titulo: `Fallo de conexión (${latency}ms)`,
      });
    } finally {
      setTestingPing(false);
    }
  };

  const handleCopyToken = () => {
    if (!currentToken) return;
    navigator.clipboard.writeText(currentToken);
    setCopiedToken(true);
    toast.success("Token JWT copiado al portapapeles.");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl min-w-0 w-full pb-12">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ajustes de la Plataforma
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configuración global del backend SaaS Citas, bot de WhatsApp, tokens de autenticación y Google Calendar.
        </p>
      </div>

      {/* 1. Conexión con Backend REST & Health Check */}
      <div className="card-base space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 font-bold">
              <Server size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                Conexión Backend REST (SaaS Citas)
              </h3>
              <p className="text-xs text-slate-500">
                Configuración del endpoint central y comprobación de latencia en vivo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingPing}
            className="btn-primary text-xs py-2 px-4 self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
          >
            {testingPing ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Probando conexión...
              </>
            ) : (
              <>
                <Activity size={14} />
                Test de Conexión (Ping)
              </>
            )}
          </button>
        </div>

        {/* Selector de Entornos */}
        <div className="space-y-3">
          <label className="label-base">Entorno Activo</label>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSelectPreset(API_CONFIG.devBaseURL)}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                activeUrl === API_CONFIG.devBaseURL
                  ? "border-brand-500 bg-brand-50/60 shadow-xs"
                  : "border-slate-200 bg-white/70 hover:bg-white"
              }`}
            >
              <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${activeUrl === API_CONFIG.devBaseURL ? "bg-brand-600" : "bg-slate-300"}`} />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Desarrollo Local</span>
                <span className="text-[11px] font-mono text-slate-500 block">{API_CONFIG.devBaseURL}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset(API_CONFIG.prodBaseURL)}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                activeUrl === API_CONFIG.prodBaseURL
                  ? "border-brand-500 bg-brand-50/60 shadow-xs"
                  : "border-slate-200 bg-white/70 hover:bg-white"
              }`}
            >
              <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${activeUrl === API_CONFIG.prodBaseURL ? "bg-brand-600" : "bg-slate-300"}`} />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Producción Cloud</span>
                <span className="text-[11px] font-mono text-slate-500 block">{API_CONFIG.prodBaseURL}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Resultado del Test de Ping */}
        {pingResult && (
          <div
            className={`rounded-2xl border p-3.5 sm:p-4 text-xs flex items-start gap-3 transition-all ${
              pingResult.ok
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                : "bg-red-50/90 border-red-200 text-red-950"
            }`}
          >
            {pingResult.ok ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between font-bold">
                <span>{pingResult.ok ? "Servidor Conectado & Operativo" : "Servidor No Disponible"}</span>
                <span className="font-mono text-[11px] bg-white/60 px-2 py-0.5 rounded-md border border-black/5">
                  {pingResult.latency} ms
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">{pingResult.message}</p>
              {pingResult.detalle && (
                <p className="text-[10px] font-mono opacity-80 break-words">{pingResult.detalle}</p>
              )}
            </div>
          </div>
        )}

        {/* Token JWT Activo */}
        <div className="pt-2">
          <label className="label-base flex items-center justify-between">
            <span>Token JWT Autenticado</span>
            <span className="text-[10px] font-normal text-slate-400">Header: Authorization Bearer</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentToken ? `${currentToken.slice(0, 32)}...${currentToken.slice(-16)}` : "No hay token almacenado (Inicia sesión para obtenerlo)"}
              className="input-base font-mono text-xs bg-white/50 text-slate-600"
            />
            {currentToken && (
              <button
                type="button"
                onClick={handleCopyToken}
                className="btn-secondary text-xs py-2 px-3 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedToken ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>Copiar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. WhatsApp API */}
      <div className="card-base space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">WhatsApp Business API</h3>
            <p className="text-xs text-slate-500">Estado de la conexión global del proveedor de WhatsApp Cloud.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Línea Telefónica Principal</label>
            <input type="text" readOnly value="+58 412 123 4567" className="input-base bg-white/50" />
          </div>
          <div>
            <label className="label-base">Estado de la línea</label>
            <div className="input-base bg-white/50 flex items-center gap-2 text-emerald-700 font-semibold text-xs sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Conectado a WhatsApp Cloud API (24/7)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Google Calendar */}
      <div className="card-base space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 font-bold">
            <Key size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">Integración con Google Calendar</h3>
            <p className="text-xs text-slate-500">Credenciales OAuth2 y sincronización bidireccional de agenda.</p>
          </div>
        </div>

        <div>
          <label className="label-base">Cuenta Principal de Google Workspace</label>
          <input type="text" readOnly value="admin@mycitas.online" className="input-base bg-white/50" />
        </div>
      </div>
    </div>
  );
}
