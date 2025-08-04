import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const periodos = [
  { label: '1 mes', value: '1m' },
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: 'Personalizado', value: 'custom' },
];

export default function MainGrid() {
  const [periodo, setPeriodo] = React.useState('3m');
  const [ultimoPeriodoAplicado, setUltimoPeriodoAplicado] = React.useState('3m');
  const [forecastData, setForecastData] = React.useState([
    { fecha: '01/08/2025', tipo: 'Ingreso', detalle: 'Sueldo', monto: 25000, saldo: 25000 },
    { fecha: '03/08/2025', tipo: 'Egreso', detalle: 'Alquiler', monto: 10000, saldo: 15000 },
    { fecha: '08/08/2025', tipo: 'Egreso', detalle: 'Comida', monto: 5000, saldo: 10000 },
    { fecha: '10/08/2025', tipo: 'Ingreso', detalle: 'Venta freelance', monto: 15000, saldo: 25000 },
    { fecha: '15/08/2025', tipo: 'Egreso', detalle: 'Transporte', monto: 2000, saldo: 23000 },
  ]);

  const handleExportPdf = () => {
    alert('Exportar Cash Flow Forecast como PDF');
  };

  const handleExportExcel = () => {
    alert('Exportar Cash Flow Forecast como Excel');
  };

  const actualizarForecast = () => {
    let cantidad = 5;
    if (periodo === '1m') cantidad = 5;
    if (periodo === '3m') cantidad = 15;
    if (periodo === '6m') cantidad = 30;
    if (periodo === 'custom') cantidad = 10;

    const nuevaData = [];
    let saldo = 20000;

    for (let i = 1; i <= cantidad; i++) {
      const esIngreso = i % 3 === 0;
      const monto = esIngreso ? 10000 + i * 100 : 4000 + i * 50;
      saldo += esIngreso ? monto : -monto;

      nuevaData.push({
        fecha: `${String(i).padStart(2, '0')}/08/2025`,
        tipo: esIngreso ? 'Ingreso' : 'Egreso',
        detalle: esIngreso ? 'Ingreso simulado' : 'Egreso simulado',
        monto,
        saldo,
      });
    }

    setForecastData(nuevaData);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cash Flow Forecast
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Visualizá el pronóstico de flujo de caja para anticipar faltantes o excedentes de liquidez
      </Typography>

      {/* Filtros y ExportadorSimple responsive */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mt: 2,
          mb: 2,
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', sm: 'space-between' },
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            label="Período"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            sx={{ minWidth: 160 }}
            size="small"
          >
            {periodos.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            color={periodo === ultimoPeriodoAplicado ? 'inherit' : 'primary'}
            onClick={() => {
              actualizarForecast();
              setUltimoPeriodoAplicado(periodo);
            }}
            disabled={periodo === ultimoPeriodoAplicado}
            size="medium"
            sx={{ height: 36 }}
          >
            Actualizar Forecast
          </Button>
        </Box>

        <Box sx={{ mt: { xs: 1, sm: 0 } }}>
          <ExportadorSimple
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
            sx={{
              display: 'flex',
              gap: 1,
              '& button': {
                minWidth: 40,
                padding: '6px 8px',
                borderRadius: 1,
                height: 36,
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>
      </Box>

      {/* Tabla */}
      <Paper sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Fecha</TableCell>
              <TableCell sx={tableCellStyle}>Movimiento</TableCell>
              <TableCell sx={tableCellStyle}>Detalle</TableCell>
              <TableCell sx={tableCellStyle}>Monto</TableCell>
              <TableCell sx={tableCellStyle}>Saldo estimado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forecastData.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={tableCellStyle}>{row.fecha}</TableCell>
                <TableCell sx={tableCellStyle}>{row.tipo}</TableCell>
                <TableCell sx={tableCellStyle}>{row.detalle}</TableCell>
                <TableCell sx={tableCellStyle}>
                  {row.tipo === 'Egreso' ? '-' : ''}${row.monto.toLocaleString()}
                </TableCell>
                <TableCell sx={tableCellStyle}>${row.saldo.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Gráfico */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Proyección de Saldo Estimado
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="saldo" stroke="#00bfa5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Ajustes manuales */}
      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>
          ¿Querés ajustar valores manualmente?
        </Typography>
        <Button variant="outlined" onClick={() => alert('Agregar ingreso o egreso manual')}>
          + Agregar ingreso o egreso manual
        </Button>
      </Box>
    </Box>
  );
}
