import axios from "axios";
import { API_CONFIG, getActiveBaseUrl } from "../config/apiConfig";

/**
 * Instancia central de Axios para todas las peticiones al backend
 */
const apiClient = axios.create({
  baseURL: getActiveBaseUrl(),
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de Petición:
 * Inyecta dinámicamente la URL base activa y el encabezado Authorization: Bearer <token>
 */
apiClient.interceptors.request.use(
  (config) => {
    // Actualizar baseURL por si fue cambiada dinámicamente
    config.baseURL = getActiveBaseUrl();

    // Inyectar JWT token si existe en localStorage
    const token = localStorage.getItem(API_CONFIG.storageKeys.token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Helper para normalizar los errores de la API en una estructura amigable y técnica
 */
export const normalizeApiError = (error) => {
  if (!error) {
    return {
      message: "Ha ocurrido un error inesperado.",
      detalle: "No hay detalles disponibles.",
      status: 500,
      endpoint: "N/A",
      isNetworkError: false,
    };
  }

  // Si no hubo respuesta del servidor (Error de red / Servidor apagado / CORS)
  if (!error.response) {
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
    return {
      message: isOffline
        ? "No tienes conexión a internet."
        : `No se pudo conectar con el servidor backend (${getActiveBaseUrl()}). Asegúrate de que el backend esté ejecutándose.`,
      detalle: error.message || "Network Error / ECONNREFUSED",
      status: 0,
      endpoint: error.config?.url || "N/A",
      isNetworkError: true,
      isAuthError: false,
    };
  }

  const { status, data, config } = error.response;
  const endpoint = config?.url || "N/A";
  const method = (config?.method || "GET").toUpperCase();

  let message = data?.error || data?.message || "Ocurrió un error al procesar la solicitud.";
  let detalle = data?.detalle || data?.details || (typeof data === "string" ? data : "");

  // Mensajes amigables según código HTTP
  if (status === 400) {
    if (!message || message === "Ocurrió un error al procesar la solicitud.") {
      message = "Datos de solicitud inválidos o incompletos.";
    }
  } else if (status === 401) {
    message = message || "Sesión expirada o credenciales inválidas. Por favor inicia sesión.";
  } else if (status === 403) {
    message = "No tienes permisos para realizar esta acción.";
  } else if (status === 404) {
    message = message || "El recurso solicitado no fue encontrado.";
  } else if (status >= 500) {
    message = message || "Error interno del servidor. Por favor intenta más tarde.";
  }

  return {
    message,
    detalle: detalle || `Código HTTP ${status} en ${method} ${endpoint}`,
    status,
    endpoint: `${method} ${endpoint}`,
    isNetworkError: false,
    isAuthError: status === 401,
    raw: data,
  };
};

/**
 * Interceptor de Respuesta:
 * Normaliza las respuestas exitosas y unifica los errores
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const normalizedError = normalizeApiError(error);

    // Si es 401 y hay token guardado, podemos limpiar la sesión si expiró
    if (normalizedError.isAuthError && localStorage.getItem(API_CONFIG.storageKeys.token)) {
      // Dejar que la capa UI / AuthContext gestione el logout o aviso
      console.warn("Token JWT expirado o inválido:", normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
