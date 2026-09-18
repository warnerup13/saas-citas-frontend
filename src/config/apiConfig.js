/**
 * Configuración centralizada de conexión a la API Backend
 */
export const API_CONFIG = {
  // Obtiene la URL base de las variables de entorno o usa fallback predeterminado a producción
  baseURL: import.meta.env.VITE_API_URL || "https://api.mycitas.online/api",
  prodBaseURL: import.meta.env.VITE_API_PROD_URL || "https://api.mycitas.online/api",
  devBaseURL: "http://localhost:3000/api",
  timeout: 15000,
  storageKeys: {
    token: "jwt_token",
    user: "mycitas_user",
    auth: "mycitas_auth",
    activeApiUrl: "mycitas_active_api_url",
  },
};

/**
 * Retorna la URL base activa configurada (permite cambiar dinámicamente entre dev y prod si se desea)
 */
export const getActiveBaseUrl = () => {
  const customUrl = localStorage.getItem(API_CONFIG.storageKeys.activeApiUrl);
  if (customUrl && customUrl.includes("localhost:3000")) {
    localStorage.removeItem(API_CONFIG.storageKeys.activeApiUrl);
    return API_CONFIG.baseURL;
  }
  return customUrl || API_CONFIG.baseURL;
};

/**
 * Guarda una nueva URL base activa
 */
export const setActiveBaseUrl = (url) => {
  if (url) {
    localStorage.setItem(API_CONFIG.storageKeys.activeApiUrl, url);
  } else {
    localStorage.removeItem(API_CONFIG.storageKeys.activeApiUrl);
  }
};
