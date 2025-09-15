import * as React from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Grid, TextField, MenuItem, IconButton,
  Stepper, Step, StepLabel, Alert, Divider, Tooltip, Chip, Stack, FormControlLabel, Switch
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import axios from 'axios';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
  maxWidth: 110,
  minWidth: 90,
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

// Helper ARS
const fmtARS = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(n || 0));

/**
 * Modo de regla por categoría:
 *  - FIJO: mismo importe todos los meses entre rango
 *  - AJUSTE: importe inicial + % mensual compuesto
 *  - UNICO: un solo mes
 *  - CUOTAS: monto total dividido en N cuotas, con interés opcional mensual
 */
const REGLAS = [
  { value: 'FIJO', label: 'Fijo mensual' },
  { value: 'AJUSTE', label: 'Ajuste % mensual' },
  { value: 'UNICO', label: 'Único (1 mes)' },
  { value: 'CUOTAS', label: 'En cuotas' },
];

export default function PresupuestoNuevo() {
  const navigate = useNavigate();

  // Wizard
  const [step, setStep] = React.useState(0);

  // Paso 1
  const [nombre, setNombre] = React.useState('');
  const [fechaDesde, setFechaDesde] = React.useState('');
  const [fechaHasta, setFechaHasta] = React.useState('');

  // Paso 2: categorías + reglas
  const [categorias, setCategorias] = React.useState([
    { categoria: 'Alquiler', tipo: 'Egreso', regla: { modo: 'FIJO', importe: 0 } },
    { categoria: 'Sueldos', tipo: 'Egreso', regla: { modo: 'AJUSTE', importe: 0, porcentaje: 0 } },
    { categoria: 'Ventas esperadas', tipo: 'Ingreso', regla: { modo: 'FIJO', importe: 0 } },
  ]);

  // Paso 3: tabla generada + editable
  const [presupuestoDataMes, setPresupuestoDataMes] = React.useState({});
  const [errors, setErrors] = React.useState(null);
  const [lockNegative, setLockNegative] = React.useState(true); // bloquear negativos opcional

  const meses = React.useMemo(() => {
    if (!fechaDesde || !fechaHasta) return [];
    return generarMesesEntre(fechaDesde.slice(0, 7), fechaHasta.slice(0, 7));
  }, [fechaDesde, fechaHasta]);

  // Mantener coherencia de estructura al cambiar meses/categorías
  React.useEffect(() => {
    if (meses.length === 0) {
      setPresupuestoDataMes({});
      return;
    }
    setPresupuestoDataMes(oldData => {
      const newData = { ...oldData };
      // Crear meses faltantes
      meses.forEach(mes => {
        if (!newData[mes]) newData[mes] = {};
        categorias.forEach(cat => {
          if (!newData[mes][cat.categoria]) {
            newData[mes][cat.categoria] = { sugerido: 0, tipo: cat.tipo };
          } else {
            newData[mes][cat.categoria].tipo = cat.tipo;
          }
        });
        // Remover categorías eliminadas
        Object.keys(newData[mes]).forEach(catKey => {
          if (!categorias.find(c => c.categoria === catKey)) {
            delete newData[mes][catKey];
          }
        });
      });
      // Remover meses fuera de rango
      Object.keys(newData).forEach(mesKey => {
        if (!meses.includes(mesKey)) delete newData[mesKey];
      });
      return newData;
    });
  }, [meses, categorias]);

  // Validaciones básicas
  const validarPaso1 = () => {
    if (!nombre) return 'Ingresá un nombre para el presupuesto.';
    if (!fechaDesde || !fechaHasta) return 'Completá las fechas.';
    if (fechaDesde > fechaHasta) return 'La fecha "Desde" no puede ser posterior a "Hasta".';
    return null;
  };
  const validarPaso2 = () => {
    if (categorias.length === 0) return 'Agregá al menos una categoría.';
    if (categorias.some(c => !c.categoria?.trim())) return 'Todas las categorías deben tener nombre.';
    return null;
  };

  // Paso entre secciones
  const next = () => {
    const v = step === 0 ? validarPaso1() : step === 1 ? validarPaso2() : null;
    if (v) {
      setErrors(v);
      return;
    }
    setErrors(null);
    setStep(s => Math.min(2, s + 1));
  };
  const back = () => {
    setErrors(null);
    setStep(s => Math.max(0, s - 1));
  };

  // Acciones categorías
  const handleAgregarCategoria = () => {
    setCategorias([...categorias, { categoria: '', tipo: 'Egreso', regla: { modo: 'FIJO', importe: 0 } }]);
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
  const handleDuplicarCategoria = (index) => {
    const c = categorias[index];
    const copia = {
      categoria: `${c.categoria} copia`,
      tipo: c.tipo,
      regla: JSON.parse(JSON.stringify(c.regla)),
    };
    setCategorias([...categorias, copia]);
  };

  const handleCambioCategoriaCampo = (index, campo, valor) => {
    const newCats = [...categorias];
    const oldNombre = newCats[index].categoria;
    newCats[index][campo] = valor;

    // Reflejar cambios en la tabla
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

  const handleCambioRegla = (index, campo, valor) => {
    const newCats = [...categorias];
    newCats[index].regla = { ...(newCats[index].regla || { modo: 'FIJO' }), [campo]: valor };
    // Coherencia por modo
    if (campo === 'modo') {
      if (valor === 'FIJO') newCats[index].regla = { modo: 'FIJO', importe: 0 };
      if (valor === 'AJUSTE') newCats[index].regla = { modo: 'AJUSTE', importe: 0, porcentaje: 0 };
      if (valor === 'UNICO') newCats[index].regla = { modo: 'UNICO', importe: 0, mesUnico: '' };
      if (valor === 'CUOTAS') newCats[index].regla = { modo: 'CUOTAS', montoTotal: 0, cuotas: 2, interesMensual: 0, comienza: meses[0] || '' };
    }
    setCategorias(newCats);
  };

  // Aplicar reglas a la grilla
  const aplicarReglas = () => {
    if (meses.length === 0) {
      setErrors('Definí el rango de fechas primero.');
      return;
    }
    setErrors(null);

    setPresupuestoDataMes(old => {
      const nuevo = { ...old };
      categorias.forEach(cat => {
        const { tipo, categoria, regla } = cat;
        const modo = (regla?.modo || 'FIJO').toUpperCase();

        if (modo === 'FIJO') {
          const importe = Number(regla?.importe || 0);
          meses.forEach(m => {
            if (!nuevo[m]) nuevo[m] = {};
            if (!nuevo[m][categoria]) nuevo[m][categoria] = { sugerido: 0, tipo };
            nuevo[m][categoria].sugerido = importe;
            nuevo[m][categoria].tipo = tipo;
          });
        }

        if (modo === 'AJUSTE') {
          const base = Number(regla?.importe || 0);
          const p = Number(regla?.porcentaje || 0) / 100;
          meses.forEach((m, idx) => {
            const valor = Math.round(base * Math.pow(1 + p, idx));
            if (!nuevo[m]) nuevo[m] = {};
            if (!nuevo[m][categoria]) nuevo[m][categoria] = { sugerido: 0, tipo };
            nuevo[m][categoria].sugerido = valor;
            nuevo[m][categoria].tipo = tipo;
          });
        }

        if (modo === 'UNICO') {
          const mesU = regla?.mesUnico;
          const importe = Number(regla?.importe || 0);
          meses.forEach(m => {
            if (!nuevo[m]) nuevo[m] = {};
            if (!nuevo[m][categoria]) nuevo[m][categoria] = { sugerido: 0, tipo };
            nuevo[m][categoria].sugerido = (m === mesU ? importe : 0);
            nuevo[m][categoria].tipo = tipo;
          });
        }

        if (modo === 'CUOTAS') {
          const total = Number(regla?.montoTotal || 0);
          const n = Math.max(1, Number(regla?.cuotas || 1));
          const r = Number(regla?.interesMensual || 0) / 100;
          const inicio = regla?.comienza || meses[0];

          // Si hay interés, cuota de sistema francés: A = P * [ r(1+r)^n / ((1+r)^n - 1) ]
          let cuota = 0;
          if (r > 0) {
            const rn = Math.pow(1 + r, n);
            cuota = Math.round(total * ((r * rn) / (rn - 1)));
          } else {
            cuota = Math.round(total / n);
          }

          // Distribuir a partir de "inicio"
          const startIdx = meses.findIndex(m => m === inicio);
          meses.forEach((m, idx) => {
            if (!nuevo[m]) nuevo[m] = {};
            if (!nuevo[m][categoria]) nuevo[m][categoria] = { sugerido: 0, tipo };
            const i = idx - startIdx;
            nuevo[m][categoria].sugerido = (i >= 0 && i < n) ? cuota : 0;
            nuevo[m][categoria].tipo = tipo;
          });
        }
      });
      return nuevo;
    });
  };

  // Edición manual de la grilla
  const handleCambioMonto = (mes, categoria, campo, valor) => {
    const num = Number(valor);
    if (lockNegative && num < 0) return;
    setPresupuestoDataMes(oldData => {
      const newData = { ...oldData };
      if (!newData[mes]) newData[mes] = {};
      if (!newData[mes][categoria]) newData[mes][categoria] = { sugerido: 0, tipo: 'Egreso' };
      newData[mes][categoria][campo] = num;
      return newData;
    });
  };

  const totalIngresos = React.useMemo(() => {
    return Object.values(presupuestoDataMes).reduce((total, cats) =>
      total + Object.values(cats).reduce((acc, c) => (c.tipo === 'Ingreso' ? acc + (c.sugerido || 0) : acc), 0), 0);
  }, [presupuestoDataMes]);

  const totalEgresos = React.useMemo(() => {
    return Object.values(presupuestoDataMes).reduce((total, cats) =>
      total + Object.values(cats).reduce((acc, c) => (c.tipo === 'Egreso' ? acc + (c.sugerido || 0) : acc), 0), 0);
  }, [presupuestoDataMes]);

  // Guardar (CAMBIO MÍNIMO: enviar payload nuevo con `plantilla`)
  const handleGuardar = async () => {
    // Validaciones finales
    const v1 = validarPaso1(); if (v1) return setErrors(v1);
    const v2 = validarPaso2(); if (v2) return setErrors(v2);

    try {
      // Normalizo fechas a YYYY-MM-DD (ya vienen así desde el input type="date")
      const dDesde = fechaDesde;
      const dHasta = fechaHasta;

      // Tomo como base el PRIMER mes para cada categoría (si hay grilla calculada),
      // y si no existe, uso el importe de la regla (FIJO/UNICO/etc.).
      const firstMonth = meses[0];
      const plantilla = categorias.map(c => {
        const catName = (c.categoria || '').trim();
        const tipo = (c.tipo || '').toString().toUpperCase(); // "INGRESO"/"EGRESO"

        const sugeridoDeGrilla = firstMonth
          ? presupuestoDataMes?.[firstMonth]?.[catName]?.sugerido
          : undefined;

        const fallbackDeRegla = c?.regla?.importe ?? c?.regla?.montoTotal ?? 0;

        return {
          categoria: catName,
          tipo,
          montoEstimado: Number(
            sugeridoDeGrilla != null ? sugeridoDeGrilla : fallbackDeRegla || 0
          ),
          montoReal: null
        };
      });

      const payload = {
        nombre,
        desde: dDesde,
        hasta: dHasta,
        autogenerarCeros: false,
        plantilla
      };

      const res = await axios.post(
        `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos`,
        payload
      );

      const nombreFuente = res?.data?.nombre || nombre;
      const slug = encodeURIComponent(
        nombreFuente.trim().toLowerCase().replace(/\s+/g, '-')
      );
      navigate(`/presupuestos/${slug}`);
    } catch (error) {
      console.error("Error guardando presupuesto", error);
      setErrors("No se pudo guardar el presupuesto. Probá de nuevo.");
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>Nuevo Presupuesto</Typography>
      <Typography variant="subtitle1" gutterBottom>Planificá tus ingresos y egresos esperados</Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        <Step><StepLabel>Datos básicos</StepLabel></Step>
        <Step><StepLabel>Categorías & Reglas</StepLabel></Step>
        <Step><StepLabel>Vista previa & Guardar</StepLabel></Step>
      </Stepper>

      {errors && <Alert severity="warning" sx={{ mb: 2 }}>{errors}</Alert>}

      {/* PASO 1: Datos básicos */}
      {step === 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField label="Nombre del presupuesto" value={nombre} onChange={e => setNombre(e.target.value)} fullWidth variant="outlined" />
            <TextField label="Desde" type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Hasta" type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Box>

          <Divider sx={{ my: 2 }} />
          <Box display="flex" gap={2}>
            <Button variant="contained" onClick={next}>Continuar</Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar</Button>
          </Box>
        </>
      )}

      {/* PASO 2: Categorías + reglas */}
      {step === 1 && (
        <>
          <Box mt={1} mb={2} display="flex" gap={1} alignItems="center">
            <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAgregarCategoria}>Nueva categoría</Button>
            <Tooltip title="Bloquear montos negativos">
              <FormControlLabel
                control={<Switch size="small" checked={lockNegative} onChange={(_, v) => setLockNegative(v)} />}
                label="Bloquear negativos"
              />
            </Tooltip>
          </Box>

          <Paper sx={{ p: 2, mb: 2, overflowX: 'auto' }}>
            <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow sx={tableRowStyle}>
                  <TableCell sx={tableCellStyle}>Categoría</TableCell>
                  <TableCell sx={tableCellStyle}>Tipo</TableCell>
                  <TableCell sx={tableCellStyle}>Regla</TableCell>
                  <TableCell sx={tableCellStyle}>Parámetros</TableCell>
                  <TableCell sx={tableCellStyle}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categorias.map((cat, idx) => {
                  const r = cat.regla || { modo: 'FIJO' };
                  return (
                    <TableRow key={idx} sx={tableRowStyle}>
                      <TableCell sx={tableCellStyle}>
                        <TextField
                          value={cat.categoria}
                          onChange={e => handleCambioCategoriaCampo(idx, 'categoria', e.target.value)}
                          variant="standard" size="small" placeholder="Nombre"
                          sx={{ minWidth: 140, maxWidth: 220 }}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <TextField
                          select value={cat.tipo}
                          onChange={e => handleCambioCategoriaCampo(idx, 'tipo', e.target.value)}
                          variant="standard" size="small" sx={{ minWidth: 100 }}
                        >
                          <MenuItem value="Ingreso">Ingreso</MenuItem>
                          <MenuItem value="Egreso">Egreso</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <TextField
                          select value={r.modo}
                          onChange={e => handleCambioRegla(idx, 'modo', e.target.value)}
                          variant="standard" size="small" sx={{ minWidth: 160 }}
                        >
                          {REGLAS.map(op => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                        </TextField>
                      </TableCell>

                      {/* Parámetros por modo */}
                      <TableCell sx={{ ...tableCellStyle, textAlign: 'left' }}>
                        {r.modo === 'FIJO' && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              type="number" label="Importe"
                              value={r.importe ?? 0}
                              onChange={e => handleCambioRegla(idx, 'importe', Number(e.target.value))}
                              size="small" variant="standard" sx={{ maxWidth: 120 }}
                              inputProps={{ min: 0 }}
                            />
                            <Chip label="Mismo importe todos los meses" size="small" />
                          </Stack>
                        )}
                        {r.modo === 'AJUSTE' && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              type="number" label="Importe inicial"
                              value={r.importe ?? 0}
                              onChange={e => handleCambioRegla(idx, 'importe', Number(e.target.value))}
                              size="small" variant="standard" sx={{ maxWidth: 140 }}
                              inputProps={{ min: 0 }}
                            />
                            <TextField
                              type="number" label="% mensual"
                              value={r.porcentaje ?? 0}
                              onChange={e => handleCambioRegla(idx, 'porcentaje', Number(e.target.value))}
                              size="small" variant="standard" sx={{ maxWidth: 120 }}
                              inputProps={{ step: 0.1 }}
                            />
                            <Chip label="Crecimiento compuesto" size="small" color="info" />
                          </Stack>
                        )}
                        {r.modo === 'UNICO' && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              select label="Mes" value={r.mesUnico || ''} onChange={e => handleCambioRegla(idx, 'mesUnico', e.target.value)}
                              size="small" variant="standard" sx={{ minWidth: 120 }}
                            >
                              {meses.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </TextField>
                            <TextField
                              type="number" label="Importe"
                              value={r.importe ?? 0}
                              onChange={e => handleCambioRegla(idx, 'importe', Number(e.target.value))}
                              size="small" variant="standard" sx={{ maxWidth: 120 }}
                              inputProps={{ min: 0 }}
                            />
                            <Chip label="Solo un mes" size="small" />
                          </Stack>
                        )}
                        {r.modo === 'CUOTAS' && (
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <TextField
                              type="number" label="Monto total"
                              value={r.montoTotal ?? 0}
                              onChange={e => handleCambioRegla(idx, 'montoTotal', Number(e.target.value))}
                              size="small" variant="standard" sx={{ maxWidth: 140 }}
                              inputProps={{ min: 0 }}
                            />
                            <TextField
                              type="number" label="Cuotas"
                              value={r.cuotas ?? 2}
                              onChange={e => handleCambioRegla(idx, 'cuotas', Number(e.target.value))}
                              size="small" variant="standard" sx={{ maxWidth: 100 }}
                              inputProps={{ min: 1 }}
                            />
                            <TextField
                              type="number" label="% interés mensual"
                              value={r.interesMensual ?? 0}
                              onChange={e => handleCambioRegla(idx, 'interesMensual', Number(e.target.value))}
                              size="small" variant="standard" sx={{ maxWidth: 150 }}
                              inputProps={{ step: 0.1 }}
                            />
                            <TextField
                              select label="Comienza" value={r.comienza || (meses[0] || '')}
                              onChange={e => handleCambioRegla(idx, 'comienza', e.target.value)}
                              size="small" variant="standard" sx={{ minWidth: 130 }}
                            >
                              {meses.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </TextField>
                            <Chip label="Sistema francés si hay interés" size="small" color="warning" />
                          </Stack>
                        )}
                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Duplicar categoría">
                            <IconButton onClick={() => handleDuplicarCategoria(idx)} size="small"><ContentCopyIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton onClick={() => handleEliminarCategoria(idx)} size="small"><DeleteIcon color="error" fontSize="small" /></IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          <Box display="flex" gap={1} mb={2}>
            <Button startIcon={<CalculateIcon />} variant="contained" color="primary" onClick={aplicarReglas}>
              Aplicar reglas a los meses
            </Button>
            <Button variant="outlined" onClick={next}>Continuar</Button>
            <Button variant="text" onClick={back}>Volver</Button>
          </Box>
        </>
      )}

      {/* PASO 3: Vista previa/edición (tu grilla + columnas de totales por mes) */}
      {step === 2 && (
        <>
          <Box mb={1} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="subtitle1">Revisá y ajustá los montos estimados por mes y categoría</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`Ingresos: ${fmtARS(totalIngresos)}`} color="success" />
              <Chip label={`Egresos: ${fmtARS(totalEgresos)}`} color="error" />
              <Chip label={`Resultado: ${fmtARS(totalIngresos - totalEgresos)}`} color={(totalIngresos - totalEgresos) >= 0 ? 'info' : 'warning'} />
            </Stack>
          </Box>

          <Paper sx={{ mt: 1, width: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                {/* Primera fila: nombres de categorías */}
                <TableRow sx={tableRowStyle}>
                  <TableCell sx={tableCellStyle}>Mes</TableCell>
                  {categorias.map((cat, idx) => (
                    <TableCell key={idx} sx={tableCellStyle}>
                      <Stack alignItems="center" spacing={0.5}>
                        <Typography variant="body2" noWrap title={cat.categoria}>{cat.categoria}</Typography>
                        <Chip size="small" label={cat.tipo} color={cat.tipo === 'Ingreso' ? 'success' : 'default'} />
                      </Stack>
                    </TableCell>
                  ))}
                  {/* NUEVAS COLUMNAS DE TOTALES POR MES */}
                  <TableCell sx={{ ...tableCellStyle, minWidth: 120 }}>Ingresos (mes)</TableCell>
                  <TableCell sx={{ ...tableCellStyle, minWidth: 120 }}>Egresos (mes)</TableCell>
                  <TableCell sx={{ ...tableCellStyle, minWidth: 130 }}>Resultado (mes)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meses.map(mes => {
                  // calcular ingresos/egresos del mes
                  const cats = presupuestoDataMes[mes] || {};
                  const ingresoMes = Object.values(cats).reduce((acc, c) => (c.tipo === 'Ingreso' ? acc + (c.sugerido || 0) : acc), 0);
                  const egresoMes  = Object.values(cats).reduce((acc, c) => (c.tipo === 'Egreso' ? acc + (c.sugerido || 0) : acc), 0);
                  const resultadoMes = ingresoMes - egresoMes;

                  return (
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
                              value={Number(valores.sugerido || 0)}
                              onChange={e => handleCambioMonto(mes, cat.categoria, 'sugerido', e.target.value)}
                              inputProps={{ min: 0, style: { padding: '4px 6px', textAlign: 'right' } }}
                              sx={{ maxWidth: 90 }}
                            />
                          </TableCell>
                        );
                      })}
                      {/* CELDAS DE TOTALES POR MES */}
                      <TableCell sx={{ ...tableCellStyle, fontWeight: 700, color: '#66bb6a' }}>
                        {fmtARS(ingresoMes)}
                      </TableCell>
                      <TableCell sx={{ ...tableCellStyle, fontWeight: 700, color: '#ef5350' }}>
                        {fmtARS(egresoMes)}
                      </TableCell>
                      <TableCell sx={{ ...tableCellStyle, fontWeight: 700, color: resultadoMes >= 0 ? '#29b6f6' : '#ffa726' }}>
                        {fmtARS(resultadoMes)}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Fila de totales por categoría en el período (se mantiene igual) */}
                <TableRow>
                  <TableCell sx={{ ...tableCellStyle, fontWeight: 700 }}>Totales mes</TableCell>
                  {categorias.map((cat, idx) => {
                    const totalCat = meses.reduce((acc, m) => {
                      const v = presupuestoDataMes[m]?.[cat.categoria]?.sugerido || 0;
                      return acc + Number(v || 0);
                    }, 0);
                    return (
                      <TableCell key={idx} sx={{ ...tableCellStyle, fontWeight: 700 }}>
                        {fmtARS(totalCat)}
                      </TableCell>
                    );
                  })}
                  {/* Columnas de totales por mes no tienen agregados en esta fila */}
                  <TableCell sx={{ ...tableCellStyle }} />
                  <TableCell sx={{ ...tableCellStyle }} />
                  <TableCell sx={{ ...tableCellStyle }} />
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

          <Box mt={3} display="flex" gap={2} flexWrap="wrap">
            <Button variant="contained" color="primary" onClick={handleGuardar}>Guardar presupuesto</Button>
            <Button variant="outlined" onClick={back}>Volver</Button>
            <Button variant="text" onClick={() => navigate(-1)}>Cancelar</Button>
          </Box>
        </>
      )}
    </Box>
  );
}
