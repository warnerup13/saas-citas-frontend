import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAsComercio, loginAsAdmin } = useAuth();
  const { empresas } = useBusiness();

  const [activeTab, setActiveTab] = useState("comercio"); // 'comercio' | 'admin'
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(1);
  const [email, setEmail] = useState("amaranta@negocio.com");
  const [password, setPassword] = useState("comercio123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "comercio") {
      setEmail("amaranta@negocio.com");
    } else {
      setEmail("admin@mycitas.app");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (activeTab === "comercio") {
        const emp = empresas.find((e) => e.id === Number(selectedEmpresaId)) || empresas[0];
        loginAsComercio(emp.id, emp.nombre, email);
        setIsLoading(false);
        navigate("/comercio");
      } else {
        loginAsAdmin(email);
        setIsLoading(false);
        navigate("/dashboard");
      }
    }, 450);
  };

  const handleQuickComercio = (empresa) => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsComercio(empresa.id, empresa.nombre, `${empresa.nombre.toLowerCase().replace(/\s+/g, '')}@negocio.com`);
      setIsLoading(false);
      navigate("/comercio");
    }, 350);
  };

  const handleQuickAdmin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsAdmin();
      setIsLoading(false);
      navigate("/dashboard");
    }, 350);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-3.5 sm:px-4 py-8 sm:py-12 selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Luces de fondo ambientales estilo Nova Glass */}
      <div className="absolute top-10 left-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg min-w-0">
        {/* Header con Logo */}
        <div className="text-center mb-5 sm:mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 sm:gap-2.5 group transition-transform hover:scale-105"
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue transition-colors">
              <Bot size={22} className="sm:w-[26px] sm:h-[26px]" />
            </div>
            <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              mycitas<span className="text-cyan-500 font-normal">.glass</span>
            </span>
          </Link>
          <h1 className="mt-2.5 sm:mt-3 text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
            Acceso a la Plataforma
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Elige tu perfil de acceso para ingresar a tu entorno
          </p>
        </div>

        {/* Selector de Rol: Comercio vs Super Admin */}
        <div className="mb-3.5 sm:mb-4 grid grid-cols-2 gap-1.5 sm:gap-2 rounded-2xl bg-white/70 backdrop-blur-xl p-1.5 border border-white/90 shadow-glass">
          <button
            type="button"
            onClick={() => handleTabChange("comercio")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "comercio"
                ? "bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-glow-blue"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store size={15} />
            Soy un Comercio
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("admin")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "admin"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal size={15} />
            Administrador
          </button>
        </div>

        {/* Tarjeta Principal Nova Glass */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass-panel p-4 sm:p-8"
        >
          {activeTab === "comercio" ? (
            <div className="mb-4 sm:mb-5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-cyan-50/90 border border-blue-200/70 p-3 sm:p-4 text-xs text-blue-900 flex items-start gap-2.5 sm:gap-3 shadow-xs">
              <Zap size={16} className="text-brand-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px] sm:text-xs">
                <strong className="font-bold block">Portal del Comercio:</strong>
                Interfaz dedicada para encender/apagar tu bot de WhatsApp por días u horarios y ver tu Google Calendar sincronizado.
              </div>
            </div>
          ) : (
            <div className="mb-4 sm:mb-5 rounded-2xl bg-slate-100/90 border border-slate-200/80 p-3 sm:p-4 text-xs text-slate-800 flex items-start gap-2.5 sm:gap-3 shadow-xs">
              <ShieldCheck size={16} className="text-slate-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px] sm:text-xs">
                <strong className="font-bold block">Panel de Administradores:</strong>
                Gestión de todos los comercios registrados, servicios, métricas generales y sincronización con Google Calendar.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {activeTab === "comercio" && (
              <div>
                <label className="label-base">
                  Selecciona tu Comercio
                </label>
                <select
                  value={selectedEmpresaId}
                  onChange={(e) => setSelectedEmpresaId(e.target.value)}
                  className="input-base font-semibold"
                >
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} ({emp.rubro})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label-base">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-9 sm:pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-base">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pl-9 sm:pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Accediendo...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {activeTab === "comercio" ? "Ingresar a mi Negocio" : "Ingresar como Administrador"}
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          {/* Accesos Rápidos Demo */}
          <div className="relative my-4 sm:my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <span className="relative bg-white/90 px-2.5 sm:px-3 text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider rounded-full">
              Accesos rápidos 1-Clic
            </span>
          </div>

          {activeTab === "comercio" ? (
            <div className="space-y-2">
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mb-1">
                Entrar en 1 clic como comercio demo:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {empresas.slice(0, 2).map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleQuickComercio(emp)}
                    disabled={isLoading}
                    className="flex flex-col items-start rounded-2xl border border-white bg-white/70 p-2.5 sm:p-3 text-left transition-all hover:bg-white hover:shadow-glass active:scale-95 cursor-pointer min-w-0"
                  >
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 flex items-center gap-1 truncate max-w-full">
                      <Sparkles size={11} className="text-brand-600 shrink-0" /> {emp.nombre}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-cyan-700 font-semibold mt-0.5 truncate max-w-full">
                      Bot + Calendar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdmin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white bg-white/80 py-2 sm:py-2.5 text-xs font-bold text-slate-800 transition-all hover:bg-white hover:shadow-glass active:scale-95 cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              Acceso Rápido Administrador
            </button>
          )}

          {/* Enlaces de pie */}
          <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500">
            <Link to="/demo" className="hover:text-brand-600 transition-colors">
              Simulador WhatsApp
            </Link>
            <Link to="/" className="hover:text-brand-600 transition-colors">
              Volver al Inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
