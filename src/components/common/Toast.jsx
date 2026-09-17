import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-brand-500" />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-soft-lg border border-slate-800"
      >
        {icons[toast.tipo || "info"]}
        <span className="text-xs font-medium text-slate-100">{toast.mensaje}</span>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white p-0.5"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
