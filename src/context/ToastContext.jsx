import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      tipo = "info",
      titulo = "",
      mensaje = "",
      detalle = "",
      status = null,
      endpoint = "",
      duracion = 5000,
      action = null,
    }) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);

      // Si duracion es 0 o null, no se auto-cierra (ej. toasts críticos o loading)
      const newToast = {
        id,
        tipo, // 'success' | 'error' | 'warning' | 'info' | 'loading'
        titulo,
        mensaje,
        detalle,
        status,
        endpoint,
        duracion,
        action,
        timestamp: new Date().toLocaleTimeString(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Máximo 5 toasts en pantalla

      return id;
    },
    []
  );

  const toast = {
    show: addToast,
    success: (mensaje, options = {}) =>
      addToast({
        tipo: "success",
        titulo: options.titulo || "Operación Exitosa",
        mensaje,
        duracion: options.duracion ?? 4500,
        ...options,
      }),
    error: (mensajeOrError, options = {}) => {
      let mensaje = "Ha ocurrido un error al procesar la solicitud.";
      let titulo = options.titulo || "Atención";

      // Si se pasa directamente el objeto error
      if (typeof mensajeOrError === "object" && mensajeOrError !== null) {
        if (mensajeOrError.status === 401 || mensajeOrError.isAuthError) {
          titulo = options.titulo || "Credenciales Inválidas";
          mensaje = "El correo electrónico o la contraseña no son correctos.";
        } else if (mensajeOrError.isNetworkError) {
          titulo = options.titulo || "Error de Conexión";
          mensaje = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
        } else {
          mensaje = mensajeOrError.message || options.mensaje || mensaje;
          titulo = options.titulo || "Atención";
        }
      } else if (typeof mensajeOrError === "string") {
        mensaje = mensajeOrError;
      }

      return addToast({
        tipo: "error",
        titulo,
        mensaje,
        duracion: options.duracion ?? 4500,
        ...options,
      });
    },
    warning: (mensaje, options = {}) =>
      addToast({
        tipo: "warning",
        titulo: options.titulo || "Atención",
        mensaje,
        duracion: options.duracion ?? 5000,
        ...options,
      }),
    info: (mensaje, options = {}) =>
      addToast({
        tipo: "info",
        titulo: options.titulo || "Información",
        mensaje,
        duracion: options.duracion ?? 4000,
        ...options,
      }),
    promise: async (promise, { loading = "Procesando...", success = "Operación completada", error = "Error en el proceso" }) => {
      const toastId = addToast({
        tipo: "loading",
        titulo: "En progreso",
        mensaje: loading,
        duracion: null,
      });

      try {
        const result = await promise;
        removeToast(toastId);
        const successMsg = typeof success === "function" ? success(result) : success;
        toast.success(successMsg);
        return result;
      } catch (err) {
        removeToast(toastId);
        const errorMsg = typeof error === "function" ? error(err) : error;
        toast.error(err, { mensaje: errorMsg });
        throw err;
      }
    },
    remove: removeToast,
    clear: () => setToasts([]),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
}

export default ToastContext;
