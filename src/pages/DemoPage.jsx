import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
  Check,
  Smartphone,
  CalendarDays,
  Scissors,
  Smile,
  HeartPulse,
  ChevronRight,
  ShieldCheck,
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
      respuesta = `Estos son nuestros servicios disponibles:\n\n${lista}\n\n¿Cuál de ellos deseas agendar y para qué día u hora?`;
      setAiAnalysis({
        intencion: "Consulta de Catálogo & Precios",
        entidad: { catalogo: negocioActivo.servicios.length + " servicios" },
        estadoSync: "Consulta de Base de Datos",
        confianza: "98%",
      });
    } else if (t.includes("horario") || t.includes("disponible") || t.includes("mañana") || t.includes("hoy") || t.includes("libre")) {
      respuesta = `Para hoy tenemos disponibilidad en los siguientes horarios libres:\n\n👉 ${negocioActivo.huecosHoy.join("  |  ")}\n\n¿Cuál de estos te sienta mejor?`;
      setAiAnalysis({
        intencion: "Consulta de Disponibilidad",
        entidad: { slotsLibres: negocioActivo.huecosHoy },
        estadoSync: "Consulta en Google Calendar en tiempo real",
        confianza: "99%",
      });
    } else if (
      t.includes("11:00") ||
      t.includes("02:30") ||
      t.includes("04:15") ||
      t.includes("05:30") ||
      t.includes("10:00") ||
      t.includes("12:00") ||
      t.includes("03:00") ||
      t.includes("04:30") ||
      t.includes("11:30") ||
      t.includes("01:00") ||
      t.includes("04:00") ||
      t.includes("06:30") ||
      t.includes("confirm") ||
      t.includes("quiero a las") ||
      t.includes("a las")
    ) {
      const servicioElegido = negocioActivo.servicios[0];
      const horaExtraida = negocioActivo.huecosHoy[1] || "3:00 PM";
      
      respuesta = `¡Excelente! 🎉 Tu cita para "${servicioElegido.nombre}" ha quedado confirmada para hoy a las ${horaExtraida}.\n\n📅 Ya la he añadido a tu Google Calendar y te enviaré un recordatorio 2 horas antes. ¡Te esperamos!`;
      
      setCitaConfirmada({
        servicio: servicioElegido.nombre,
        hora: horaExtraida,
        duracion: servicioElegido.duracion,
        precio: servicioElegido.precio,
        negocio: negocioActivo.nombre,
      });

      setAiAnalysis({
        intencion: "Confirmación y Reserva de Cita",
        entidad: { servicio: servicioElegido.nombre, hora: horaExtraida },
        estadoSync: "✅ Evento creado en Google Calendar",
        confianza: "100%",
      });
    } else {
      respuesta = `Con gusto te agendo. En ${negocioActivo.nombre} atendemos de ${negocioActivo.horarioHoy}. Puedes elegir uno de nuestros servicios o pedirme los horarios libres de hoy.`;
      setAiAnalysis({
        intencion: "Atención General / Asistencia",
        entidad: { horario: negocioActivo.horarioHoy },
        estadoSync: "En espera de selección",
        confianza: "95%",
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
    "📅 ¿Qué horarios tienen disponibles hoy?",
    "💰 Ver lista de servicios y precios",
    "✂️ Quiero confirmar una cita a las " + (negocioActivo.huecosHoy[1] || "3:00 PM"),
    "📍 ¿Dónde están ubicados?",
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans pb-16 selection:bg-brand-500 selection:text-white">
      {/* Header Nova Glass */}
      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white font-bold shadow-glow-blue">
                <Bot size={22} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
                mycitas<span className="text-cyan-500">.glass</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex glass-pill-cyan text-xs font-bold">
              SIMULADOR INTERACTIVO NOVA GLASS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="btn-secondary text-xs sm:text-sm py-2 px-4"
            >
              Iniciar Sesión
            </Link>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary text-xs sm:text-sm py-2 px-4"
            >
              Entrar al Panel
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero del Simulador */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-4">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="glass-pill-cyan mb-3">
            <Sparkles size={14} className="text-cyan-600" />
            <span className="font-bold">MOTOR DE IA EN TIEMPO REAL</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Así experimentan tus clientes el bot por WhatsApp
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Interactúa con el chat holográfico y observa cómo la IA procesa la intención y sincroniza Google Calendar.
          </p>
        </div>

        {/* Selector de Negocio Demo */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {DEMO_NEGOCIOS.map((negocio) => {
            const Icon = negocio.icono;
            const activo = negocioActivo.id === negocio.id;
            return (
              <button
                key={negocio.id}
                onClick={() => setNegocioActivo(negocio)}
                className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                  activo
                    ? "bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-glow-blue scale-102 border border-white"
                    : "glass-card text-slate-700 hover:text-slate-900"
                }`}
              >
                <Icon size={17} />
                <span>{negocio.nombre}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activo ? "bg-white/20 text-white" : "bg-slate-200/60 text-slate-600"}`}>
                  {negocio.rubro.split("&")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid Principal: Chat Simulator + AI Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIMULADOR WHATSAPP NOVA GLASS (Col 7) */}
          <div className="lg:col-span-7">
            <div className="glass-panel overflow-hidden flex flex-col h-[650px] shadow-glass-lg">
              
              {/* Header de WhatsApp */}
              <div className="bg-slate-950 px-5 py-3.5 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr ${negocioActivo.avatarBg} text-white font-bold text-sm shadow-md`}>
                    {negocioActivo.nombre.charAt(0)}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm leading-tight text-white font-display">
                        {negocioActivo.nombre}
                      </h3>
                      <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.2 text-[10px] text-cyan-300 font-bold border border-cyan-400/30">
                        Bot Activo
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      En línea · Responde en segundos
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => reiniciarChat(negocioActivo)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/20 transition-colors border border-white/10"
                >
                  <RotateCcw size={13} />
                  <span>Reiniciar</span>
                </button>
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white/40">
                
                <div className="mx-auto max-w-xs rounded-xl bg-cyan-50/80 border border-cyan-200/70 px-3 py-1.5 text-center text-[11px] text-cyan-900 font-semibold shadow-xs">
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
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                            isClient
                              ? "bg-gradient-to-r from-brand-600 to-cyan-500 text-white rounded-tr-xs shadow-glow-blue"
                              : "bg-white/90 backdrop-blur-md text-slate-800 border border-white rounded-tl-xs shadow-xs"
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.texto}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              isClient ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            <span>{m.hora}</span>
                            {isClient && <Check size={12} className="text-blue-200" />}
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
                    <div className="rounded-2xl bg-white/90 border border-white px-4 py-2.5 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-600 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="h-2 w-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-1 text-slate-500 font-semibold">{negocioActivo.nombre} está escribiendo...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Botones de respuesta rápida */}
              <div className="border-t border-slate-200/60 bg-white/70 backdrop-blur-md px-3 py-2">
                <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Sparkles size={12} className="text-brand-600" />
                  Prueba rápida (clic para enviar):
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {botonesRapidos.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => enviarMensajeCliente(prompt)}
                      disabled={isTyping}
                      className="rounded-xl border border-white bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all text-left truncate max-w-full shadow-xs"
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
                className="border-t border-slate-200/60 bg-white/90 p-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe un mensaje o haz una pregunta..."
                  className="flex-1 rounded-2xl border border-white bg-slate-100/70 px-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white transition-all hover:scale-105 shadow-glow-blue disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* INSPECTOR NOVA GLASS (Col 5) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Tarjeta de Cita Agendada */}
            {citaConfirmada && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50/70 to-white p-5 shadow-glass"
              >
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    ¡Cita Creada en Google Calendar!
                  </div>
                  <span className="rounded-full bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                    Sync OK
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-base font-bold text-slate-900 font-display">
                    {citaConfirmada.servicio}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                    <span className="flex items-center gap-1 rounded-xl bg-white/90 border border-emerald-200 px-2.5 py-1 font-semibold">
                      <Clock size={13} className="text-emerald-600" />
                      {citaConfirmada.hora} ({citaConfirmada.duracion})
                    </span>
                    <span className="flex items-center gap-1 rounded-xl bg-white/90 border border-emerald-200 px-2.5 py-1 font-semibold">
                      💰 {citaConfirmada.precio}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 pt-1 font-medium">
                    ✨ Horario bloqueado automáticamente en Google Calendar.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Panel de Control de IA Nova Glass */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue font-bold">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-slate-900">
                    Motor de Decisión Nova Glass
                  </h3>
                  <p className="text-xs text-slate-500">
                    Procesamiento de Lenguaje Natural en tiempo real
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    Intención Detectada:
                  </span>
                  <div className="mt-1 flex items-center justify-between rounded-2xl bg-white/80 border border-white p-2.5 font-bold text-slate-800 shadow-xs">
                    <span>{aiAnalysis.intencion}</span>
                    <span className="glass-pill-brand text-[10px] font-extrabold">
                      {aiAnalysis.confianza}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    Sincronización Google Calendar:
                  </span>
                  <div className="mt-1 rounded-2xl bg-white/80 border border-white p-2.5 text-slate-700 shadow-xs">
                    <p className="font-bold text-slate-900">{aiAnalysis.estadoSync}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    Horario de Atención de Hoy:
                  </span>
                  <div className="mt-1 rounded-2xl bg-white/80 border border-white p-2.5 text-slate-700 flex items-center justify-between shadow-xs">
                    <span className="font-semibold">{negocioActivo.horarioHoy}</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Abierto
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas de Rendimiento */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-bold font-display text-slate-900 mb-3">
                Métricas Nova Glass
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-white/70 border border-white p-3 shadow-xs">
                  <p className="text-xl font-extrabold text-brand-700 font-display">0.8s</p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Tiempo respuesta</p>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white p-3 shadow-xs">
                  <p className="text-xl font-extrabold text-cyan-600 font-display">24 / 7</p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Atención sin pausa</p>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white p-3 shadow-xs">
                  <p className="text-xl font-extrabold text-emerald-600 font-display">0%</p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Citas duplicadas</p>
                </div>
                <div className="rounded-2xl bg-white/70 border border-white p-3 shadow-xs">
                  <p className="text-xl font-extrabold text-indigo-600 font-display">+38%</p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">Más reservas</p>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  Configurar tu Propio Bot
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
