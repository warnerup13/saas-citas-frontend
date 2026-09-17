import { motion } from "framer-motion";
import { Building2, ChevronRight, CalendarOff, Phone, Scissors, CalendarCheck } from "lucide-react";
import BotToggle from "../common/BotToggle";
import { fechaLarga } from "../../utils/formatters";

export default function EmpresaCard({ empresa, onToggle, onAbrir }) {
  const proximoCierre = empresa.cierres && empresa.cierres.length > 0 ? empresa.cierres[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass-panel p-5 sm:p-6 overflow-hidden hover:border-white shadow-glass"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Info principal del negocio */}
        <button
          onClick={() => onAbrir(empresa.id)}
          className="group flex flex-1 items-start gap-4 text-left focus:outline-none"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue transition-transform group-hover:scale-105">
            <Building2 size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-brand-600 transition-colors">
                {empresa.nombre}
              </h3>
              <span className={empresa.activo ? "badge-active" : "badge-inactive"}>
                <span className={`h-1.5 w-1.5 rounded-full ${empresa.activo ? "bg-emerald-500 animate-pulse-subtle" : "bg-slate-400"}`} />
                {empresa.activo ? "Respondiendo" : "En pausa"}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Scissors size={13} className="text-slate-400" />
                {empresa.rubro}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Phone size={13} className="text-slate-400" />
                {empresa.telefono}
              </span>
              {empresa.googleCalendarEmail && (
                <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50/80 px-2 py-0.5 rounded-lg border border-cyan-200/60 font-semibold">
                  <CalendarCheck size={13} className="text-cyan-600" />
                  {empresa.googleCalendarEmail}
                </span>
              )}
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <CalendarCheck size={13} className="text-brand-500" />
                {empresa.citasSemana} citas esta semana
              </span>
            </div>
          </div>
        </button>

        {/* Acciones y Switch del Bot */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:border-0 sm:pt-0 sm:justify-end gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden md:inline">
              Bot WhatsApp
            </span>
            <BotToggle
              activo={empresa.activo}
              onChange={(val) => onToggle(empresa.id, val)}
              ariaLabel={`Alternar bot para ${empresa.nombre}`}
            />
          </div>

          <button
            onClick={() => onAbrir(empresa.id)}
            aria-label={`Ver detalles de ${empresa.nombre}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Banner de próximo cierre programado si existe */}
      {proximoCierre && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50/80 px-3.5 py-2 text-xs font-medium text-amber-800 border border-amber-200/50">
          <CalendarOff size={14} className="shrink-0 text-amber-600" />
          <span>
            Cierra el <strong>{fechaLarga(proximoCierre.fecha)}</strong> — {proximoCierre.motivo}
          </span>
        </div>
      )}
    </motion.div>
  );
}
