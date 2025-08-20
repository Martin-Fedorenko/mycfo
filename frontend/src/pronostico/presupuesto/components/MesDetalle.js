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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

// Helper seguro para números
const safeNumber = (v) =>
  typeof v === 'number' ? v : v != null && !isNaN(Number(v)) ? Number(v) : 0;

// Colores
const INGRESO_COLOR = '#4caf50';
const EGRESO_COLOR = '#f44336';
const INGRESO_EST_COLOR = '#a5d6a7';
const EGRESO_EST_COLOR = '#ef9a9a';

// Mapeo de nombre del mes a número
const mesANumero = {
  enero: '01', febrero: '02', marzo: '03', abril: '04',
  mayo: '05', junio: '06', julio: '07', agosto: '08',
  septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
};

// Formatear "2025-07" a "Julio 2025"
const formatearMes = (mesString) => {
  if (!mesString) return 'Mes desconocido';
  const [anio, mes] = mesString.split('-');
  const mesesNombre = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const mesNum = parseInt(mes, 10);
  if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) return mesString;
  return `${mesesNombre[mesNum - 1]} ${anio}`;
};

export default function MesDetalle() {
  const { nombre: nombreUrl, mesNombre: mesNombreUrl } = useParams();
  const navigate = useNavigate();

  const [categorias, setCategorias] = React.useState([]);
  const [nombreMes, setNombreMes] = React.useState('Mes desconocido');
  const [presupuestoNombre, setPresupuestoNombre] = React.useState('');
  const [tab, setTab] = React.useState(0); // 0: resumen, 1: tabla

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Paso 1: Buscar presupuesto por nombre
        const resPresupuestos = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos`
        );
        const decodedNombre = decodeURIComponent(nombreUrl)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-');

        const presupuesto = resPresupuestos.data.find(
          (p) => p.nombre.trim().toLowerCase().replace(/\s+/g, '-') === decodedNombre
        );

        if (!presupuesto) throw new Error("Presupuesto no encontrado");

        const presupuestoId = presupuesto.id;
        setPresupuestoNombre(presupuesto.nombre);

        // Paso 2: Obtener detalles para mapear mesNombre → detalleId
        const resDetalle = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${presupuestoId}`
        );

        const mesNormalizado = mesNombreUrl.toLowerCase().trim();
        const mesNum = mesANumero[mesNormalizado];

        if (!mesNum) throw new Error("Mes no válido");

        const detalleMes = resDetalle.data.detalleMensual.find(mes =>
          mes.mes?.endsWith(`-${mesNum}`)
        );

        if (!detalleMes) throw new Error("Detalle mensual no encontrado");

        const detalleId = detalleMes.id;
        setNombreMes(formatearMes(detalleMes.mes));

        // Paso 3: Llamar al endpoint con IDs reales
        const res = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${presupuestoId}/mes/${detalleId}`
        );

        setCategorias(res.data.categorias || []);
      } catch (e) {
        console.error(e);
        setCategorias([]);
        setNombreMes('Mes desconocido');
      }
    };

    if (nombreUrl && mesNombreUrl) {
      fetchData();
    }
  }, [nombreUrl, mesNombreUrl]);

  // Filtrar categorías
  const ingresos = categorias.filter(c => c.tipo === 'INGRESO');
  const egresos = categorias.filter(c => c.tipo === 'EGRESO');

  // Totales
  const totalIngresos = ingresos.reduce((acc, c) => acc + safeNumber(c.montoReal), 0);
  const totalEgresos = egresos.reduce((acc, c) => acc + safeNumber(c.montoReal), 0);
  const resultado = totalIngresos - totalEgresos;

  // Datos para gráficos de INGRESOS
  const pieDataIngresos = ingresos.map(i => ({
    name: i.categoria,
    value: safeNumber(i.montoReal),
  }));

  const barDataIngresos = ingresos.map(i => ({
    name: i.categoria,
    estimado: safeNumber(i.montoEstimado),
    real: safeNumber(i.montoReal),
  }));

  // Datos para gráficos de EGRESOS
  const pieDataEgresos = egresos.map(e => ({
    name: e.categoria,
    value: safeNumber(e.montoReal),
  }));

  const barDataEgresos = egresos.map(e => ({
    name: e.categoria,
    estimado: safeNumber(e.montoEstimado),
    real: safeNumber(e.montoReal),
  }));

  // === EXPORTACIÓN (igual) ===
  const handleExportExcel = () => {
    const data = [
      ['Categoría', 'Tipo', 'Monto Estimado', 'Monto Registrado'],
      ...categorias.map(item => [
        item.categoria,
        item.tipo,
        safeNumber(item.montoEstimado),
        safeNumber(item.montoReal)
      ])
    ];
    data.push(['', '', '', '']);
    data.push(['Totales:', '', '', '']);
    data.push(['', '', '', totalIngresos - totalEgresos]);

    import('xlsx').then(({ utils, writeFile }) => {
      const ws = utils.aoa_to_sheet(data, { cellStyles: true });
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Detalle Mes');
      writeFile(wb, `Mes_${nombreMes}_${Date.now()}.xlsx`, { cellStyles: true });
    });
  };

  const handleExportPdf = () => {
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('mes-detalle-content');
      const opt = {
        margin: 1,
        filename: `Mes_${nombreMes}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf.default().from(element).set(opt).save();
    });
  };

  return (
    <Box id="mes-detalle-content" sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        📅 {nombreMes}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Detalle de {presupuestoNombre}
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
          {/* KPIs */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: 'success.main', mx: 'auto', mb: 1 }}>+</Avatar>
                <Typography variant="h6">Ingresos</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${totalIngresos.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: 'error.main', mx: 'auto', mb: 1 }}>-</Avatar>
                <Typography variant="h6">Egresos</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${totalEgresos.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: resultado >= 0 ? 'info.light' : 'warning.light',
                  color: 'white',
                }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'white',
                    color: resultado >= 0 ? 'info.main' : 'warning.main',
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  {resultado >= 0 ? '✓' : '⚠'}
                </Avatar>
                <Typography variant="h6">Resultado</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${resultado.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* === GRÁFICO 1: Distribución de Ingresos === */}
          {pieDataIngresos.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Distribución de Ingresos por Categoría
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieDataIngresos}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieDataIngresos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={INGRESO_COLOR} opacity={0.7 + index * 0.1} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay ingresos registrados este mes.</Typography>
            </Paper>
          )}

          {/* === GRÁFICO 2: Ingresos Estimado vs Real por Categoría (fila por fila) === */}
          {barDataIngresos.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Ingresos: Estimado vs Real por Categoría
              </Typography>
              <Box sx={{ mt: 2 }}>
                {barDataIngresos.map((item, index) => {
                  const max = Math.max(item.estimado, item.real) * 1.2;
                  return (
                    <Box key={index} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* BARRA ESTIMADO */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ minWidth: 80 }}>Estimado:</Typography>
                          <Box sx={{ flex: 1, height: 30 }}>
                            <ResponsiveContainer width="100%" height={30}>
                              <BarChart
                                data={[{ name: item.name, valor: item.estimado }]}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ minWidth: 80 }}>Real:</Typography>
                          <Box sx={{ flex: 1, height: 30 }}>
                            <ResponsiveContainer width="100%" height={30}>
                              <BarChart
                                data={[{ name: item.name, valor: item.real }]}
                                layout="vertical"
                                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                              >
                                <XAxis type="number" domain={[0, max]} hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                                <Bar
                                  dataKey="valor"
                                  fill={INGRESO_COLOR}
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
          ) : (
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay categorías de ingreso para comparar.</Typography>
            </Paper>
          )}

          {/* === GRÁFICO 2: Ingresos Estimado vs Real por Categoría === */}
{/*          {barDataIngresos.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Ingresos: Estimado vs Real por Categoría
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  minWidth: 0,
                  width: '100%',
                  '& .recharts-surface': { width: '100% !important' },
                }}
              >
                <ResponsiveContainer width="100%" height={Math.max(300, barDataIngresos.length * 40)}>
                  <BarChart
                    data={barDataIngresos}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                    barCategoryGap="20%"
                    barGap={4}
                  >
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      tick={{ fontSize: 12 }}
                      minTickGap={10}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      interval={0}
                      tick={{ fontSize: 12 }}
                      minTickGap={10}
                      padding={{ right: 20 }}
                    />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="estimado" fill={INGRESO_EST_COLOR} name="Estimado" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }} />
                    <Bar dataKey="real" fill={INGRESO_COLOR} name="Real" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay categorías de ingreso para comparar.</Typography>
            </Paper>
          )}
*/}
          {/* === GRÁFICO 3: Distribución de Egresos === */}
          {pieDataEgresos.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Distribución de Egresos por Categoría
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieDataEgresos}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieDataEgresos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EGRESO_COLOR} opacity={0.7 + index * 0.1} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay egresos registrados este mes.</Typography>
            </Paper>
          )}

          {/* === GRÁFICO 4: Egresos Estimado vs Real por Categoría (fila por fila) === */}
          {barDataEgresos.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Egresos: Estimado vs Real por Categoría
              </Typography>
              <Box sx={{ mt: 2 }}>
                {barDataEgresos.map((item, index) => {
                  const max = Math.max(item.estimado, item.real) * 1.2;
                  return (
                    <Box key={index} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* BARRA ESTIMADO */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ minWidth: 80 }}>Estimado:</Typography>
                          <Box sx={{ flex: 1, height: 30 }}>
                            <ResponsiveContainer width="100%" height={30}>
                              <BarChart
                                data={[{ name: item.name, valor: item.estimado }]}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ minWidth: 80 }}>Real:</Typography>
                          <Box sx={{ flex: 1, height: 30 }}>
                            <ResponsiveContainer width="100%" height={30}>
                              <BarChart
                                data={[{ name: item.name, valor: item.real }]}
                                layout="vertical"
                                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                              >
                                <XAxis type="number" domain={[0, max]} hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                                <Bar
                                  dataKey="valor"
                                  fill={EGRESO_COLOR}
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
          ) : (
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay categorías de egreso para comparar.</Typography>
            </Paper>
          )}

          {/* === GRÁFICO 4: Egresos Estimado vs Real por Categoría === */}
{/*          {barDataEgresos.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Egresos: Estimado vs Real por Categoría
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  minWidth: 0,
                  width: '100%',
                  '& .recharts-surface': { width: '100% !important' },
                }}
              >
                <ResponsiveContainer width="100%" height={Math.max(300, barDataEgresos.length * 40)}>
                  <BarChart
                    data={barDataEgresos}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                    barCategoryGap="20%"
                    barGap={4}
                  >
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      tick={{ fontSize: 12 }}
                      minTickGap={10}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      interval={0}
                      tick={{ fontSize: 12 }}
                      minTickGap={10}
                      padding={{ right: 20 }}
                    />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="estimado" fill={EGRESO_EST_COLOR} name="Estimado" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }} />
                    <Bar dataKey="real" fill={EGRESO_COLOR} name="Real" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v) => `$${v.toLocaleString()}` }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay categorías de egreso para comparar.</Typography>
            </Paper>
          )}
*/}
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
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Categoría</th>
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Tipo</th>
                <th style={{ padding: '12px', borderRight: '1px solid', borderColor: 'divider' }}>Monto Estimado</th>
                <th style={{ padding: '12px' }}>Monto Registrado</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length > 0 ? (
                categorias.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>{item.categoria}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>{item.tipo}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider', borderRight: '1px solid', borderColor: 'divider' }}>${safeNumber(item.montoEstimado).toLocaleString()}</td>
                    <td style={{ padding: '12px', border: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>${safeNumber(item.montoReal).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'text.secondary' }}>
                    No hay datos disponibles.
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