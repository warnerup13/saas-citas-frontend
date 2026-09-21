import { createContext, useContext, useState } from "react";
import { authService, API_CONFIG } from "../services";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(API_CONFIG.storageKeys.user);
    const token = localStorage.getItem(API_CONFIG.storageKeys.token);
    const isAuth = localStorage.getItem(API_CONFIG.storageKeys.auth);
    if (saved && (token || isAuth === "true")) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem(API_CONFIG.storageKeys.user);
    const token = localStorage.getItem(API_CONFIG.storageKeys.token);
    const isAuth = localStorage.getItem(API_CONFIG.storageKeys.auth);
    return !!saved && (token || isAuth === "true");
  });

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

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

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

