import { createContext, useContext, useState } from "react";
import { authService, API_CONFIG } from "../services";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(API_CONFIG.storageKeys.user);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return {
      name: "Peluquería Amaranta",
      email: "amaranta@negocio.com",
      role: "comercio",
      empresaId: 1,
      avatar: "PA",
      isBotActive: true,
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return (
      localStorage.getItem(API_CONFIG.storageKeys.auth) === "true" ||
      !!localStorage.getItem(API_CONFIG.storageKeys.token)
    );
  });

  /**
   * Inicio de sesión real contra el backend REST
   */
  const loginWithBackend = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.business) {
      const userData = {
        id: data.business.id,
        name: data.business.name,
        email: data.business.email,
        whatsappNumber: data.business.whatsappNumber,
        timezone: data.business.timezone,
        isBotActive: data.business.isBotActive,
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
      return { success: true, user: userData, token: data.token, message: data.message };
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

  const loginAsAdmin = (email = "admin@mycitas.app") => {
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
    if (role === "admin") {
      return loginAsAdmin(email);
    }
    try {
      return await loginWithBackend(email, password);
    } catch (err) {
      // Si falla llamada al backend, relanzar para que la UI capture el error y muestre el Toast técnico
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

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
        isComercio: user?.role === "comercio",
        isAdmin: user?.role === "admin",
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

