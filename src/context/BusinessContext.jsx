import { createContext, useContext, useState } from "react";
import { DATA_INICIAL } from "../data/mockData";
import { uid } from "../utils/formatters";

const BusinessContext = createContext();

export function BusinessProvider({ children }) {
  const [empresas, setEmpresas] = useState(DATA_INICIAL);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (mensaje, tipo = "success") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // Alternar el estado activo del bot para una empresa
  const toggleBotEmpresa = (id, nuevoEstado) => {
    setEmpresas((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          const val = nuevoEstado !== undefined ? nuevoEstado : !emp.activo;
          showToast(
            val
              ? `Bot activado para ${emp.nombre}`
              : `Bot en pausa para ${emp.nombre}`,
            val ? "success" : "info"
          );
          return { ...emp, activo: val };
        }
        return emp;
      })
    );
  };

  // Agregar nuevo comercio
  const agregarEmpresa = (nueva) => {
    const negocio = {
      id: uid(),
      nombre: nueva.nombre,
      rubro: nueva.rubro,
      telefono: nueva.telefono,
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
  };

  // Eliminar comercio
  const eliminarEmpresa = (id) => {
    const emp = empresas.find((e) => e.id === id);
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
    showToast(`Comercio "${emp?.nombre}" eliminado`, "info");
  };

  // Actualizar cualquier propiedad parcial de una empresa
  const actualizarEmpresa = (id, patch) => {
    setEmpresas((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...patch } : emp))
    );
    showToast("Cambios guardados correctamente");
  };

  // Agregar servicio a una empresa
  const agregarServicio = (empresaId, servicio) => {
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
    showToast("Servicio guardado exitosamente");
  };

  // Eliminar servicio
  const eliminarServicio = (empresaId, servicioId) => {
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
    showToast("Servicio eliminado", "info");
  };

  // Agregar día cerrado
  const agregarCierre = (empresaId, cierre) => {
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
    showToast("Día cerrado programado");
  };

  // Eliminar día cerrado
  const eliminarCierre = (empresaId, cierreId) => {
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
    showToast("Día cerrado eliminado", "info");
  };

  const empresasFiltradas = empresas.filter((emp) =>
    (emp.nombre + emp.rubro + emp.telefono)
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
