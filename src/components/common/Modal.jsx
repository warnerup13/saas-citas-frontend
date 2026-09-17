import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-soft-lg z-10 border border-slate-200/80"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-serif text-2xl font-normal text-slate-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
