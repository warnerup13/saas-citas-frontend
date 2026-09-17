import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
  Check,
  Scissors,
  Smile,
  HeartPulse,
  ChevronRight,
} from "lucide-react";

const DEMO_NEGOCIOS = [
  {
    id: "barberia",
    nombre: "Peluquería Amaranta",
    rubro: "Estética & Barbería",
    icono: Scissors,
    avatarBg: "from-blue-600 to-cyan-500",
    servicios: [
      { nombre: "Corte de Cabello", duracion: "35 min", precio: "$35.000" },
      { nombre: "Barba & Perfilado", duracion: "25 min", precio: "$25.000" },
      { nombre: "Combo Completo", duracion: "55 min", precio: "$55.000" },
    ],
    horarioHoy: "09:00 - 19:00",
    huecosHoy: ["11:00 AM", "02:30 PM", "04:15 PM", "05:30 PM"],
    saludoInicial: "¡Hola! 👋 Bienvenido a Peluquería Amaranta. ¿En qué te podemos consentir hoy?",
  },
  {
    id: "dental",
    nombre: "Clínica Sonrisas VIP",
    rubro: "Odontología & Salud",
    icono: Smile,
    avatarBg: "from-emerald-600 to-teal-400",
    servicios: [
      { nombre: "Limpieza Dental con Ultrasonido", duracion: "45 min", precio: "$80.000" },
      { nombre: "Valoración General", duracion: "30 min", precio: "Gratis" },
      { nombre: "Blanqueamiento Led", duracion: "60 min", precio: "$220.000" },
    ],
    horarioHoy: "08:00 - 18:00",
    huecosHoy: ["10:00 AM", "12:00 PM", "03:00 PM", "04:30 PM"],
    saludoInicial: "¡Hola! 🦷 Gracias por comunicarte con Clínica Sonrisas VIP. ¿Te gustaría agendar una valoración o una limpieza?",
  },
  {
    id: "spa",
    nombre: "Renacer Spa & Bienestar",
    rubro: "Spa & Masajes",
    icono: HeartPulse,
    avatarBg: "from-rose-500 to-pink-500",
    servicios: [
      { nombre: "Masaje Relajante con Piedras", duracion: "60 min", precio: "$95.000" },
      { nombre: "Limpieza Facial Profunda", duracion: "50 min", precio: "$85.000" },
      { nombre: "Circuito Hidroterapia", duracion: "90 min", precio: "$140.000" },
    ],
    horarioHoy: "10:00 - 20:00",
    huecosHoy: ["11:30 AM", "01:00 PM", "04:00 PM", "06:30 PM"],
    saludoInicial: "¡Bienvenida a Renacer Spa! ✨ Permítenos ayudarte a desconectar. ¿Qué tratamiento deseas agendar?",
  },
];

