import axios from "axios";

const API_BASE_URL = "http://localhost:8086/api/conciliacion";

/**
 * API client para el módulo de conciliación
 */
export const conciliacionApi = {
  /**
   * Obtiene todos los movimientos sin conciliar
   */
  obtenerMovimientosSinConciliar: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/movimientos/sin-conciliar`
    );
    return response.data;
  },

  /**
   * Obtiene todos los movimientos (conciliados y sin conciliar)
   */
  obtenerTodosLosMovimientos: async () => {
    const response = await axios.get(`${API_BASE_URL}/movimientos`);
    return response.data;
  },

  /**
   * Obtiene sugerencias de documentos para un movimiento
   */
  obtenerSugerencias: async (movimientoId) => {
    const response = await axios.get(
      `${API_BASE_URL}/movimientos/${movimientoId}/sugerencias`
    );
    return response.data;
  },

  /**
   * Vincula un movimiento con un documento
   */
  vincularMovimiento: async (movimientoId, documentoId) => {
    const response = await axios.post(`${API_BASE_URL}/vincular`, {
      movimientoId,
      documentoId,
    });
    return response.data;
  },

  /**
   * Desvincula un movimiento de su documento
   */
  desvincularMovimiento: async (movimientoId) => {
    const response = await axios.post(
      `${API_BASE_URL}/desvincular/${movimientoId}`
    );
    return response.data;
  },

  /**
   * Obtiene estadísticas de conciliación
   */
  obtenerEstadisticas: async () => {
    const response = await axios.get(`${API_BASE_URL}/estadisticas`);
    return response.data;
  },
};

export default conciliacionApi;
