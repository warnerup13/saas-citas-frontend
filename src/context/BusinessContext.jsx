import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DATA_INICIAL } from "../data/mockData";
import { uid } from "../utils/formatters";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { businessService } from "../services";

const BusinessContext = createContext();

/**
 * Normaliza un registro de negocio proveniente de la base de datos / API
 */
export const normalizeBusiness = (b) => {
  return {
    id: b.id,
    nombre: b.name || b.nombre || "Comercio",
    rubro: b.category || b.rubro || "Servicios",
    telefono: b.whatsapp_number || b.whatsappNumber || b.telefono || "No especificado",
    email: b.email || "",
    googleCalendarEmail: b.calendar_email || b.googleCalendarEmail || "",
    activo: b.is_bot_active !== undefined ? Boolean(b.is_bot_active) : (b.activo !== undefined ? Boolean(b.activo) : true),
    citasSemana: b.citas_semana || b.citasSemana || 0,
    calendarConnected: Boolean(b.calendar_email || b.googleCalendarEmail || b.calendarConnected),
    timezone: b.timezone || "America/Caracas",
    horario: b.horario || {
      lun: { abre: true, desde: "09:00", hasta: "19:00" },
      mar: { abre: true, desde: "09:00", hasta: "19:00" },
      mie: { abre: true, desde: "09:00", hasta: "19:00" },
      jue: { abre: true, desde: "09:00", hasta: "19:00" },
      vie: { abre: true, desde: "09:00", hasta: "19:00" },
      sab: { abre: true, desde: "09:00", hasta: "14:00" },
      dom: { abre: false, desde: "09:00", hasta: "13:00" },
    },
    cierres: b.cierres || [],
    servicios: Array.isArray(b.services)
      ? b.services.map((s) => ({
          id: s.id,
          nombre: s.name || s.nombre,
          duracion: s.duration_minutes || s.duracion || 60,
          precio: Number(s.price || s.precio || 0),
          nota: s.is_active ? "Servicio Activo" : "Pausado en Bot",
          is_active: s.is_active !== undefined ? s.is_active : true,
        }))
      : (b.servicios || []),
    createdAt: b.created_at || b.createdAt,
  };
};

