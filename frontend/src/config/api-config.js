// Configuración de URLs de los microservicios
// Este archivo proporciona valores por defecto si no existen variables de entorno

const API_CONFIG = {
  ADMINISTRACION: process.env.REACT_APP_URL_ADMINISTRACION || 'http://localhost:8081',
  CONSOLIDACION: process.env.REACT_APP_URL_CONSOLIDACION || 'http://localhost:8082',
  IA: process.env.REACT_APP_URL_IA || 'http://localhost:8083',
  NOTIFICACION: process.env.REACT_APP_URL_NOTIFICACION || 'http://localhost:8084',
  PRONOSTICO: process.env.REACT_APP_URL_PRONOSTICO || 'http://localhost:8085',
  REGISTRO: process.env.REACT_APP_URL_REGISTRO || 'http://localhost:8086',
  REPORTE: process.env.REACT_APP_URL_REPORTE || 'http://localhost:8087',
  WEBSOCKET: process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8084/ws'
};

export default API_CONFIG;

