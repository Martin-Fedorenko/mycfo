import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  ReferenceLine,
} from 'recharts';

// Helper seguro para números
const safeNumber = (v) =>
  typeof v === 'number' ? v : v != null && !isNaN(Number(v)) ? Number(v) : 0;

// Colores
const INGRESO_EST_COLOR = '#a5d6a7';
const INGRESO_REAL_COLOR = '#4caf50';
const EGRESO_EST_COLOR = '#ef9a9a';
const EGRESO_REAL_COLOR = '#f44336';
const SUPERAVIT_COLOR = '#4caf50';
const DEFICIT_COLOR = '#f44336';

// Mapeo de número de mes a nombre corto
const mesCorto = (num) => {
  const nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return nombres[parseInt(num, 10) - 1] || num;
};

// Formatear diferencia
const formatDiff = (est, real) => {
  const diff = real - est;
  return diff >= 0 ? `+$${diff.toLocaleString()}` : `-$${Math.abs(diff).toLocaleString()}`;
};

export default function PresupuestoDetalle() {
  const { nombre: nombreUrl } = useParams();
  const navigate = useNavigate();

  const [presupuesto, setPresupuesto] = React.useState({
    id: null,
    nombre: '',
    detalleMensual: [],
  });

  const [tab, setTab] = React.useState(0); // 0: resumen, 1: tabla

  React.useEffect(() => {
    const fetchPresupuestos = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos`
        );
        const lista = res.data;

        const decodedNombre = decodeURIComponent(nombreUrl)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-');

        const encontrado = lista.find(
          (p) => p.nombre.trim().toLowerCase().replace(/\s+/g, '-') === decodedNombre
        );

        if (encontrado) {
          const resDetalle = await axios.get(
            `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${encontrado.id}`
          );
          setPresupuesto(resDetalle.data);
        } else {
          console.error("Presupuesto no encontrado por nombre:", nombreUrl);
          setPresupuesto({ id: null, nombre: 'No encontrado', detalleMensual: [] });
        }
      } catch (error) {
        console.error('Error al cargar presupuesto:', error);
        setPresupuesto({ id: null, nombre: 'Error', detalleMensual: [] });
      }
    };

    if (nombreUrl) {
      fetchPresupuestos();
    }
  }, [nombreUrl]);

  const datosMensuales = Array.isArray(presupuesto.detalleMensual)
    ? presupuesto.detalleMensual.filter((mes) => mes != null && mes.id != null)
    : [];

  // Totales
  const totalIngresoEst = datosMensuales.reduce((acc, m) => acc + safeNumber(m.ingresoEst), 0);
  const totalIngresoReal = datosMensuales.reduce((acc, m) => acc + safeNumber(m.ingresoReal), 0);
  const totalEgresoEst = datosMensuales.reduce((acc, m) => acc + safeNumber(m.egresoEst), 0);
  const totalEgresoReal = datosMensuales.reduce((acc, m) => acc + safeNumber(m.egresoReal), 0);
  const resultadoReal = totalIngresoReal - totalEgresoReal;
  const resultadoEstimado = totalIngresoEst - totalEgresoEst;

  // Datos para gráficos separados
  const ingresosData = datosMensuales.map((mes) => ({
    mes: mesCorto(mes.mes?.split('-')[1]),
    estimado: safeNumber(mes.ingresoEst),
    real: safeNumber(mes.ingresoReal),
  }));

  const egresosData = datosMensuales.map((mes) => ({
    mes: mesCorto(mes.mes?.split('-')[1]),
    estimado: safeNumber(mes.egresoEst),
    real: safeNumber(mes.egresoReal),
  }));

  // Datos para gráfico de desviación (superávit/déficit por mes)
  const desvioData = datosMensuales.map((mes) => {
    const superavit = safeNumber(mes.totalReal);
    return {
      mes: mesCorto(mes.mes?.split('-')[1]),
      superavit,
      fill: superavit >= 0 ? SUPERAVIT_COLOR : DEFICIT_COLOR,
    };
  });

  // Función para navegar al detalle del mes
  const goToMes = (mes) => {
    if (!mes?.id) return alert('Mes no válido');
    const nombreNormalizado = encodeURIComponent(presupuesto.nombre.trim().toLowerCase().replace(/\s+/g, '-'));
    const mesNum = parseInt(mes.mes.split('-')[1], 10);
    const mesNombre = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(2025, mesNum - 1));
    navigate(`/presupuestos/${nombreNormalizado}/detalle/${mesNombre}`);
  };

  // === EXPORTACIÓN (igual) ===
  const handleExportExcel = () => {
    const { nombre } = presupuesto;
    const data = [
      ['Mes', 'Ingreso Estimado', 'Ingreso Real', 'Desvío Ingresos', 'Egreso Estimado', 'Egreso Real', 'Desvío Egresos', 'Total Estimado', 'Total Real', 'Total Desvío'],
      ...datosMensuales.map(mes => [
        mes.mes ?? '—',
        safeNumber(mes.ingresoEst),
        safeNumber(mes.ingresoReal),
        safeNumber(mes.desvioIngreso),
        safeNumber(mes.egresoEst),
        safeNumber(mes.egresoReal),
        safeNumber(mes.desvioEgreso),
        safeNumber(mes.totalEst),
        safeNumber(mes.totalReal),
        safeNumber(mes.totalDesvio),
      ])
    ];

    data.push(['', '', '', '', '', '', '', '', '', '']);
    data.push(['Totales:', '', '', '', '', '', '', '', '', '']);
    data.push([
      '',
      totalIngresoEst,
      totalIngresoReal,
      totalIngresoReal - totalIngresoEst,
      totalEgresoEst,
      totalEgresoReal,
      totalEgresoReal - totalEgresoEst,
      resultadoEstimado,
      resultadoReal,
      resultadoReal - resultadoEstimado
    ]);

    import('xlsx').then(({ utils, writeFile }) => {
      const ws = utils.aoa_to_sheet(data, { cellStyles: true });
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Detalle Presupuesto');
      writeFile(wb, `Presupuesto_${nombre}_${presupuesto.id}.xlsx`, { cellStyles: true });
    });
  };

  const handleExportPdf = () => {
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('presupuesto-detalle-content');
      const opt = {
        margin: 0.5,
        filename: `Presupuesto_${presupuesto.nombre}_${presupuesto.id}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
      };
      html2pdf.default().from(element).set(opt).save();
    });
  };

  return (
    <Box id="presupuesto-detalle-content" sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        📊 Detalle de {presupuesto.nombre}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Compará tu planificación con lo real
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 1 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} indicatorColor="primary">
          <Tab label="Resumen" />
          <Tab label="Datos brutos" />
        </Tabs>
        <ExportadorSimple onExportPdf={handleExportPdf} onExportExcel={handleExportExcel} />
      </Box>

      {/* === PESTAÑA 0: RESUMEN VISUAL === */}
      {tab === 0 && (
        <>
          {/* KPIs con íconos */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: 'success.main', mx: 'auto', mb: 1 }}>+</Avatar>
                <Typography variant="h6">Ingresos</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${totalIngresoReal.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {formatDiff(totalIngresoEst, totalIngresoReal)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: 'error.main', mx: 'auto', mb: 1 }}>-</Avatar>
                <Typography variant="h6">Egresos</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${totalEgresoReal.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {formatDiff(totalEgresoEst, totalEgresoReal)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: resultadoReal >= 0 ? 'info.light' : 'warning.light',
                  color: 'white',
                }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'white',
                    color: resultadoReal >= 0 ? 'info.main' : 'warning.main',
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  {resultadoReal >= 0 ? '✓' : '⚠'}
                </Avatar>
                <Typography variant="h6">Resultado</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${resultadoReal.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {resultadoReal >= 0 ? 'Superávit' : 'Déficit'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* === GRÁFICO 1: Ingresos Estimado vs Real (estructura tipo gráfico 4) === */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Ingresos: Estimado vs Real
            </Typography>
            <Box sx={{ mt: 2 }}>
              {ingresosData.map((item, index) => {
                const max = Math.max(item.estimado, item.real) * 1.2;
                const mes = datosMensuales[index];
                return (
                  <Box key={index} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      {item.mes}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* BARRA ESTIMADO */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                           onClick={() => mes && goToMes(mes)}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>Estimado:</Typography>
                        <Box sx={{ flex: 1, height: 30 }}>
                          <ResponsiveContainer width="100%" height={30}>
                            <BarChart
                              data={[{ name: item.mes, valor: item.estimado }]}
                              layout="vertical"
                              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            >
                              <XAxis type="number" domain={[0, max]} hide />
                              <YAxis type="category" dataKey="name" hide />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                              <Bar
                                dataKey="valor"
                                fill={INGRESO_EST_COLOR}
                                radius={[4, 4, 4, 4]}
                                label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>

                      {/* BARRA REAL */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                           onClick={() => mes && goToMes(mes)}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>Real:</Typography>
                        <Box sx={{ flex: 1, height: 30 }}>
                          <ResponsiveContainer width="100%" height={30}>
                            <BarChart
                              data={[{ name: item.mes, valor: item.real }]}
                              layout="vertical"
                              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            >
                              <XAxis type="number" domain={[0, max]} hide />
                              <YAxis type="category" dataKey="name" hide />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                              <Bar
                                dataKey="valor"
                                fill={INGRESO_REAL_COLOR}
                                radius={[4, 4, 4, 4]}
                                label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* === GRÁFICO 2: Egresos Estimado vs Real (estructura tipo gráfico 4) === */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Egresos: Estimado vs Real
            </Typography>
            <Box sx={{ mt: 2 }}>
              {egresosData.map((item, index) => {
                const max = Math.max(item.estimado, item.real) * 1.2;
                const mes = datosMensuales[index];
                return (
                  <Box key={index} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      {item.mes}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* BARRA ESTIMADO */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                           onClick={() => mes && goToMes(mes)}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>Estimado:</Typography>
                        <Box sx={{ flex: 1, height: 30 }}>
                          <ResponsiveContainer width="100%" height={30}>
                            <BarChart
                              data={[{ name: item.mes, valor: item.estimado }]}
                              layout="vertical"
                              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            >
                              <XAxis type="number" domain={[0, max]} hide />
                              <YAxis type="category" dataKey="name" hide />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                              <Bar
                                dataKey="valor"
                                fill={EGRESO_EST_COLOR}
                                radius={[4, 4, 4, 4]}
                                label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>

                      {/* BARRA REAL */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                           onClick={() => mes && goToMes(mes)}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>Real:</Typography>
                        <Box sx={{ flex: 1, height: 30 }}>
                          <ResponsiveContainer width="100%" height={30}>
                            <BarChart
                              data={[{ name: item.mes, valor: item.real }]}
                              layout="vertical"
                              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            >
                              <XAxis type="number" domain={[0, max]} hide />
                              <YAxis type="category" dataKey="name" hide />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                              <Bar
                                dataKey="valor"
                                fill={EGRESO_REAL_COLOR}
                                radius={[4, 4, 4, 4]}
                                label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>


          {/* === GRÁFICO 3: Tendencia del Resultado (Línea con zona) === */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Tendencia del Resultado Mensual
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={desvioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="50%" stopColor="#4caf50" stopOpacity={0.1} />
                    <stop offset="50%" stopColor="#f44336" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="superavit"
                  fill="url(#splitColor)"
                  stroke="none"
                  yAxisId="left"
                />
                <Line
                  type="monotone"
                  dataKey="superavit"
                  stroke="#2196f3"
                  strokeWidth={2}
                  dot={{ r: 6, cursor: 'pointer' }}
                  activeDot={{ r: 8 }}
                  yAxisId="left"
                  onClick={(data, index) => {
                    const mes = datosMensuales[index];
                    if (mes) goToMes(mes);
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke="#666"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Punto de equilibrio',
                    position: 'right',
                    fill: '#666',
                    fontSize: 12,
                  }}
                />
                <XAxis dataKey="mes" />
                <YAxis
                  yAxisId="left"
                  domain={[dataMin => Math.min(dataMin, 0), dataMax => Math.max(dataMax, 0)]}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  width={70}
                />
                <Tooltip
                  formatter={(value) => [
                    value >= 0
                      ? `Superávit: $${value.toLocaleString()}`
                      : `Déficit: -$${Math.abs(value).toLocaleString()}`,
                    'Resultado'
                  ]}
                  contentStyle={{ color: 'black' }}
                />
                <Legend
                  payload={[
                    { value: 'Resultado mensual', type: 'line', color: '#2196f3' },
                    { value: 'Punto de equilibrio', type: 'dashedLine', color: '#666' },
                  ]}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </>
      )}

      {/* === PESTAÑA 1: TABLA ORIGINAL === */}
      {tab === 1 && (
        <Paper sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                fontWeight: 'bold',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Mes</th>
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Ingreso Estimado</th>
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Ingreso Real</th>
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Egreso Estimado</th>
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Egreso Real</th>
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Total Real</th>
                <th style={{ padding: '12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datosMensuales.length > 0 ? (
                datosMensuales.map((mes) => (
                  <tr key={mes.id}>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>{mes.mes}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>${safeNumber(mes.ingresoEst).toLocaleString()}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>${safeNumber(mes.ingresoReal).toLocaleString()}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>${safeNumber(mes.egresoEst).toLocaleString()}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>${safeNumber(mes.egresoReal).toLocaleString()}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>${safeNumber(mes.totalReal).toLocaleString()}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Button size="small" variant="contained" onClick={() => goToMes(mes)}>
                        Ver mes
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'text.secondary' }}>
                    No hay datos mensuales disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Paper>
      )}

      {/* Botón de volver */}
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Box>
    </Box>
  );
}