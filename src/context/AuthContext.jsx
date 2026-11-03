import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService, API_CONFIG } from "../services";
import { isTokenExpired, getTokenRemainingMs } from "../utils/tokenUtils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Inicialización segura: valida que el token exista y NO esté expirado
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem(API_CONFIG.storageKeys.token);
    const saved = localStorage.getItem(API_CONFIG.storageKeys.user);

    if (!token || isTokenExpired(token)) {
      authService.logout();
      return null;
    }

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        authService.logout();
        return null;
      }
    }

    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem(API_CONFIG.storageKeys.token);
    if (!token || isTokenExpired(token)) {
      authService.logout();
      return false;
    }
    const saved = localStorage.getItem(API_CONFIG.storageKeys.user);
    return !!saved;
  });

  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(null);

  /**
   * Manejador centralizado de expiración de sesión
   */
  const handleSessionExpired = useCallback((notice = "Tu sesión ha expirado por seguridad. Por favor ingresa nuevamente.") => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpiredNotice(notice);
  }, []);

  /**
   * Cierre voluntario de sesión
   */
  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setSessionExpiredNotice(null);
  }, []);

  /**
   * Temporizador activo: cierra la sesión automáticamente en el momento exacto que el JWT expira
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = authService.getToken();
    if (!token || isTokenExpired(token)) {
      handleSessionExpired("Tu sesión ha expirado.");
      return;
    }

    const remainingMs = getTokenRemainingMs(token);
    if (remainingMs <= 0) {
      handleSessionExpired("Tu sesión ha expirado.");
      return;
    }

    // Programar expiración automática
    const timer = setTimeout(() => {
      handleSessionExpired("Tu sesión ha expirado por tiempo de inactividad o vencimiento del token.");
    }, remainingMs);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, handleSessionExpired]);

  /**
   * Detección de reactivación en móviles y cambio de visibilidad de pestaña:
   * Al desbloquear el celular o volver al navegador, revisa inmediatamente si la sesión ya venció
   */
  useEffect(() => {
    const checkSessionOnWakeup = () => {
      if (document.visibilityState === "visible") {
        const token = authService.getToken();
        if (isAuthenticated && (!token || isTokenExpired(token))) {
          handleSessionExpired("Tu sesión ha expirado mientras el dispositivo estaba en reposo.");
        }
      }
    };

    document.addEventListener("visibilitychange", checkSessionOnWakeup);
    window.addEventListener("focus", checkSessionOnWakeup);

    return () => {
      document.removeEventListener("visibilitychange", checkSessionOnWakeup);
      window.removeEventListener("focus", checkSessionOnWakeup);
    };
  }, [isAuthenticated, handleSessionExpired]);

  /**
   * Escuchar eventos de sesión expirada emitidos por el interceptor de peticiones (401)
   */
  useEffect(() => {
    const handleAuthExpiredEvent = (event) => {
      const msg = event?.detail?.message || "Tu sesión ha expirado o las credenciales no son válidas.";
      handleSessionExpired(msg);
    };

    window.addEventListener("auth:expired", handleAuthExpiredEvent);
    return () => window.removeEventListener("auth:expired", handleAuthExpiredEvent);
  }, [handleSessionExpired]);

  /**
   * Inicio de sesión real contra el backend REST (Soporta rol Admin y Comercio)
   */
  const loginWithBackend = async (email, password) => {
    const data = await authService.login({ email, password });
    const isAdminRole = data.role === "admin" || data.type === "admin" || (data.user && !data.business);

    if (isAdminRole) {
      const adminUser = data.user || {};
      const userData = {
        id: adminUser.id || "admin",
        name: adminUser.name || "Equipo Administrador",
        email: adminUser.email || email,
        role: "admin",
        avatar:
          adminUser.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "AD",
      };
      setUser(userData);
      setIsAuthenticated(true);
      setSessionExpiredNotice(null);
      localStorage.setItem(API_CONFIG.storageKeys.user, JSON.stringify(userData));
      localStorage.setItem(API_CONFIG.storageKeys.auth, "true");
      return { success: true, user: userData, token: data.token, role: "admin", message: data.message };
    }

    if (data.business) {
      const userData = {
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
      };
      setUser(userData);
      setIsAuthenticated(true);
      setSessionExpiredNotice(null);
      localStorage.setItem(API_CONFIG.storageKeys.user, JSON.stringify(userData));
      localStorage.setItem(API_CONFIG.storageKeys.auth, "true");
      return { success: true, user: userData, token: data.token, role: "comercio", message: data.message };
    }

    return data;
  };

  const loginAsComercio = (empresaId = 1, nombre = "Peluquería Amaranta", email = "comercio@negocio.com") => {
    const userData = {
      name: nombre,
      email: email,
      role: "comercio",
      empresaId: empresaId,
      avatar: nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "NC",
      isBotActive: true,
    };
    setUser(userData);
    setIsAuthenticated(true);
    setSessionExpiredNotice(null);
    localStorage.setItem(API_CONFIG.storageKeys.user, JSON.stringify(userData));
    localStorage.setItem(API_CONFIG.storageKeys.auth, "true");
    return userData;
  };

  const loginAsAdmin = (email = "admin@saas.com") => {
    const userData = {
      name: "Equipo Administrador",
      email: email,
      role: "admin",
      avatar: "AD",
    };
    setUser(userData);
    setIsAuthenticated(true);
    setSessionExpiredNotice(null);
    localStorage.setItem(API_CONFIG.storageKeys.user, JSON.stringify(userData));
    localStorage.setItem(API_CONFIG.storageKeys.auth, "true");
    return userData;
  };

  const login = async (email, password, role = "comercio", empresaId = 1, nombre = "Comercio") => {
    try {
      return await loginWithBackend(email, password);
    } catch (err) {
      throw err;
    }
  };

  const clearSessionExpiredNotice = () => setSessionExpiredNotice(null);

  const userRole = (user?.role || "").toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login,
        loginWithBackend,
        loginAsComercio,
        loginAsAdmin,
        logout,
        sessionExpiredNotice,
        clearSessionExpiredNotice,
        isComercio: userRole === "comercio" || userRole === "business",
        isAdmin: userRole === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
