import apiClient from "./apiClient";
import { API_CONFIG } from "../config/apiConfig";
import { isTokenExpired, parseJwt, getTokenRemainingMs } from "../utils/tokenUtils";

/**
 * Servicio de Autenticación con ciclo de vida seguro de sesión
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
   * Cierra sesión y elimina tokens y datos del almacenamiento local
   */
  logout() {
    try {
      localStorage.removeItem(API_CONFIG.storageKeys.token);
      localStorage.removeItem(API_CONFIG.storageKeys.auth);
      localStorage.removeItem(API_CONFIG.storageKeys.user);
      sessionStorage.clear();
    } catch (e) {
      console.warn("[authService] Error al limpiar almacenamiento:", e);
    }
  },

  /**
   * Obtiene el token actual
   */
  getToken() {
    return localStorage.getItem(API_CONFIG.storageKeys.token);
  },

  /**
   * Retorna el usuario almacenado siempre y cuando el token siga vigente
   */
  getStoredUser() {
    const token = this.getToken();
    if (!token || isTokenExpired(token)) {
      this.logout();
      return null;
    }

    const saved = localStorage.getItem(API_CONFIG.storageKeys.user);
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  /**
   * Verifica si hay una sesión activa y con token no expirado
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    if (isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  },

  /**
   * Retorna los milisegundos restantes antes de que expire la sesión actual
   */
  getRemainingSessionMs() {
    const token = this.getToken();
    return getTokenRemainingMs(token);
  },

  /**
   * Obtiene los datos decodificados directamente del token JWT
   */
  getTokenData() {
    const token = this.getToken();
    return parseJwt(token);
  },

  /**
   * Opcional: valida la vigencia del token contra el backend si hay conectividad
   */
  async verifySessionWithBackend() {
    const token = this.getToken();
    if (!token || isTokenExpired(token)) {
      this.logout();
      return { valid: false, reason: "expired_locally" };
    }

    try {
      const response = await apiClient.get("/auth/me");
      return { valid: true, data: response.data };
    } catch (error) {
      if (error?.status === 401 || error?.isAuthError) {
        this.logout();
        return { valid: false, reason: "expired_server" };
      }
      // Si fue error de red, asumimos válido si el token local aún no ha expirado
      return { valid: !isTokenExpired(token), reason: "network_offline" };
    }
  },
};

export default authService;

