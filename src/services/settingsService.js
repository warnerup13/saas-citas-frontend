import apiClient from "./apiClient";

/**
 * Mapeo entre las claves de días del frontend ('lun'..'dom') y los números de día (1..7) del backend
 * 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado, 7 = Domingo
 */
export const DAY_MAP = {
  lun: 1,
  mar: 2,
  mie: 3,
  jue: 4,
  vie: 5,
  sab: 6,
  dom: 7,
};

export const NUMBER_TO_DAY_KEY = {
  1: "lun",
  2: "mar",
  3: "mie",
  4: "jue",
  5: "vie",
  6: "sab",
  7: "dom",
};

/**
 * Servicio de Configuración del Negocio (Settings)
 */
export const settingsService = {
  /**
   * Activa o pausa la atención automatizada del bot de WhatsApp
   * @param {boolean} isActive - true para encender, false para pausar
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async updateBotStatus(isActive) {
    const response = await apiClient.put("/settings/bot-status", {
      isActive: Boolean(isActive),
    });
    return response.data;
  },

  /**
   * Obtiene la configuración actual de horarios de los 7 días de la semana
   * @returns {Promise<{ success: boolean, count: number, data: Array }>}
   */
  async getSchedule() {
    const response = await apiClient.get("/settings/schedule");
    return response.data;
  },

  /**
   * Actualiza masivamente (Upsert) la configuración semanal de horarios para los 7 días
   * @param {Array<{ day: number, isOpen: boolean, startTime: string|null, endTime: string|null }>} schedule
   * @returns {Promise<{ success: boolean, message: string, data: Array }>}
   */
  async updateSchedule(schedule) {
    const response = await apiClient.put("/settings/schedule", {
      schedule,
    });
    return response.data;
  },

  /**
   * Convierte un objeto de horario de UI ({ lun: { abre, desde, hasta }, ... })
   * al formato requerido por la API [ { day: 1..7, isOpen, startTime, endTime } ]
   */
  formatScheduleForApi(horarioUi) {
    return Object.entries(DAY_MAP).map(([key, dayNumber]) => {
      const diaConfig = horarioUi[key] || { abre: false, desde: null, hasta: null };
      return {
        day: dayNumber,
        isOpen: Boolean(diaConfig.abre),
        startTime: diaConfig.abre ? (diaConfig.desde || "09:00").slice(0, 5) : null,
        endTime: diaConfig.abre ? (diaConfig.hasta || "18:00").slice(0, 5) : null,
      };
    });
  },

  /**
   * Convierte el array de la API [ { day_of_week, is_open, open_time, close_time } ]
   * al formato de estado usado por la UI { lun: { abre, desde, hasta }, ... }
   */
  formatScheduleForUi(apiScheduleList) {
    const initialSchedule = {
      lun: { abre: true, desde: "09:00", hasta: "18:00" },
      mar: { abre: true, desde: "09:00", hasta: "18:00" },
      mie: { abre: true, desde: "09:00", hasta: "18:00" },
      jue: { abre: true, desde: "09:00", hasta: "18:00" },
      vie: { abre: true, desde: "09:00", hasta: "18:00" },
      sab: { abre: true, desde: "10:00", hasta: "15:00" },
      dom: { abre: false, desde: "09:00", hasta: "13:00" },
    };

    if (!Array.isArray(apiScheduleList)) return initialSchedule;

    apiScheduleList.forEach((item) => {
      const dayKey = NUMBER_TO_DAY_KEY[item.day_of_week];
      if (dayKey) {
        initialSchedule[dayKey] = {
          abre: Boolean(item.is_open),
          desde: item.open_time ? item.open_time.slice(0, 5) : "09:00",
          hasta: item.close_time ? item.close_time.slice(0, 5) : "18:00",
        };
      }
    });

    return initialSchedule;
  },

  /**
   * Retorna todos los días feriados o fechas no laborables registradas
   * @returns {Promise<{ success: boolean, count: number, data: Array<{ id, closed_date, reason }> }>}
   */
  async getHolidays() {
    const response = await apiClient.get("/settings/holidays");
    return response.data;
  },

  /**
   * Registra una nueva fecha festiva o día libre
   * @param {Object} payload - { date: "YYYY-MM-DD", reason: string }
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async createHoliday({ date, reason }) {
    const response = await apiClient.post("/settings/holidays", {
      date,
      reason: reason?.trim() || "Día festivo / Cierre",
    });
    return response.data;
  },

  /**
   * Elimina un día feriado previamente registrado por su ID
   * @param {string|number} id
   * @returns {Promise<{ success: boolean, message: string, data: Object }>}
   */
  async deleteHoliday(id) {
    const response = await apiClient.delete(`/settings/holidays/${id}`);
    return response.data;
  },
};

export default settingsService;
