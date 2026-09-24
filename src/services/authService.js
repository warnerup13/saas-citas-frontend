import apiClient from "./apiClient";
import { API_CONFIG } from "../config/apiConfig";

/**
 * Servicio de Autenticación
 */
export const authService = {
  /**
   * Inicia sesión con email y password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ success: boolean, token: string, business: Object, message: string }>}
   */
  async login(credentials) {
    const response = await apiClient.post("/auth/login", {
      email: credentials.email?.trim(),
      password: credentials.password,
    });

    const data = response.data;
    if (data.token) {
      localStorage.setItem(API_CONFIG.storageKeys.token, data.token);
      localStorage.setItem(API_CONFIG.storageKeys.auth, "true");

      const isAdmin = data.role === "admin" || data.type === "admin" || (data.user && !data.business);

      if (isAdmin) {
        const adminUser = data.user || {};
        localStorage.setItem(
          API_CONFIG.storageKeys.user,
          JSON.stringify({
            id: adminUser.id || "admin",
            name: adminUser.name || "Equipo Administrador",
            email: adminUser.email || credentials.email,
            role: "admin",
            avatar:
              adminUser.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "AD",
          })
        );
      } else if (data.business) {
        localStorage.setItem(
          API_CONFIG.storageKeys.user,
          JSON.stringify({
            id: data.business.id,
            name: data.business.name,
            email: data.business.email,
            whatsappNumber: data.business.whatsappNumber || data.business.whatsapp_number,
            timezone: data.business.timezone,
            isBotActive: data.business.isBotActive ?? data.business.is_bot_active,
            role: "comercio",
            empresaId: data.business.id,
            avatar:
              data.business.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "NC",
          })
        );
      }
    }

    return data;
  },

  /**
   * Cierra sesión y elimina tokens locales
   */
  logout() {
    localStorage.removeItem(API_CONFIG.storageKeys.token);
    localStorage.removeItem(API_CONFIG.storageKeys.auth);
    localStorage.removeItem(API_CONFIG.storageKeys.user);
  },

  /**
   * Obtiene el token actual
   */
  getToken() {
    return localStorage.getItem(API_CONFIG.storageKeys.token);
  },

  /**
   * Verifica si hay token guardado
   */
  isAuthenticated() {
    return !!localStorage.getItem(API_CONFIG.storageKeys.token);
  },
};

export default authService;
