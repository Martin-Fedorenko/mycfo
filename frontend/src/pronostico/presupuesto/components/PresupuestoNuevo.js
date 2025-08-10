import * as React from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Grid, TextField, MenuItem, IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export default function PresupuestoNuevo() {
  const navigate = useNavigate();

  const [nombre, setNombre] = React.useState('');
  const [fechaDesde, setFechaDesde] = React.useState('');
  const [fechaHasta, setFechaHasta] = React.useState('');
  const [presupuestoData, setPresupuestoData] = React.useState([
    { categoria: 'Alquiler', tipo: 'Egreso', sugerido: 100000, monto: 100000 },
    { categoria: 'Sueldos', tipo: 'Egreso', sugerido: 150000, monto: 120000 },
    { categoria: 'Ventas esperadas', tipo: 'Ingreso', sugerido: 300000, monto: 300000 },
  ]);

  const handleAgregarCategoria = () => {
    setPresupuestoData([...presupuestoData, { categoria: '', tipo: 'Egreso', sugerido: 0, monto: 0 }]);
  };

  const handleEliminarCategoria = (index) => {
    setPresupuestoData(presupuestoData.filter((_, i) => i !== index));
  };

  const handleCambioCampo = (index, campo, valor) => {
    const newData = [...presupuestoData];
    newData[index][campo] = campo === 'sugerido' || campo === 'monto' ? Number(valor) : valor;
    setPresupuestoData(newData);
  };

  const totalIngresos = presupuestoData.filter(r => r.tipo === 'Ingreso').reduce((acc, r) => acc + r.monto, 0);
  const totalEgresos = presupuestoData.filter(r => r.tipo === 'Egreso').reduce((acc, r) => acc + r.monto, 0);

const handleGuardar = async () => {
  if (!nombre || !fechaDesde || !fechaHasta) {
    alert("Completa todos los campos obligatorios");
    return;
  }

  const payload = {
    nombre,
    desde: fechaDesde,
    hasta: fechaHasta,
    categoriasJson: JSON.stringify(presupuestoData) // ajusta si tu modelo cambia
  };

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos`,
      payload
    );
    const creado = res.data;
    navigate(`/presupuesto/${creado.id}`);
  } catch (error) {
    console.error("Error guardando presupuesto", error);
    alert("No se pudo guardar el presupuesto");
  }
};

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>Nuevo Presupuesto</Typography>
      <Typography variant="subtitle1" gutterBottom>Planificá tus ingresos y egresos esperados</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Nombre del presupuesto"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Desde"
          type="date"
          value={fechaDesde}
          onChange={e => setFechaDesde(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Hasta"
          type="date"
          value={fechaHasta}
          onChange={e => setFechaHasta(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box mt={2} mb={1}>
        <Button variant="outlined" onClick={handleAgregarCategoria}>+ Nueva categoría</Button>
      </Box>

      <Paper sx={{ mt: 1, width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Categoría</TableCell>
              <TableCell sx={tableCellStyle}>Tipo</TableCell>
              <TableCell sx={tableCellStyle}>Monto sugerido</TableCell>
              <TableCell sx={tableCellStyle}>Monto</TableCell>
              <TableCell sx={tableCellStyle}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {presupuestoData.map((item, idx) => (
              <TableRow key={idx} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>
                  <TextField
                    fullWidth
                    value={item.categoria}
                    onChange={(e) => handleCambioCampo(idx, 'categoria', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <TextField
                    select
                    fullWidth
                    value={item.tipo}
                    onChange={(e) => handleCambioCampo(idx, 'tipo', e.target.value)}
                    variant="standard"
                  >
                    <MenuItem value="Ingreso">Ingreso</MenuItem>
                    <MenuItem value="Egreso">Egreso</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <TextField
                    fullWidth
                    type="number"
                    value={item.sugerido}
                    onChange={(e) => handleCambioCampo(idx, 'sugerido', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <TextField
                    fullWidth
                    type="number"
                    value={item.monto}
                    onChange={(e) => handleCambioCampo(idx, 'monto', e.target.value)}
                    variant="standard"
                  />
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <IconButton onClick={() => handleEliminarCategoria(idx)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Ingresos proyectados:</Typography>
              <Typography variant="h6" color="green">${totalIngresos.toLocaleString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Egresos proyectados:</Typography>
              <Typography variant="h6" color="red">${totalEgresos.toLocaleString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Resultado esperado:</Typography>
              <Typography variant="h6" color="blue">${(totalIngresos - totalEgresos).toLocaleString()}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box mt={4} display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={handleGuardar}>Guardar presupuesto</Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar</Button>
      </Box>
    </Box>
  );
}
