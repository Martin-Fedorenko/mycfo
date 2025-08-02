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
import Exportador from '../../../shared-components/Exportador'; // Ajustá el path si es necesario

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

// Datos de ejemplo
const rollingData = [
  { mes: 'Ago 2025', ingresos: 50000, egresos: 30000, saldo: 20000 },
  { mes: 'Sep 2025', ingresos: 52000, egresos: 31000, saldo: 21000 },
  { mes: 'Oct 2025', ingresos: 53000, egresos: 32000, saldo: 22000 },
  { mes: 'Nov 2025', ingresos: 54000, egresos: 33000, saldo: 23000 },
  { mes: 'Dic 2025', ingresos: 55000, egresos: 34000, saldo: 24000 },
];

const horizontes = [
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: '12 meses', value: '12m' },
];

export default function RollingForecast() {
  const [horizonte, setHorizonte] = React.useState('3m');

  const handleExportPdf = () => {
    // lógica real para exportar en PDF
    alert('Exportar Rolling Forecast como PDF');
  };

  const handleExportExcel = () => {
    // lógica real para exportar en Excel
    alert('Exportar Rolling Forecast como Excel');
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3, position: 'relative' }}>
      <Typography variant="h4" gutterBottom>
        Rolling Forecast
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Consultá proyecciones financieras actualizadas dinámicamente mes a mes.
      </Typography>

      {/* Selector de horizonte */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
        <TextField
          select
          label="Horizonte"
          value={horizonte}
          onChange={(e) => setHorizonte(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {horizontes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={() => alert('Actualizar forecast')}>
          Actualizar Forecast
        </Button>
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

      {/* Exportador compartido */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Exportador
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
          label="Exportar Rolling Forecast"
        />
      </Box>
    </Box>
  );
}