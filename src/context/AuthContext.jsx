import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("mycitas_user");
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
      role: "comercio", // 'comercio' o 'admin'
      empresaId: 1,
      avatar: "PA",
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("mycitas_auth") === "true";
  });

  const loginAsComercio = (empresaId = 1, nombre = "Peluquería Amaranta", email = "comercio@negocio.com") => {
    const userData = {
      name: nombre,
      email: email,
      role: "comercio",
      empresaId: empresaId,
      avatar: nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "NC",
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("mycitas_user", JSON.stringify(userData));
    localStorage.setItem("mycitas_auth", "true");
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
    localStorage.setItem("mycitas_user", JSON.stringify(userData));
    localStorage.setItem("mycitas_auth", "true");
    return userData;
  };

  const login = (email, password, role = "comercio", empresaId = 1, nombre = "Comercio") => {
    if (role === "admin") {
      return loginAsAdmin(email);
    } else {
      return loginAsComercio(empresaId, nombre, email);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("mycitas_auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
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
