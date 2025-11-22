// Configuración de URLs de los microservicios
// Este archivo proporciona valores por defecto si no existen variables de entorno

// URL base del gateway (puede ser localhost o TunnelMole)
const BASE_URL = process.env.REACT_APP_BASE_URL //|| 'http://localhost:8090';

const API_CONFIG = {
  // URLs construidas a partir de la base
  ADMINISTRACION: `${BASE_URL}/administracion`,
  CONSOLIDACION: `${BASE_URL}/consolidacion`,
  IA: `${BASE_URL}/ia`,
  NOTIFICACION: `${BASE_URL}/notificacion`,
  PRONOSTICO: `${BASE_URL}/pronostico`,
  REGISTRO: `${BASE_URL}/registro`,
  REPORTE: `${BASE_URL}/reporte`,
  FORECAST: `${BASE_URL}/forecast`,
  
  // WebSocket: convierte http/https a ws/wss
  WEBSOCKET: `${BASE_URL.replace(/^http/, 'ws')}/notificacion/ws`,
  
  // URL base (útil para referencias)
  BASE: BASE_URL
};

export default API_CONFIG;

