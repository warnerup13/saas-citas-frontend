import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  ArrowRight,
  Sparkles,
  Scissors,
  Smile,
  HeartPulse,
  RefreshCw,
} from "lucide-react";
import Hero from "../components/landing/Hero";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const irAlPanel = () => {
    if (!isAuthenticated || !user) {
      navigate("/login");
    } else if (user.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/comercio");
    }
  };

  const casosDestacados = [
    {
      num: "01",
      titulo: "Peluquería & Barbería",
      desc: "Gestión de turnos simultáneos por barbero o estilista con cálculo de tiempos de lavado.",
      tag1: "Estética",
      tag2: "Multi-sillón",
      icono: Scissors,
      bgGradient: "from-blue-600/20 to-indigo-600/10",
    },
    {
      num: "02",
      titulo: "Clínicas Dentales & Salud",
      desc: "Agendamiento de valoraciones, limpiezas y tratamientos con bloqueo estricto en Google Calendar.",
      tag1: "Salud",
      tag2: "Sin duplicados",
      icono: Smile,
      bgGradient: "from-emerald-500/20 to-teal-500/10",
    },
    {
      num: "03",
      titulo: "Spas & Bienestar",
      desc: "Confirmación de masajes y faciales con recordatorios automáticos 2 horas antes de la cita.",
      tag1: "Bienestar",
      tag2: "Anti No-Show",
      icono: HeartPulse,
      bgGradient: "from-rose-500/20 to-pink-500/10",
    },
  ];

  const capacidadesIA = [
    { nombre: "Precisión en Extracción de Fechas", valor: "99%" },
    { nombre: "Cálculo de Huecos en Calendar", valor: "100%" },
    { nombre: "Comprensión de Lenguaje Natural", valor: "96%" },
    { nombre: "Prevención de Inasistencias (No-Show)", valor: "92%" },
    { nombre: "Velocidad de Respuesta del Bot", valor: "98%" },
  ];

  const techStack = [
    { nombre: "WhatsApp Cloud", icon: "💬", desc: "API Oficial Meta" },
    { nombre: "Google Calendar", icon: "📅", desc: "Sync Bidireccional" },
    { nombre: "IA Engine", icon: "🧠", desc: "NLP & Reasoning" },
    { nombre: "Webhooks 24/7", icon: "⚡", desc: "Latencia < 1s" },
    { nombre: "Multi-Tenant", icon: "🏢", desc: "Gestión Aislada" },
    { nombre: "Cloud Security", icon: "🔒", desc: "Cifrado SSL/TLS" },
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-brand-500 selection:text-white pb-16 overflow-x-hidden">
      
      {/* Header Estilo Nova Glass */}
      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-3 sm:py-3.5 gap-2">
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white shadow-glow-blue transition-transform group-hover:scale-105">
                <Bot size={18} />
              </div>
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                mycitas
                
                {/* <span className="text-cyan-500 font-normal">.glass</span> */}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/demo")}
              className="glass-pill-cyan hidden md:inline-flex text-xs font-semibold py-2 px-4"
            >
              <Sparkles size={13} className="text-cyan-600" />
              Ver Demo en Vivo
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
            >
              Acceso
            </button>
            <button onClick={irAlPanel} className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
              Panel
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero irAlPanel={irAlPanel} />

      {/* ============================================================ */}
      {/* SECCIÓN CASOS DESTACADOS */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="glass-pill self-start">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              RUBROS & CASOS DE USO
            </span>
          </div>
          <Link
            to="/demo"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            Probar simulador interactivo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {casosDestacados.map((caso) => {
            const Icon = caso.icono;
            return (
              <motion.div
                key={caso.num}
                whileHover={{ y: -4 }}
                className="glass-panel p-5 sm:p-6 flex flex-col justify-between group cursor-pointer hover:border-white transition-all"
                onClick={() => navigate("/demo")}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <span className="font-display text-xl sm:text-2xl font-extrabold text-slate-300 group-hover:text-brand-600 transition-colors">
                      {caso.num}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-brand-600 shadow-sm border border-white">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {caso.titulo}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {caso.desc}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="glass-pill text-[10px] font-semibold text-slate-600">
                      {caso.tag1}
                    </span>
                    <span className="glass-pill text-[10px] font-semibold text-slate-600">
                      {caso.tag2}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                    Demo <ArrowRight size={12} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* MATRIZ INFERIOR NOVA GLASS (3 Paneles en Grid) */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Panel 1: Capacidades del Motor de IA */}
          <div className="lg:col-span-4 glass-panel p-5 sm:p-7">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                CAPACIDADES DEL MOTOR IA
              </h3>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              {capacidadesIA.map((cap, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate pr-2">{cap.nombre}</span>
                    <span className="text-brand-600 font-bold shrink-0">{cap.valor}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-cyan-400 rounded-full"
                      style={{ width: cap.valor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Stack Tecnológico */}
          <div className="lg:col-span-4 glass-panel p-5 sm:p-7">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                STACK DE INTEGRACIONES
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {techStack.map((tech, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/90 bg-white/60 p-2.5 sm:p-3 shadow-xs hover:bg-white/90 transition-colors"
                >
                  <span className="text-base sm:text-lg">{tech.icon}</span>
                  <p className="font-bold text-xs text-slate-900 mt-1 truncate">{tech.nombre}</p>
                  <p className="text-[10px] text-slate-500 truncate">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3: Sincronización */}
          <div className="lg:col-span-4 glass-panel p-5 sm:p-7 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  SINCRONIZACIÓN EN VIVO
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Flujo bidireccional continuo: cuando el cliente pide cita por WhatsApp, el motor bloquea Google Calendar al instante y notifica al comercio.
              </p>
            </div>

            {/* Diagrama Circular Holográfico */}
            <div className="relative rounded-2xl bg-gradient-to-br from-brand-50/60 to-cyan-50/60 border border-white p-4 sm:p-5 text-center flex flex-col items-center justify-center">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white shadow-glow-blue flex items-center justify-center border border-white mb-2">
                <RefreshCw size={24} className="text-brand-600 animate-spin [animation-duration:8s]" />
              </div>
              <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Sync Bidireccional
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">WhatsApp ↔ Google Calendar</p>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <button
                onClick={irAlPanel}
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                Comenzar ahora
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Estilo Nova Glass */}
      <footer className="mt-8 sm:mt-12 border-t border-white/80 bg-white/40 backdrop-blur-xl py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Bot size={18} className="text-brand-600 shrink-0" />
            <span className="font-display text-base sm:text-lg font-bold text-slate-900">
              mycitas
              {/* <span className="text-cyan-500">.glass</span> */} 
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Plataforma de IA para WhatsApp & Google Calendar 
          </p>
        </div>
      </footer>

    </div>
  );
}
