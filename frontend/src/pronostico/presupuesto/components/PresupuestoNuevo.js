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
  maxWidth: 100,
  minWidth: 80,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: '4px 6px',
  textAlign: 'center',
};

// Generar lista de meses entre dos fechas (YYYY-MM)
function generarMesesEntre(desde, hasta) {
  const meses = [];
  if (!desde || !hasta) return meses;

  let desdeDate = new Date(desde + '-01');
  let hastaDate = new Date(hasta + '-01');

  while (desdeDate <= hastaDate) {
    const y = desdeDate.getFullYear();
    const m = (desdeDate.getMonth() + 1).toString().padStart(2, '0');
    meses.push(`${y}-${m}`);
    desdeDate.setMonth(desdeDate.getMonth() + 1);
  }
  return meses;
}

export default function PresupuestoNuevo() {
  const navigate = useNavigate();

  const [nombre, setNombre] = React.useState('');
  const [fechaDesde, setFechaDesde] = React.useState('');
  const [fechaHasta, setFechaHasta] = React.useState('');

  const [categorias, setCategorias] = React.useState([
    { categoria: 'Alquiler', tipo: 'Egreso' },
    { categoria: 'Sueldos', tipo: 'Egreso' },
    { categoria: 'Ventas esperadas', tipo: 'Ingreso' },
  ]);

  const [presupuestoDataMes, setPresupuestoDataMes] = React.useState({});

  const meses = React.useMemo(() => {
    if (!fechaDesde || !fechaHasta) return [];
    return generarMesesEntre(fechaDesde.slice(0, 7), fechaHasta.slice(0, 7));
  }, [fechaDesde, fechaHasta]);

  React.useEffect(() => {
    if (meses.length === 0) {
      setPresupuestoDataMes({});
      return;
    }

    setPresupuestoDataMes(oldData => {
      const newData = { ...oldData };

      meses.forEach(mes => {
        if (!newData[mes]) newData[mes] = {};
        categorias.forEach(cat => {
          if (!newData[mes][cat.categoria]) {
            newData[mes][cat.categoria] = { sugerido: 0, tipo: cat.tipo };
          } else {
            newData[mes][cat.categoria].tipo = cat.tipo;
          }
        });

        Object.keys(newData[mes]).forEach(catKey => {
          if (!categorias.find(c => c.categoria === catKey)) {
            delete newData[mes][catKey];
          }
        });
      });

      Object.keys(newData).forEach(mesKey => {
        if (!meses.includes(mesKey)) delete newData[mesKey];
      });

      return newData;
    });
  }, [meses, categorias]);

  const handleAgregarCategoria = () => {
    setCategorias([...categorias, { categoria: '', tipo: 'Egreso' }]);
  };

  const handleEliminarCategoria = (index) => {
    const catEliminada = categorias[index];
    setCategorias(categorias.filter((_, i) => i !== index));

    setPresupuestoDataMes(oldData => {
      const newData = { ...oldData };
      Object.keys(newData).forEach(mes => {
        delete newData[mes][catEliminada.categoria];
      });
      return newData;
    });
  };

  const handleCambioCategoria = (index, campo, valor) => {
    const newCats = [...categorias];
    const oldNombre = newCats[index].categoria;
    newCats[index][campo] = valor;

    if (campo === 'categoria') {
      setPresupuestoDataMes(oldData => {
        const newData = {};
        Object.entries(oldData).forEach(([mes, cats]) => {
          newData[mes] = {};
          Object.entries(cats).forEach(([catName, valores]) => {
            if (catName === oldNombre) {
              newData[mes][valor] = { ...valores, tipo: newCats[index].tipo };
            } else {
              newData[mes][catName] = valores;
            }
          });
        });
        return newData;
      });
    } else if (campo === 'tipo') {
      setPresupuestoDataMes(oldData => {
        const newData = { ...oldData };
        Object.keys(newData).forEach(mes => {
          if (newData[mes][newCats[index].categoria]) {
            newData[mes][newCats[index].categoria].tipo = valor;
          }
        });
        return newData;
      });
    }

    setCategorias(newCats);
  };

  const handleCambioMonto = (mes, categoria, campo, valor) => {
    setPresupuestoDataMes(oldData => {
      const newData = { ...oldData };
      if (!newData[mes]) newData[mes] = {};
      if (!newData[mes][categoria]) newData[mes][categoria] = { sugerido: 0, tipo: 'Egreso' };
      newData[mes][categoria][campo] = Number(valor);
      return newData;
    });
  };

  const totalIngresos = React.useMemo(() => {
    return Object.values(presupuestoDataMes).reduce((total, cats) =>
      total + Object.values(cats).reduce((acc, c) => c.tipo === 'Ingreso' ? acc + (c.sugerido || 0) : acc, 0), 0);
  }, [presupuestoDataMes]);

  const totalEgresos = React.useMemo(() => {
    return Object.values(presupuestoDataMes).reduce((total, cats) =>
      total + Object.values(cats).reduce((acc, c) => c.tipo === 'Egreso' ? acc + (c.sugerido || 0) : acc, 0), 0);
  }, [presupuestoDataMes]);

  const handleGuardar = async () => {
    if (!nombre || !fechaDesde || !fechaHasta) {
      alert("Completa todos los campos obligatorios");
      return;
    }
    if (categorias.some(c => !c.categoria)) {
      alert("Todas las categorías deben tener nombre");
      return;
    }

    const detalleMensual = meses.map(mes => {
      const cats = presupuestoDataMes[mes] || {};
      const ingresoEst = Object.values(cats).reduce((acc, c) => c.tipo === 'Ingreso' ? acc + (c.sugerido || 0) : acc, 0);
      const egresoEst = Object.values(cats).reduce((acc, c) => c.tipo === 'Egreso' ? acc + (c.sugerido || 0) : acc, 0);

      const categoriasPayload = Object.entries(cats).map(([categoria, val]) => ({
        categoria,
        tipo: val.tipo.toUpperCase(),
        montoEstimado: val.sugerido,
      }));

      return { mes, ingresoEst, egresoEst, categorias: categoriasPayload };
    });

    const payload = {
      nombre,
      desde: fechaDesde,
      hasta: fechaHasta,
      categoriasJson: JSON.stringify(categorias),
      detalleMensual
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos`,
        payload
      );
      navigate(`/presupuestos/${res.data.id}`);
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
        <TextField label="Nombre del presupuesto" value={nombre} onChange={e => setNombre(e.target.value)} fullWidth variant="outlined" />
        <TextField label="Desde" type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Hasta" type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
      </Box>

      <Box mt={2} mb={1}>
        <Button variant="outlined" onClick={handleAgregarCategoria}>+ Nueva categoría</Button>
      </Box>

      <Paper sx={{ mt: 1, width: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            {/* Primera fila: nombres de categorías */}
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Mes</TableCell>
              {categorias.map((cat, idx) => (
                <TableCell key={idx} sx={tableCellStyle}>
                  <TextField
                    value={cat.categoria}
                    onChange={e => handleCambioCategoria(idx, 'categoria', e.target.value)}
                    variant="standard"
                    size="small"
                    placeholder="Nombre"
                    sx={{ minWidth: 80, maxWidth: 100 }}
                  />
                  <IconButton onClick={() => handleEliminarCategoria(idx)} size="small" sx={{ p: 0, ml: 0.5 }}>
                    <DeleteIcon color="error" fontSize="small" />
                  </IconButton>
                </TableCell>
              ))}
            </TableRow>
            {/* Segunda fila: tipo */}
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}></TableCell>
              {categorias.map((cat, idx) => (
                <TableCell key={idx} sx={tableCellStyle}>
                  <TextField
                    select
                    value={cat.tipo}
                    onChange={e => handleCambioCategoria(idx, 'tipo', e.target.value)}
                    variant="standard"
                    size="small"
                    sx={{ width: 80 }}
                  >
                    <MenuItem value="Ingreso">Ingreso</MenuItem>
                    <MenuItem value="Egreso">Egreso</MenuItem>
                  </TextField>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {meses.map(mes => (
              <TableRow key={mes} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>{mes}</TableCell>
                {categorias.map((cat, idx) => {
                  const valores = presupuestoDataMes[mes]?.[cat.categoria] || { sugerido: 0 };
                  return (
                    <TableCell key={idx} sx={tableCellStyle}>
                      <TextField
                        type="number"
                        variant="standard"
                        size="small"
                        value={valores.sugerido}
                        onChange={e => handleCambioMonto(mes, cat.categoria, 'sugerido', e.target.value)}
                        inputProps={{ min: 0, style: { padding: '4px 6px', textAlign: 'right' } }}
                        sx={{ maxWidth: 80 }}
                      />
                    </TableCell>
                  );
                })}
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
