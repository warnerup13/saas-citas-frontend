import { motion } from "framer-motion";

export default function BotToggle({ activo, onChange, id, ariaLabel = "Alternar estado del bot" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={ariaLabel}
      aria-labelledby={id}
      onClick={() => onChange(!activo)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 ${
        activo ? "bg-emerald-600" : "bg-slate-300"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md ring-0 ${
          activo ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
