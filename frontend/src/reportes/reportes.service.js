import http from '../api/http';

export async function getMovimientosPorRango({ fechaDesde, fechaHasta, tipos }) {
  const params = new URLSearchParams();
  params.set('page', 0);
  params.set('size', 500);
  if (fechaDesde) params.set('fechaDesde', fechaDesde);
  if (fechaHasta) params.set('fechaHasta', fechaHasta);

  if (Array.isArray(tipos) && tipos.length > 0) {
    params.set('tipos', tipos.join(','));
  } else if (typeof tipos === 'string' && tipos) {
    params.set('tipos', tipos);
  }

  const url = `/movimientos?${params.toString()}`;
  const { data } = await http.get(url);
  return data;
}

