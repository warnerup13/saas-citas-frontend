import apiClient from "./apiClient";

/**
 * Servicio de Gestión de Negocios / Comercios para Administradores
 */
export const businessService = {
  /**
   * Obtiene la lista completa de comercios registrados en el SaaS (Requiere Token de Administrador)
   * @returns {Promise<{ success: boolean, count?: number, data?: Array, businesses?: Array }>}
   */
  async getBusinesses() {
    const response = await apiClient.get("/business");
    return response.data;
  },

  /**
   * Obtiene la información detallada de un negocio por su ID
   * @param {string|number} id
   * @returns {Promise<{ success: boolean, data: Object }>}
   */
  async getBusinessById(id) {
    const response = await apiClient.get(`/business/${id}`);
    return response.data;
  },

  /**
   * Obtiene la lista de servicios de un negocio específico
   * @param {string|number} id
   * @returns {Promise<{ success: boolean, count?: number, data: Array }>}
   */
  async getBusinessServices(id) {
    const response = await apiClient.get(`/business/${id}/services`);
    return response.data;
  },

  /**
   * Crea un nuevo servicio asociado a un negocio específico
   * @param {string|number} id - ID del negocio
   * @param {Object} serviceData - { name, duration_minutes, price, is_active }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async createBusinessService(id, serviceData) {
    const payload = {
      name: serviceData.name?.trim() || serviceData.nombre?.trim(),
      duration_minutes: Number(serviceData.duration_minutes || serviceData.duracion || 60),
      price: Number(serviceData.price || serviceData.precio || 0),
      is_active: serviceData.is_active !== undefined ? Boolean(serviceData.is_active) : true,
    };

    const response = await apiClient.post(`/business/${id}/services`, payload);
    return response.data;
  },

  /**
   * Elimina un servicio de un negocio específico
   * @param {string|number} id - ID del negocio
   * @param {string|number} serviceId - ID del servicio
   */
  async deleteBusinessService(id, serviceId) {
    try {
      const response = await apiClient.delete(`/business/${id}/services/${serviceId}`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/services/${serviceId}`);
      return response.data;
    }
  },

  /**
   * Registra un nuevo comercio en la plataforma
   * @param {Object} businessData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async createBusiness(businessData) {
    const payload = {
      name: businessData.name?.trim() || businessData.nombre?.trim(),
      email: businessData.email?.trim(),
      password: businessData.password,
      whatsapp_number: businessData.whatsapp_number || businessData.whatsappNumber || businessData.telefono,
      timezone: businessData.timezone || "America/Caracas",
      calendar_email: businessData.calendar_email || businessData.googleCalendarEmail || "",
    };

    const response = await apiClient.post("/business", payload);
    return response.data;
  },

  /**
   * Actualiza los datos de un negocio existente
   * @param {string|number} id
   * @param {Object} updateData
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateBusiness(id, updateData) {
    const response = await apiClient.put(`/business/${id}`, updateData);
    return response.data;
  },

  /**
   * Enciende o apaga el bot para una empresa específica (como Administrador)
   * @param {string|number} id - ID de la empresa
   * @param {boolean} isActive - Estado del bot
   */
  async updateBusinessBotStatus(id, isActive) {
    try {
      const response = await apiClient.put(`/business/${id}/bot-status`, {
        isActive: Boolean(isActive),
        is_bot_active: Boolean(isActive),
      });
      return response.data;
    } catch {
      try {
        const response = await apiClient.put("/settings/bot-status", {
          isActive: Boolean(isActive),
          businessId: id,
        });
        return response.data;
      } catch {
        const response = await apiClient.put(`/business/${id}`, {
          is_bot_active: Boolean(isActive),
        });
        return response.data;
      }
    }
  },

  /**
   * Obtiene la configuración de horarios de una empresa específica
   * @param {string|number} id - ID de la empresa
   */
  async getBusinessSchedule(id) {
    try {
      const response = await apiClient.get(`/business/${id}/schedule`);
      return response.data;
    } catch {
      const response = await apiClient.get(`/settings/schedule?businessId=${id}`);
      return response.data;
    }
  },

  /**
   * Actualiza los horarios de una empresa específica
   * @param {string|number} id - ID de la empresa
   * @param {Array} schedule - Lista de horarios formateados
   */
  async updateBusinessSchedule(id, schedule) {
    try {
      const response = await apiClient.put(`/business/${id}/schedule`, { schedule });
      return response.data;
    } catch {
      const response = await apiClient.put("/settings/schedule", {
        schedule,
        businessId: id,
      });
      return response.data;
    }
  },

  /**
   * Obtiene los días feriados / cierres de una empresa específica
   * @param {string|number} id - ID de la empresa
   */
  async getBusinessHolidays(id) {
    try {
      const response = await apiClient.get(`/business/${id}/holidays`);
      return response.data;
    } catch {
      const response = await apiClient.get(`/settings/holidays?businessId=${id}`);
      return response.data;
    }
  },

  /**
   * Registra un nuevo día feriado / cerrado para una empresa específica
   * @param {string|number} id - ID de la empresa
   * @param {Object} payload - { date, reason }
   */
  async createBusinessHoliday(id, { date, reason }) {
    const data = {
      date,
      reason: reason?.trim() || "Día festivo / Cierre",
      businessId: id,
    };
    try {
      const response = await apiClient.post(`/business/${id}/holidays`, data);
      return response.data;
    } catch {
      const response = await apiClient.post("/settings/holidays", data);
      return response.data;
    }
  },

  /**
   * Elimina un día feriado de una empresa específica
   * @param {string|number} id - ID de la empresa
   * @param {string|number} holidayId - ID del feriado
   */
  async deleteBusinessHoliday(id, holidayId) {
    try {
      const response = await apiClient.delete(`/business/${id}/holidays/${holidayId}`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/settings/holidays/${holidayId}`);
      return response.data;
    }
  },
};

export default businessService;

