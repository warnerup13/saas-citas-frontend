import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Zap,
  Clock,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";

function Burbuja({ de, children, visible }) {
  const cliente = de === "cliente";
  return (
    <div className={`flex ${cliente ? "justify-end" : "justify-start"}`}>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : 8,
          scale: visible ? 1 : 0.95,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed ${
          cliente
            ? "bg-gradient-to-r from-brand-600 to-cyanGlow-500 text-white rounded-tr-xs shadow-glow-blue"
            : "bg-white/90 backdrop-blur-md text-slate-800 border border-white/90 rounded-tl-xs shadow-glass"
        }`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function DemoConversacion() {
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    const t = [];
    for (let i = 1; i <= 5; i++) {
      t.push(setTimeout(() => setPaso(i), 400 + i * 850));
    }
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative rounded-3xl border border-white/90 bg-white/70 backdrop-blur-2xl p-4 sm:p-7 shadow-glass-lg overflow-hidden"
    >
      {/* Luz ambiental holográfica de fondo */}
      <div className="absolute -top-12 -right-12 w-40 sm:w-48 h-40 sm:h-48 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 sm:w-48 h-40 sm:h-48 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header del chat */}
      <div className="relative mb-4 sm:mb-5 flex items-center justify-between border-b border-slate-200/60 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 font-bold text-white shadow-glow-blue text-sm">
            A
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              Peluquería Amaranta
            </p>
            <p className="text-[11px] sm:text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
              Bot de WhatsApp Activo
            </p>
          </div>
        </div>
        <span className="glass-pill-cyan text-[10px] sm:text-[11px] py-1 px-2.5">
          <Zap size={11} className="text-cyan-600 shrink-0" /> IA Sync
        </span>
      </div>

      {/* Burbujas del chat */}
      <div className="relative space-y-2.5 sm:space-y-3 min-h-[220px] sm:min-h-[260px]">
        <Burbuja de="cliente" visible={paso >= 1}>
          Hola 👋, quiero agendar un corte para el sábado
        </Burbuja>
        <Burbuja de="bot" visible={paso >= 2}>
          ¡Hola! ✨ El sábado tengo libre a las 10:30 AM, 01:00 PM y 04:15 PM. ¿Cuál prefieres?
        </Burbuja>
        <Burbuja de="cliente" visible={paso >= 3}>
          A la 1:00 PM por favor
        </Burbuja>
        <Burbuja de="bot" visible={paso >= 4}>
          ¡Listo! 🎉 Cita confirmada para el sábado a la 1:00 PM (Corte dama - 45 min).
        </Burbuja>

        {/* Tarjeta Google Calendar */}
        {paso >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-3 sm:mt-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-teal-50/90 backdrop-blur-md border border-emerald-300/80 p-3 sm:p-4 shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              Sincronizado en Google Calendar
            </div>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar size={13} className="text-emerald-600 shrink-0" />
              Sábado · 1:00 PM — Corte dama
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function Hero({ irAlPanel }) {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-14 sm:pb-20">
      {/* Orbes de luz ambiental de fondo al estilo Nova Glass */}
      <div className="absolute top-10 left-1/4 -z-10 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-brand-500/15 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-20 right-1/4 -z-10 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Banner Superior Estilo Nova Glass */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="glass-pill-cyan">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
            <span className="font-bold tracking-wider uppercase text-[10px] sm:text-[11px]">DISPONIBLE 24/7 EN WHATSAPP</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-500">
            <ShieldCheck size={13} className="text-brand-600 shrink-0" />
            <span>Google Calendar Certified</span>
          </div>
        </div>

        {/* Grid Principal del Hero */}
        <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-12">
          
          {/* Lado Izquierdo: Tipografía Nova Glass y Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            {/* Título Holográfico Nova Glass */}
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] break-words">
                MYCITAS{" "}
                {/* <span className="bg-gradient-to-r from-[#0063fd] via-[#00a6ff] to-[#00d8d8] bg-clip-text text-transparent">
                  JW
                </span> */}
              </h1>
              <p className="text-xs sm:text-base font-semibold uppercase tracking-wider sm:tracking-widest text-slate-500">
                Automated WhatsApp Engine & Calendar Sync
              </p>
            </div>

            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Diseñado para negocios que no quieren perder clientes. El bot contesta al instante, calcula huecos libres en tu agenda y programa la cita en tu Google Calendar.
            </p>

            {/* Botones de Acción Estilo Nova Glass */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Link to="/demo" className="btn-primary group py-3 px-6 text-xs sm:text-sm">
                <Sparkles size={16} />
                PROBAR DEMO EN VIVO
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <button onClick={irAlPanel} className="btn-secondary py-3 px-6 text-xs sm:text-sm">
                ENTRAR AL PANEL
              </button>
            </div>
          </motion.div>

          {/* Lado Derecho: Chat Interactivo en Panel de Cristal */}
          <div className="lg:col-span-5 w-full">
            <DemoConversacion />
          </div>
        </div>

        {/* ============================================================ */}
        {/* BARRA DE ESTADÍSTICAS NOVA GLASS */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 sm:mt-14 rounded-3xl border border-white/90 bg-white/70 backdrop-blur-2xl p-4 sm:p-8 shadow-glass"
        >
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 items-center">
            
            {/* Stat 1 */}
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs font-semibold">
                <Zap size={13} className="text-brand-600 shrink-0" />
                <span className="truncate">Tiempo Respuesta</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">&lt; 0.8s</p>
              <p className="text-[11px] sm:text-xs text-slate-500">Respuesta instantánea</p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-0.5 sm:space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-4 lg:pl-6">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs font-semibold">
                <Clock size={13} className="text-cyan-600 shrink-0" />
                <span className="truncate">Disponibilidad</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">24 / 7</p>
              <p className="text-[11px] sm:text-xs text-slate-500">Atención sin pausas</p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-0.5 sm:space-y-1 lg:border-l lg:border-slate-200/80 lg:pl-6">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs font-semibold">
                <CalendarCheck size={13} className="text-emerald-600 shrink-0" />
                <span className="truncate">Citas Duplicadas</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">0%</p>
              <p className="text-[11px] sm:text-xs text-slate-500">Bloqueo en Google</p>
            </div>

            {/* Stat 4 */}
            <div className="space-y-0.5 sm:space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-4 lg:pl-6">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs font-semibold">
                <Sparkles size={13} className="text-indigo-600 shrink-0" />
                <span className="truncate">Conversión</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">+38%</p>
              <p className="text-[11px] sm:text-xs text-slate-500">Más reservas al mes</p>
            </div>

            {/* Cita inspiracional */}
            <div className="col-span-2 lg:col-span-1 border-t sm:border-t-0 sm:border-l sm:border-slate-200/80 pt-3 sm:pt-0 sm:pl-4 lg:pl-6">
              <p className="text-[11px] sm:text-xs italic text-slate-600 leading-relaxed">
                "La automatización ahorra tiempo y no deja escapar ninguna venta."
              </p>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
