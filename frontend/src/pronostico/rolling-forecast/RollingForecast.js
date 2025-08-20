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
import ExportadorSimple from '../../shared-components/ExportadorSimple';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const horizontes = [
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: '12 meses', value: '12m' },
];

function generarRollingData(horizonte) {
  const cantidad = horizonte === '3m' ? 3 : horizonte === '6m' ? 6 : 12;
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const data = [];

  const ingresosBase = 50000;
  const egresosBase = 30000;

  const fluctuacion = (base, delta = 3000) => {
    return Math.round(base + (Math.random() * 2 - 1) * delta);
  };

  for (let i = 0; i < cantidad; i++) {
    const mes = meses[(7 + i) % 12];
    const year = 2025 + Math.floor((7 + i) / 12);
    const ingresos = fluctuacion(ingresosBase + i * 500);
    const egresos = fluctuacion(egresosBase + i * 400);
    const saldo = ingresos - egresos;

    data.push({
      mes: `${mes} ${year}`,
      ingresos,
      egresos,
      saldo,
    });
  }

  return data;
}

export default function RollingForecast() {
  const [horizonte, setHorizonte] = React.useState('3m');
  const [ultimoHorizonteAplicado, setUltimoHorizonteAplicado] = React.useState('3m');
  const [rollingData, setRollingData] = React.useState(generarRollingData('3m'));

  const handleActualizarForecast = () => {
    const nuevosDatos = generarRollingData(horizonte);
    setRollingData(nuevosDatos);
    setUltimoHorizonteAplicado(horizonte);
  };

  const handleExportPdf = () => {
    alert('Exportar Rolling Forecast como PDF');
  };

  const handleExportExcel = () => {
    alert('Exportar Rolling Forecast como Excel');
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Rolling Forecast
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Consultá proyecciones financieras actualizadas dinámicamente mes a mes.
      </Typography>

      {/* Selector + botón + exportador */}
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
            label="Horizonte"
            value={horizonte}
            onChange={(e) => setHorizonte(e.target.value)}
            sx={{ minWidth: 160 }}
            size="small"
          >
            {horizontes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            color={horizonte === ultimoHorizonteAplicado ? 'inherit' : 'primary'}
            onClick={handleActualizarForecast}
            disabled={horizonte === ultimoHorizonteAplicado}
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
              <TableCell sx={tableCellStyle}>Mes</TableCell>
              <TableCell sx={tableCellStyle}>Ingresos estimados</TableCell>
              <TableCell sx={tableCellStyle}>Egresos estimados</TableCell>
              <TableCell sx={tableCellStyle}>Saldo proyectado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rollingData.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={tableCellStyle}>{row.mes}</TableCell>
                <TableCell sx={tableCellStyle}>${row.ingresos.toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${row.egresos.toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${row.saldo.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Gráfico */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Evolución del Saldo Proyectado
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rollingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="saldo" stroke="#00bfa5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
