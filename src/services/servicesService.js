import apiClient from "./apiClient";

/**
 * Servicio de Catálogo de Servicios / Tratamientos
 */
export const servicesService = {
  /**
   * Obtiene la lista de todos los servicios del negocio autenticado o especificado
   * @param {string|number} [businessId] - ID opcional del negocio
   * @returns {Promise<{ success: boolean, count: number, data: Array<{ id, business_id, name, duration_minutes, price, is_active }> }>}
   */
  async getServices(businessId) {
    const params = businessId ? { businessId } : {};
    const response = await apiClient.get("/services", { params });
    return response.data;
  },

  /**
   * Crea y añade un nuevo servicio al catálogo del negocio
   * @param {Object} serviceData - { name, duration_minutes, price, is_active, businessId }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async createService(serviceData) {
    const payload = {
      name: (serviceData.name || serviceData.nombre)?.trim(),
      duration_minutes: Number(serviceData.duration_minutes || serviceData.duracion || 60),
      price: Number(serviceData.price || serviceData.precio || 0),
      is_active: serviceData.is_active !== undefined ? Boolean(serviceData.is_active) : true,
      ...(serviceData.businessId ? { businessId: serviceData.businessId } : {}),
      ...(serviceData.business_id ? { business_id: serviceData.business_id } : {}),
    };

    const response = await apiClient.post("/services", payload);
    return response.data;
  },

  /**
   * Actualiza un servicio existente en el catálogo
   * @param {string|number} serviceId - ID del servicio
   * @param {Object} serviceData - { name, duration_minutes, price, is_active, businessId }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateService(serviceId, serviceData) {
    const payload = {
      ...(serviceData.name !== undefined && { name: serviceData.name.trim() }),
      ...(serviceData.nombre !== undefined && { name: serviceData.nombre.trim() }),
      ...(serviceData.duration_minutes !== undefined && { duration_minutes: Number(serviceData.duration_minutes) }),
      ...(serviceData.duracion !== undefined && { duration_minutes: Number(serviceData.duracion) }),
      ...(serviceData.price !== undefined && { price: Number(serviceData.price) }),
      ...(serviceData.precio !== undefined && { price: Number(serviceData.precio) }),
      ...(serviceData.is_active !== undefined && { is_active: Boolean(serviceData.is_active) }),
      ...(serviceData.businessId ? { businessId: serviceData.businessId } : {}),
      ...(serviceData.business_id ? { business_id: serviceData.business_id } : {}),
    };

    const response = await apiClient.put(`/services/${serviceId}`, payload);
    return response.data;
  },

  /**
   * Alterna la visibilidad de un servicio (ocultar / mostrar de los disponibles)
   * @param {string|number} serviceId - ID del servicio
   * @param {boolean} isActive - true para mostrarlo, false para ocultarlo
   * @param {string|number} [businessId] - ID opcional del negocio
   */
  async toggleServiceActive(serviceId, isActive, businessId) {
    return this.updateService(serviceId, { is_active: isActive, businessId });
  },

  /**
   * Elimina un servicio del catálogo por su ID
   * @param {string|number} serviceId - ID del servicio
   * @param {string|number} [businessId] - ID opcional del negocio
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteService(serviceId, businessId) {
    const params = businessId ? { businessId } : {};
    const response = await apiClient.delete(`/services/${serviceId}`, { params });
    return response.data;
  },
};

export default servicesService;
