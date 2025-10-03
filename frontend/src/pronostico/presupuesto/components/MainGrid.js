import * as React from 'react';
import {
  Box, Typography, Button, Paper,
  Table, TableHead, TableRow, TableCell, TableBody, TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export default function MainGrid() {
  const navigate = useNavigate();
  const [presupuestos, setPresupuestos] = React.useState([]);
  const [query, setQuery] = React.useState('');


  const monthName = (ym) => {
    if (!ym) return '';
    const [anio, mes] = ym.split('-');
    const nombres = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const idx = Number(mes) - 1;
    return idx >= 0 && idx < nombres.length ? `${nombres[idx]} ${anio}` : ym;
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return presupuestos;
    return presupuestos.filter((p) => {
      const nombre = (p?.nombre || '').toLowerCase();
      const desde = (p?.desde || '').toLowerCase();
      const hasta = (p?.hasta || '').toLowerCase();
      const desdeMes = monthName(p?.desde || '').toLowerCase();
      const hastaMes = monthName(p?.hasta || '').toLowerCase();
      return (
        nombre.includes(term) ||
        desde.includes(term) ||
        hasta.includes(term) ||
        desdeMes.includes(term) ||
        hastaMes.includes(term)
      );
    });
  }, [presupuestos, query]);
  React.useEffect(() => {
    const fetchPresupuestos = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos`
        );
        console.log("Datos recibidos del backend:", res.data);
        setPresupuestos(res.data);
      } catch (e) {
        console.error("Error cargando presupuestos desde el backend:", e);
        setPresupuestos([]); // Si hay error, queda vacío
      }
    };
    fetchPresupuestos();
  }, []);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>Presupuestos</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá tus presupuestos creados o generá uno nuevo
      </Typography>

      <TextField
        label="Buscar por nombre, mes o a�o"
        variant="outlined"
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mt: 2, mb: 2, maxWidth: 360 }}
      />

      <Paper sx={{ width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Nombre</TableCell>
              <TableCell sx={tableCellStyle}>Desde</TableCell>
              <TableCell sx={tableCellStyle}>Hasta</TableCell>
              <TableCell sx={{ ...tableCellStyle }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>{p.nombre}</TableCell>
                <TableCell sx={tableCellStyle}>{p.desde}</TableCell>
                <TableCell sx={tableCellStyle}>{p.hasta}</TableCell>
                <TableCell sx={{ ...tableCellStyle }} align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const nombreUrl = encodeURIComponent(p.nombre.trim().toLowerCase().replace(/\s+/g, '-'));
                      navigate(`/presupuestos/${nombreUrl}`);
                    }}
                  >
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                  No hay presupuestos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Box mt={3}>
        <Button variant="contained" onClick={() => navigate('/presupuestos/nuevo')}>
          Crear nuevo presupuesto
        </Button>
      </Box>
    </Box>
  );
}
