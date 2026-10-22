import { useState } from "react";
import {
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Phone,
  Sparkles,
  Smartphone,
  X,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

/**
 * Modal para compartir el enlace directo de WhatsApp de un comercio o escribirle directamente.
 */
export default function ShareBusinessModal({ isOpen, onClose, empresa }) {
  const { toast } = useToast();
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [copiadoNumero, setCopiadoNumero] = useState(false);
  const [copiadoDueno, setCopiadoDueno] = useState(false);

  if (!isOpen || !empresa) return null;

  const rawPhone = empresa.telefono || empresa.whatsapp_number || "";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const defaultMsg = `¡Hola! Me gustaría conocer los servicios disponibles y agendar una cita en ${empresa.nombre}. ✨`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;

  const rawOwnerPhone = empresa.contact_phone || empresa.telefonoContacto || "";
  const cleanOwnerPhone = rawOwnerPhone.replace(/\D/g, "");
  const ownerWaUrl = cleanOwnerPhone
    ? `https://wa.me/${cleanOwnerPhone}?text=${encodeURIComponent(`Hola, me comunico respecto a ${empresa.nombre}.`)}`
    : "";

  const promoText = `🗓️ *Agenda tu cita en ${empresa.nombre} de forma rápida y 100% automática por WhatsApp:*\n👉 ${waUrl}`;

  const handleCopiar = async (texto, setEstado, label) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = texto;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setEstado(true);
      toast.success(`${label} copiado al portapapeles`);
      setTimeout(() => setEstado(false), 2500);
    } catch {
      toast.error("No se pudo copiar automáticamente. Por favor selecciónalo manualmente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-glass-xl border border-white/90 relative overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header del Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm">
              <Share2 size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 truncate">
                Compartir WhatsApp de {empresa.nombre}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Enlace directo y contacto para escribirle al negocio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Tarjeta del Enlace Directo al Bot */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-emerald-50/80 border border-emerald-200/70 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <MessageCircle size={16} className="text-emerald-600" />
                Enlace Directo al Bot de Citas
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles size={10} /> Auto-Agenda
              </span>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Cualquier persona que haga clic en este enlace abrirá WhatsApp directamente con el bot de este negocio listo para agendar.
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-emerald-200 shadow-xs">
              <input
                type="text"
                readOnly
                value={waUrl}
                className="flex-1 bg-transparent border-none text-[11px] text-slate-700 outline-none select-all truncate font-mono"
              />
              <button
                type="button"
                onClick={() => handleCopiar(waUrl, setCopiadoLink, "Enlace de WhatsApp")}
                className="btn-primary text-xs py-1.5 px-3 shrink-0 cursor-pointer"
                title="Copiar enlace al portapapeles"
              >
                {copiadoLink ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiadoLink ? "¡Copiado!" : "Copiar"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex-1 btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-900 border-emerald-200 hover:bg-emerald-100/50 cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>Abrir Chat con el Bot</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopiar(rawPhone, setCopiadoNumero, "Número de teléfono")}
                className="w-full sm:w-auto btn-ghost text-xs py-2 px-3 flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Phone size={13} className="text-slate-500" />
                <span>{copiadoNumero ? "¡Copiado!" : `Copiar Teléfono (${rawPhone})`}</span>
              </button>
            </div>
          </div>

          {/* Tarjeta de Contacto Directo con el Dueño (si está configurado) */}
          {cleanOwnerPhone && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Smartphone size={15} className="text-brand-600" />
                  Contacto Personal con el Dueño / Encargado
                </span>
                <span className="text-[10px] text-slate-500 font-semibold bg-slate-200/70 px-2 py-0.5 rounded-md">
                  Humano
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Número personal del dueño registrado para atención directa ante dudas o reprogramaciones: <strong>{rawOwnerPhone}</strong>
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
                <a
                  href={ownerWaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex-1 btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer text-slate-700"
                >
                  <ExternalLink size={13} />
                  <span>Escribir al Dueño</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopiar(rawOwnerPhone, setCopiadoDueno, "Número del dueño")}
                  className="w-full sm:w-auto btn-ghost text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  {copiadoDueno ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiadoDueno ? "¡Copiado!" : "Copiar Número"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Plantilla lista para Redes Sociales */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-brand-50/50 border border-brand-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-900 text-xs">
                Texto Listo para Redes / Instagram Bio
              </span>
              <button
                type="button"
                onClick={() => handleCopiar(promoText, setCopiadoTexto, "Texto para redes")}
                className="text-brand-700 hover:text-brand-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiadoTexto ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiadoTexto ? "¡Texto Copiado!" : "Copiar Mensaje"}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-brand-200/70 text-[11px] text-slate-600 font-mono whitespace-pre-line leading-relaxed">
              {promoText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-5 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
