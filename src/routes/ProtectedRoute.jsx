import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Componente Guard de Rutas Protegidas
 * 
 * 1. Verifica si el usuario está autenticado. Si no, redirige a /login.
 * 2. Si se definen allowedRoles, valida que el rol del usuario coincida:
 *    - Rol 'admin' -> acceso exclusivo a rutas de administración (/dashboard/*)
 *    - Rol 'comercio'/'business' -> acceso exclusivo a portal del comercio (/comercio)
 *    - Si un usuario con un rol intenta entrar al del otro, es redirigido automáticamente a su panel correspondiente.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. Si no está autenticado o no hay datos de usuario, redirigir a Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Si se especificaron roles permitidos, validar coincidencia de rol
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = (user.role || "").toLowerCase();
    
    const hasPermission = allowedRoles.some((role) => {
      const target = role.toLowerCase();
      if (target === currentRole) return true;
      if (
        (target === "comercio" || target === "business") &&
        (currentRole === "comercio" || currentRole === "business")
      ) {
        return true;
      }
      return false;
    });

    if (!hasPermission) {
      // Redirección inteligente al panel propio de su rol
      if (currentRole === "admin") {
        return <Navigate to="/dashboard" replace />;
      }
      if (currentRole === "comercio" || currentRole === "business") {
        return <Navigate to="/comercio" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
