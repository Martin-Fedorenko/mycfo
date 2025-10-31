import axios from 'axios';
import API_CONFIG from '../config/api-config';

const URL_REGISTRO = API_CONFIG.REGISTRO; // ej: http://localhost:8086

function getUsuarioHeaders() {
  const headers = {};
  const sub = sessionStorage.getItem('sub');
  const token = sessionStorage.getItem('accessToken');
  if (sub) headers['X-Usuario-Sub'] = sub; // tenant
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Llama a /movimientos en REGISTRO usando fecha_emision (fechaDesde/fechaHasta).
 * - tipos: string ('EGRESO' | 'INGRESO') o array => CSV.
 * - No enviar sortBy/sortDir (evita 400 por validación).
 * - Devuelve `data` (puede venir paginado en `data.content` o como array).
 */
export async function getMovimientosPorRango({ fechaDesde, fechaHasta, tipos }) {
  const params = new URLSearchParams();
  params.set('page', 0);
  params.set('size', 500);
  if (fechaDesde) params.set('fechaDesde', fechaDesde); // YYYY-MM-DD
  if (fechaHasta) params.set('fechaHasta', fechaHasta);

  // CSV: evita &tipos=INGRESO&tipos=EGRESO → 400
  if (Array.isArray(tipos) && tipos.length > 0) {
    params.set('tipos', tipos.join(','));
  } else if (typeof tipos === 'string' && tipos) {
    params.set('tipos', tipos);
  }

  const url = `${URL_REGISTRO}/movimientos?${params.toString()}`;
  const { data } = await axios.get(url, { headers: getUsuarioHeaders() });
  return data;
}