export function BusinessProvider({ children }) {
  const [empresas, setEmpresas] = useState(DATA_INICIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendLoaded, setIsBackendLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const showToast = (mensaje, tipo = "success") => {
    if (tipo === "error") {
      toast.error(mensaje);
    } else if (tipo === "info") {
      toast.info(mensaje);
    } else if (tipo === "warning") {
      toast.warning(mensaje);
    } else {
      toast.success(mensaje);
    }
  };

  /**
   * Carga las empresas desde /api/business con el token JWT de administrador
   * Solo se ejecuta cuando el rol activo es 'admin'
   */
  const cargarEmpresas = useCallback(async (silent = false) => {
    const esAdmin = isAdmin || user?.role === "admin";
    if (!esAdmin) {
      // Si el rol es comercio o visitante, no consultar el endpoint de administración /api/business
      return null;
    }

    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const res = await businessService.getBusinesses();
      const rawList = res?.data || res?.businesses || (Array.isArray(res) ? res : null);
      if (Array.isArray(rawList)) {
        const normalizadas = rawList.map(normalizeBusiness);
        setEmpresas(normalizadas);
        setIsBackendLoaded(true);
        return normalizadas;
      }
    } catch (err) {
      console.warn("Carga de /api/business en modo fallback:", err?.message);
      setError(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [isAdmin, user?.role]);

  // Alternar el estado activo del bot para una empresa
  const toggleBotEmpresa = async (id, nuevoEstado, silent = false) => {
    const emp = empresas.find((e) => e.id === id);
    const val = nuevoEstado !== undefined ? nuevoEstado : (emp ? !emp.activo : true);

    setEmpresas((prev) =>
      prev.map((e) => (e.id === id ? { ...e, activo: val } : e))
    );

    if (!silent) {
      showToast(
        val
          ? `Bot activado para ${emp?.nombre || "Comercio"}`
          : `Bot en pausa para ${emp?.nombre || "Comercio"}`,
        val ? "success" : "info"
      );
    }

    try {
      await businessService.updateBusinessBotStatus(id, val);
    } catch (err) {
      console.warn("Fallo actualización de bot en backend:", err?.message);
    }
  };

  // Agregar nuevo comercio
  const agregarEmpresa = async (nueva) => {
    try {
      const res = await businessService.createBusiness({
        name: nueva.nombre,
        email: nueva.email || `${nueva.nombre.toLowerCase().replace(/\s+/g, '')}@negocio.com`,
        password: nueva.password || "negocio123",
        whatsapp_number: nueva.telefono,
        calendar_email: nueva.googleCalendarEmail,
        timezone: nueva.timezone || "America/Caracas",
      });

      if (res?.data) {
        const nuevoNegocio = normalizeBusiness(res.data);
        setEmpresas((prev) => [nuevoNegocio, ...prev]);
        showToast(res.message || `Comercio "${nueva.nombre}" registrado exitosamente`);
        return nuevoNegocio;
      }
    } catch (err) {
      console.warn("Fallo registro en backend, guardando localmente:", err?.message);
    }

    const negocio = {
      id: uid(),
      nombre: nueva.nombre,
      rubro: nueva.rubro,
      telefono: nueva.telefono,
      email: nueva.email || "",
      googleCalendarEmail: nueva.googleCalendarEmail || "",
      activo: true,
      citasSemana: 0,
      calendarConnected: !!nueva.googleCalendarEmail,
      horario: {
        lun: { abre: true, desde: "09:00", hasta: "19:00" },
        mar: { abre: true, desde: "09:00", hasta: "19:00" },
        mie: { abre: true, desde: "09:00", hasta: "19:00" },
        jue: { abre: true, desde: "09:00", hasta: "19:00" },
        vie: { abre: true, desde: "09:00", hasta: "19:00" },
        sab: { abre: true, desde: "09:00", hasta: "14:00" },
        dom: { abre: false, desde: "09:00", hasta: "13:00" },
      },
      cierres: [],
      servicios: nueva.servicios || [],
    };
    setEmpresas((prev) => [negocio, ...prev]);
    showToast(`Comercio "${nueva.nombre}" registrado exitosamente`);
    return negocio;
  };

  // Eliminar comercio
  const eliminarEmpresa = (id) => {
    const emp = empresas.find((e) => e.id === id);
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
    showToast(`Comercio "${emp?.nombre}" eliminado`, "info");
  };

  // Actualizar cualquier propiedad parcial de una empresa (silencioso por defecto)
  const actualizarEmpresa = (id, patch, silent = true) => {
    setEmpresas((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...patch } : emp))
    );
    if (!silent) {
      showToast("Cambios guardados correctamente");
    }
  };

  // Agregar servicio a una empresa
  const agregarServicio = (empresaId, servicio, silent = true) => {
    setEmpresas((prev) =>
      prev.map((emp) => {
        if (emp.id !== empresaId) return emp;
        const existe = emp.servicios.some((s) => s.id === servicio.id);
        const nuevosServicios = existe
          ? emp.servicios.map((s) => (s.id === servicio.id ? servicio : s))
          : [...emp.servicios, servicio];
        return { ...emp, servicios: nuevosServicios };
      })
    );
    if (!silent) {
      showToast("Servicio guardado exitosamente");
    }
  };

  // Eliminar servicio
  const eliminarServicio = (empresaId, servicioId, silent = true) => {
    setEmpresas((prev) =>
      prev.map((emp) =>
        emp.id === empresaId
          ? {
              ...emp,
              servicios: emp.servicios.filter((s) => s.id !== servicioId),
            }
          : emp
      )
    );
    if (!silent) {
      showToast("Servicio eliminado", "info");
    }
  };

  // Agregar día cerrado
  const agregarCierre = (empresaId, cierre, silent = true) => {
    setEmpresas((prev) =>
      prev.map((emp) =>
        emp.id === empresaId
          ? {
              ...emp,
              cierres: [...emp.cierres, cierre].sort((a, b) =>
                a.fecha.localeCompare(b.fecha)
              ),
            }
          : emp
      )
    );
    if (!silent) {
      showToast("Día cerrado programado");
    }
  };

  // Eliminar día cerrado
  const eliminarCierre = (empresaId, cierreId, silent = true) => {
    setEmpresas((prev) =>
      prev.map((emp) =>
        emp.id === empresaId
          ? {
              ...emp,
              cierres: emp.cierres.filter((c) => c.id !== cierreId),
            }
          : emp
      )
    );
    if (!silent) {
      showToast("Día cerrado eliminado", "info");
    }
  };

  const empresasFiltradas = empresas.filter((emp) =>
    (emp.nombre + emp.rubro + emp.telefono + (emp.email || ""))
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: empresas.length,
    activas: empresas.filter((e) => e.activo).length,
    enPausa: empresas.filter((e) => !e.activo).length,
    totalCitasSemana: empresas.reduce((acc, e) => acc + (e.citasSemana || 0), 0),
  };

  return (
    <BusinessContext.Provider
      value={{
        empresas,
        empresasFiltradas,
        searchQuery,
        setSearchQuery,
        isLoading,
        isBackendLoaded,
        error,
        cargarEmpresas,
        stats,
        toast,
        showToast,
        toggleBotEmpresa,
        agregarEmpresa,
        eliminarEmpresa,
        actualizarEmpresa,
        agregarServicio,
        eliminarServicio,
        agregarCierre,
        eliminarCierre,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness debe usarse dentro de un BusinessProvider");
  }
  return context;
}