export default function DemoPage() {
  const navigate = useNavigate();
  const [negocioActivo, setNegocioActivo] = useState(DEMO_NEGOCIOS[0]);
  const [mensajes, setMensajes] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [citaConfirmada, setCitaConfirmada] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState({
    intencion: "Esperando interacción...",
    entidad: null,
    estadoSync: "Listo",
    confianza: "100%",
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    reiniciarChat(negocioActivo);
  }, [negocioActivo]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, isTyping]);

  const reiniciarChat = (negocio) => {
    setCitaConfirmada(null);
    setMensajes([
      {
        id: "m-0",
        emisor: "bot",
        texto: negocio.saludoInicial,
        hora: "10:00 AM",
      },
    ]);
    setAiAnalysis({
      intencion: "Saludo y Bienvenida",
      entidad: { negocio: negocio.nombre },
      estadoSync: "Sincronizado con Google Calendar",
      confianza: "99%",
    });
  };

  const enviarMensajeCliente = (texto) => {
    if (!texto.trim()) return;

    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nuevoMensaje = {
      id: "user-" + Date.now(),
      emisor: "cliente",
      texto: texto,
      hora: horaActual,
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      procesarRespuestaBot(texto, horaActual);
      setIsTyping(false);
    }, 850);
  };

  const procesarRespuestaBot = (textoUser, horaActual) => {
    const t = textoUser.toLowerCase();
    let respuesta = "";

    if (t.includes("precio") || t.includes("cuanto cuesta") || t.includes("servicios") || t.includes("tarifa")) {
      const lista = negocioActivo.servicios.map((s) => `• ${s.nombre} (${s.duracion}): ${s.precio}`).join("\n");
      respuesta = `Estos son nuestros servicios principales ✨:\n\n${lista}\n\n¿Cuál de estos te gustaría reservar?`;
      setAiAnalysis({
        intencion: "Consulta de Tarifas y Servicios",
        entidad: { serviciosDisponibles: negocioActivo.servicios.length },
        estadoSync: "Consulta de Catálogo OK",
        confianza: "98%",
      });
    } else if (t.includes("horario") || t.includes("disponible") || t.includes("hoy") || t.includes("tienen")) {
      const huecos = negocioActivo.huecosHoy.join(", ");
      respuesta = `Para hoy tenemos disponibilidad en Google Calendar en los siguientes turnos 🕒:\n\n📍 ${huecos}\n\n¿A cuál de estas horas te queda mejor venir?`;
      setAiAnalysis({
        intencion: "Consulta de Disponibilidad en Calendar",
        entidad: { huecosLibres: negocioActivo.huecosHoy },
        estadoSync: "Google Calendar API Query (0.4s)",
        confianza: "99%",
      });
    } else if (t.includes("confirmar") || t.includes("cita") || t.includes("agendar") || t.includes("quiero") || t.includes("pm") || t.includes("am")) {
      const s = negocioActivo.servicios[0];
      const h = negocioActivo.huecosHoy[1] || "3:00 PM";
      respuesta = `¡Excelente! He agendado y bloqueado tu turno en Google Calendar 🎉:\n\n📅 Fecha: Hoy\n⏰ Hora: ${h}\n✂️ Servicio: ${s.nombre} (${s.duracion})\n💰 Total: ${s.precio}\n\nTe esperamos con gusto. Te enviaré un recordatorio antes de tu turno.`;
      setCitaConfirmada({
        servicio: s.nombre,
        hora: h,
        duracion: s.duracion,
        precio: s.precio,
      });
      setAiAnalysis({
        intencion: "Creación de Evento en Google Calendar",
        entidad: { servicio: s.nombre, hora: h, cliente: "WhatsApp User" },
        estadoSync: "Google Calendar Event Created (201 Created)",
        confianza: "100%",
      });
    } else if (t.includes("ubicados") || t.includes("donde") || t.includes("direccion")) {
      respuesta = `Estamos ubicados en Calle 45 # 18 - 24, Barrio Laureles 📍. Contamos con parqueadero para clientes. ¡Te esperamos!`;
      setAiAnalysis({
        intencion: "Consulta de Ubicación Física",
        entidad: { direccion: "Calle 45 # 18 - 24" },
        estadoSync: "Respuesta de Base de Conocimiento",
        confianza: "97%",
      });
    } else {
      respuesta = `Con gusto te colaboro con eso ✨. Puedo darte horarios disponibles en tiempo real, agendar tu cita o darte información de servicios. ¿Deseas ver los horarios de hoy?`;
      setAiAnalysis({
        intencion: "Conversación General / Asistencia",
        entidad: null,
        estadoSync: "Procesador NLP Activo",
        confianza: "94%",
      });
    }

    setMensajes((prev) => [
      ...prev,
      {
        id: "bot-" + Date.now(),
        emisor: "bot",
        texto: respuesta,
        hora: horaActual,
      },
    ]);
  };

  const botonesRapidos = [
    "📅 ¿Qué horarios tienen hoy?",
    "💰 Ver servicios y precios",
    "✂️ Quiero confirmar cita a las " + (negocioActivo.huecosHoy[1] || "3:00 PM"),
    "📍 ¿Dónde están ubicados?",
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans pb-16 selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Header Nova Glass */}
      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-3 sm:py-3.5 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white font-bold shadow-glow-blue shrink-0">
                <Bot size={20} />
              </div>
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                mycitas<span className="text-cyan-500">.glass</span>
              </span>
            </Link>
            <span className="hidden md:inline-flex glass-pill-cyan text-xs font-bold shrink-0">
              SIMULADOR INTERACTIVO
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/login"
              className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
            >
              Acceso
            </Link>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
            >
              Panel
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero del Simulador */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="glass-pill-cyan mb-2.5 sm:mb-3">
            <Sparkles size={13} className="text-cyan-600" />
            <span className="font-bold">MOTOR DE IA EN TIEMPO REAL</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Así experimentan tus clientes el bot por WhatsApp
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-slate-600">
            Interactúa con el chat holográfico y observa cómo la IA procesa la intención y sincroniza Google Calendar.
          </p>
        </div>

        {/* Selector de Negocio Demo */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {DEMO_NEGOCIOS.map((negocio) => {
            const Icon = negocio.icono;
            const activo = negocioActivo.id === negocio.id;
            return (
              <button
                key={negocio.id}
                onClick={() => setNegocioActivo(negocio)}
                className={`flex items-center gap-2 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activo
                    ? "bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-glow-blue scale-102 border border-white"
                    : "glass-card text-slate-700 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                <span>{negocio.nombre}</span>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${activo ? "bg-white/20 text-white" : "bg-slate-200/60 text-slate-600"}`}>
                  {negocio.rubro.split("&")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid Principal: Chat Simulator + AI Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* SIMULADOR WHATSAPP NOVA GLASS (Col 7) */}
          <div className="lg:col-span-7 w-full">
            <div className="glass-panel overflow-hidden flex flex-col h-[500px] sm:h-[600px] lg:h-[650px] shadow-glass-lg">
              
              {/* Header de WhatsApp */}
              <div className="bg-slate-950 px-3.5 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between text-white border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className={`relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${negocioActivo.avatarBg} text-white font-bold text-xs sm:text-sm shadow-md`}>
                    {negocioActivo.nombre.charAt(0)}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h3 className="font-bold text-xs sm:text-sm leading-tight text-white font-display truncate">
                        {negocioActivo.nombre}
                      </h3>
                      <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.2 text-[9px] sm:text-[10px] text-cyan-300 font-bold border border-cyan-400/30 shrink-0">
                        Bot
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      En línea · Responde al instante
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => reiniciarChat(negocioActivo)}
                  className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/20 transition-colors border border-white/10 shrink-0"
                >
                  <RotateCcw size={12} />
                  <span className="hidden xs:inline">Reiniciar</span>
                </button>
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-gradient-to-b from-slate-50/50 to-white/40">
                
                <div className="mx-auto max-w-xs rounded-xl bg-cyan-50/80 border border-cyan-200/70 px-2.5 py-1 text-center text-[10px] sm:text-[11px] text-cyan-900 font-semibold shadow-xs">
                  🔒 Procesado por el motor de IA de mycitas.glass
                </div>

                <AnimatePresence>
                  {mensajes.map((m) => {
                    const isClient = m.emisor === "cliente";
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isClient
                              ? "bg-gradient-to-r from-brand-600 to-cyan-500 text-white rounded-tr-xs shadow-glow-blue"
                              : "bg-white/90 backdrop-blur-md text-slate-800 border border-white rounded-tl-xs shadow-xs"
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.texto}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[9px] sm:text-[10px] ${
                              isClient ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            <span>{m.hora}</span>
                            {isClient && <Check size={11} className="text-blue-200" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="rounded-2xl bg-white/90 border border-white px-3 sm:px-4 py-2 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-1 text-[11px] sm:text-xs text-slate-500 font-semibold">{negocioActivo.nombre} está respondiendo...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Botones de respuesta rápida */}
              <div className="border-t border-slate-200/60 bg-white/70 backdrop-blur-md px-2.5 sm:px-3 py-2 shrink-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Sparkles size={11} className="text-brand-600" />
                  Prueba rápida (clic para enviar):
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-20 sm:max-h-24 overflow-y-auto">
                  {botonesRapidos.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => enviarMensajeCliente(prompt)}
                      disabled={isTyping}
                      className="rounded-xl border border-white bg-white/85 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all text-left truncate max-w-full shadow-xs cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input manual */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  enviarMensajeCliente(inputText);
                }}
                className="border-t border-slate-200/60 bg-white/90 p-2.5 sm:p-3 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-2xl border border-white bg-slate-100/70 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white transition-all hover:scale-105 shadow-glow-blue disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Enviar mensaje"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* INSPECTOR NOVA GLASS (Col 5) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 w-full">
            
            {/* Tarjeta de Cita Agendada */}
            {citaConfirmada && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50/70 to-white p-4 sm:p-5 shadow-glass"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    ¡Cita Creada en Google Calendar!
                  </div>
                  <span className="rounded-full bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5">
                    Sync OK
                  </span>
                </div>

                <div className="mt-2.5 space-y-2">
                  <p className="text-sm sm:text-base font-bold text-slate-900 font-display">
                    {citaConfirmada.servicio}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-slate-700">
                    <span className="flex items-center gap-1 rounded-xl bg-white/90 border border-emerald-200 px-2.5 py-1 font-semibold text-[11px]">
                      <Clock size={12} className="text-emerald-600" />
                      {citaConfirmada.hora} ({citaConfirmada.duracion})
                    </span>
                    <span className="flex items-center gap-1 rounded-xl bg-white/90 border border-emerald-200 px-2.5 py-1 font-semibold text-[11px]">
                      💰 {citaConfirmada.precio}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-emerald-800 pt-0.5 font-medium">
                    ✨ Horario bloqueado automáticamente en Google Calendar.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Panel de Control de IA Nova Glass */}
            <div className="glass-panel p-4 sm:p-6">
              <div className="flex items-center gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-slate-200/60">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue font-bold shrink-0">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-display text-slate-900">
                    Motor de Decisión Nova Glass
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Procesamiento de Lenguaje Natural en tiempo real
                  </p>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[9px] sm:text-[10px] tracking-wider">
                    Intención Detectada:
                  </span>
                  <div className="mt-1 flex items-center justify-between rounded-2xl bg-white/80 border border-white p-2 sm:p-2.5 font-bold text-slate-800 shadow-xs">
                    <span className="truncate pr-2">{aiAnalysis.intencion}</span>
                    <span className="glass-pill-brand text-[9px] sm:text-[10px] font-extrabold shrink-0">
                      {aiAnalysis.confianza}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-bold text-[9px] sm:text-[10px] tracking-wider">
                    Sincronización Google Calendar:
                  </span>
                  <div className="mt-1 rounded-2xl bg-white/80 border border-white p-2 sm:p-2.5 text-slate-700 shadow-xs">
                    <p className="font-bold text-slate-900 truncate">{aiAnalysis.estadoSync}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-bold text-[9px] sm:text-[10px] tracking-wider">
                    Horario de Atención de Hoy:
                  </span>
                  <div className="mt-1 rounded-2xl bg-white/80 border border-white p-2 sm:p-2.5 text-slate-700 flex items-center justify-between shadow-xs">
                    <span className="font-semibold">{negocioActivo.horarioHoy}</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Abierto
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas de Rendimiento */}
            <div className="glass-panel p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-bold font-display text-slate-900 mb-2.5 sm:mb-3">
                Métricas Nova Glass
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
                <div className="rounded-2xl bg-white/70 border border-white p-2.5 sm:p-3 shadow-xs">
                  <p className="text-lg sm:text-xl font-extrabold text-brand-700 font-display">0.8s</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 font-semibold mt-0.5">Tiempo respuesta</p>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white p-2.5 sm:p-3 shadow-xs">
                  <p className="text-lg sm:text-xl font-extrabold text-cyan-600 font-display">24 / 7</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 font-semibold mt-0.5">Atención sin pausa</p>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white p-2.5 sm:p-3 shadow-xs">
                  <p className="text-lg sm:text-xl font-extrabold text-emerald-600 font-display">0%</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 font-semibold mt-0.5">Citas duplicadas</p>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white p-2.5 sm:p-3 shadow-xs">
                  <p className="text-lg sm:text-xl font-extrabold text-indigo-600 font-display">+38%</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 font-semibold mt-0.5">Más reservas</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-primary w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                >
                  Configurar tu Propio Bot
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
