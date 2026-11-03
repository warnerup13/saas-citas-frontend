import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ChevronRight, CalendarOff, Phone, Scissors, CalendarCheck, Bot, MessageCircle } from "lucide-react";
import BotToggle from "../common/BotToggle";
import ShareBusinessModal from "../common/ShareBusinessModal";
import { fechaLarga } from "../../utils/formatters";

export default function EmpresaCard({ empresa, onToggle, onAbrir }) {
  const [mostrarModalShare, setMostrarModalShare] = useState(false);
  const proximoCierre = empresa.cierres && empresa.cierres.length > 0 ? empresa.cierres[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass-panel p-4 sm:p-6 overflow-hidden hover:border-white shadow-glass min-w-0 w-full"
    >
      <div className="flex flex-col gap-3.5 sm:gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        {/* Info principal del negocio */}
        <button
          onClick={() => onAbrir(empresa.id)}
          className="group flex flex-1 items-start gap-3 sm:gap-4 text-left focus:outline-none min-w-0 w-full cursor-pointer"
        >
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue transition-transform group-hover:scale-105">
            <Building2 size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 group-hover:text-brand-600 transition-colors truncate max-w-full">
                {empresa.nombre}
              </h3>
              <span className={empresa.activo ? "badge-active" : "badge-inactive"}>
                <span className={`h-1.5 w-1.5 rounded-full ${empresa.activo ? "bg-emerald-500 animate-pulse-subtle" : "bg-slate-400"}`} />
                {empresa.activo ? "Respondiendo" : "En pausa"}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Scissors size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{empresa.rubro}</span>
              </span>
              <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-200/60 text-[11px]">
                <Bot size={12} className="text-emerald-600 shrink-0" />
                <span className="font-semibold">Bot: {empresa.telefonoBot || empresa.telefono}</span>
              </span>
              {empresa.telefonoContacto && (
                <span className="flex items-center gap-1 font-medium text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-lg border border-blue-200/60 text-[11px]">
                  <Phone size={11} className="text-blue-600 shrink-0" />
                  <span>Contacto: {empresa.telefonoContacto}</span>
                </span>
              )}
              {empresa.googleCalendarEmail && (
                <span className="flex items-center gap-1 text-cyan-700 bg-cyan-50/80 px-2 py-0.5 rounded-lg border border-cyan-200/60 font-semibold text-[11px] max-w-full truncate">
                  <CalendarCheck size={12} className="text-cyan-600 shrink-0" />
                  <span className="truncate">{empresa.googleCalendarEmail}</span>
                </span>
              )}
              <span className="flex items-center gap-1 font-bold text-slate-700 text-[11px] sm:text-xs">
                <CalendarCheck size={12} className="text-brand-500 shrink-0" />
                <span>{empresa.citasSemana} citas</span>
              </span>
            </div>
          </div>
        </button>

        {/* Acciones y Switch del Bot */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 sm:border-0 sm:pt-0 sm:justify-end gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMostrarModalShare(true);
            }}
            className="flex h-9 px-2.5 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-200/70 transition-colors text-xs font-bold cursor-pointer"
            title="Compartir enlace de WhatsApp o escribirle al bot"
          >
            <MessageCircle size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 sm:hidden md:inline">
              Bot
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors active:scale-95 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Banner de próximo cierre programado si existe */}
      {proximoCierre && (
        <div className="mt-3 sm:mt-4 flex items-center gap-2 rounded-xl bg-amber-50/80 px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium text-amber-800 border border-amber-200/50">
          <CalendarOff size={13} className="shrink-0 text-amber-600" />
          <span className="truncate">
            Cierra el <strong>{fechaLarga(proximoCierre.fecha)}</strong> — {proximoCierre.motivo}
          </span>
        </div>
      )}
      {/* Modal para Compartir Enlace y Número de WhatsApp */}
      <ShareBusinessModal
        isOpen={mostrarModalShare}
        onClose={() => setMostrarModalShare(false)}
        empresa={empresa}
      />
    </motion.div>
  );
}
