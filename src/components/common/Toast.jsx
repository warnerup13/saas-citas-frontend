import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

/**
 * Toast Individual con diseño Nova Glass limpio, elegante y profesional
 */
function ToastItem({ toast, onRemove }) {
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cierre con timer si duracion está definida
  useEffect(() => {
    if (!toast.duracion || isPaused) return;

    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duracion);

    return () => clearTimeout(timer);
  }, [toast.duracion, toast.id, onRemove, isPaused]);

  const getTheme = () => {
    switch (toast.tipo) {
      case "success":
        return {
          icon: <CheckCircle2 size={17} className="text-emerald-600" />,
          iconBg: "bg-emerald-50 border border-emerald-200/80 shadow-xs",
          border: "border-emerald-200/90",
          glow: "shadow-[0_14px_35px_-6px_rgba(16,185,129,0.18)]",
          progressBar: "bg-gradient-to-r from-emerald-500 to-teal-500",
          accentLight: "bg-emerald-500/10",
        };
      case "error":
        return {
          icon: <AlertCircle size={17} className="text-rose-600" />,
          iconBg: "bg-rose-50 border border-rose-200/80 shadow-xs",
          border: "border-rose-200/90",
          glow: "shadow-[0_14px_35px_-6px_rgba(244,63,94,0.18)]",
          progressBar: "bg-gradient-to-r from-rose-500 to-red-600",
          accentLight: "bg-rose-500/10",
        };
      case "warning":
        return {
          icon: <AlertTriangle size={17} className="text-amber-600" />,
          iconBg: "bg-amber-50 border border-amber-200/80 shadow-xs",
          border: "border-amber-200/90",
          glow: "shadow-[0_14px_35px_-6px_rgba(245,158,11,0.18)]",
          progressBar: "bg-gradient-to-r from-amber-500 to-orange-500",
          accentLight: "bg-amber-500/10",
        };
      case "loading":
        return {
          icon: <Loader2 size={17} className="text-cyan-600 animate-spin" />,
          iconBg: "bg-cyan-50 border border-cyan-200/80 shadow-xs",
          border: "border-cyan-200/90",
          glow: "shadow-[0_14px_35px_-6px_rgba(6,182,212,0.18)]",
          progressBar: "bg-gradient-to-r from-brand-600 to-cyan-500",
          accentLight: "bg-cyan-500/10",
        };
      default:
        return {
          icon: <Info size={17} className="text-brand-600" />,
          iconBg: "bg-blue-50 border border-blue-200/80 shadow-xs",
          border: "border-blue-200/90",
          glow: "shadow-[0_14px_35px_-6px_rgba(0,99,253,0.18)]",
          progressBar: "bg-gradient-to-r from-brand-600 to-blue-500",
          accentLight: "bg-brand-500/10",
        };
    }
  };

  const theme = getTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border bg-white/95 text-slate-900 backdrop-blur-2xl ${theme.border} ${theme.glow} shadow-xl`}
    >
      {/* Luz ambiental sutil */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${theme.accentLight}`}
      />

      <div className="relative p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Icono temático destacado */}
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} mt-0.5`}>
            {theme.icon}
          </div>

          {/* Contenido: Título y Mensaje legible */}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs sm:text-sm font-bold font-display tracking-tight text-slate-900 leading-snug">
              {toast.titulo || (toast.tipo === "error" ? "Aviso" : "Notificación")}
            </h4>
            <p className="mt-0.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-medium">
              {toast.mensaje}
            </p>
          </div>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={() => onRemove(toast.id)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer shrink-0 mt-0.5"
            aria-label="Cerrar notificación"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Barra de progreso de auto-cierre */}
      {toast.duracion && !isPaused && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duracion / 1000, ease: "linear" }}
          className={`h-1 w-full ${theme.progressBar}`}
        />
      )}
    </motion.div>
  );
}

/**
 * Contenedor Global de Toasts
 */
export default function Toast({ toast: propToast, onClose: propOnClose }) {
  let toastContext = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    toastContext = useToast();
  } catch (e) {
    toastContext = null;
  }

  // Compatibilidad con prop heredada
  if (propToast) {
    return (
      <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-auto">
        <ToastItem
          toast={{
            id: "legacy-toast",
            tipo: propToast.tipo || "info",
            titulo: propToast.tipo === "error" ? "Error" : propToast.tipo === "success" ? "Éxito" : "Aviso",
            mensaje: propToast.mensaje,
            duracion: 4000,
          }}
          onRemove={propOnClose || (() => {})}
        />
      </div>
    );
  }

  if (!toastContext || !toastContext.toasts.length) return null;

  return (
    <div
      className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      style={{ isolation: "isolate" }}
    >
      <AnimatePresence mode="popLayout">
        {toastContext.toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItem toast={item} onRemove={toastContext.removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
