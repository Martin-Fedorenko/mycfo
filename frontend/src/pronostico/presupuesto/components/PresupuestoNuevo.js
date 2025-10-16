import * as React from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Grid, TextField, MenuItem, IconButton,
  Stepper, Step, StepLabel, Alert, AlertTitle, Divider, Tooltip, Chip, Stack, FormControlLabel, Switch, CircularProgress
} from '@mui/material';
import MonthRangeSelect from './MonthRangeSelect';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import http from '../../../api/http';
import { formatCurrency, formatCurrencyInput, parseCurrency } from '../../../utils/currency';

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

function startOfMonthUTC(year, monthZeroBased) {
  return new Date(Date.UTC(year, monthZeroBased, 1));
}

function addMonthsUTC(date, count) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

function formatUTCToYearMonth(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

const SHORT_MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatMonthLabel(ym) {
  if (!ym) return '';
  const [rawYear, rawMonth] = ym.split('-');
  const year = rawYear ?? '';
  const monthIndex = Number(rawMonth) - 1;
  if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return ym;
  }
  const label = SHORT_MONTH_LABELS[monthIndex] ?? rawMonth;
  return `${label} ${year}`.trim();
}

// Generar lista de meses entre dos fechas (YYYY-MM)
function generarMesesEntre(desde, hasta) {
  const meses = [];
  if (!desde || !hasta) return meses;

  const [desdeYear, desdeMonth] = desde.split('-').map(Number);
  const [hastaYear, hastaMonth] = hasta.split('-').map(Number);
  if (
    !Number.isFinite(desdeYear) ||
    !Number.isFinite(desdeMonth) ||
    !Number.isFinite(hastaYear) ||
    !Number.isFinite(hastaMonth)
  ) {
    return meses;
  }

  let cursor = startOfMonthUTC(desdeYear, desdeMonth - 1);
  const end = startOfMonthUTC(hastaYear, hastaMonth - 1);

  while (cursor.getTime() <= end.getTime()) {
    meses.push(formatUTCToYearMonth(cursor));
    cursor = addMonthsUTC(cursor, 1);
  }
  return meses;
}

const roundTo2 = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

// Helper ARS
const fmtARS = (n) => formatCurrency(n);

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
  const [creating, setCreating] = React.useState(false);

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
    return generarMesesEntre(fechaDesde, fechaHasta);
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
    if (!fechaDesde || !fechaHasta) return 'Completá los meses.';
    if (fechaDesde > fechaHasta) return 'El mes "Desde" no puede ser posterior a "Hasta".';
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
      setErrors('Definí el rango de meses primero.');
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
            const valor = roundTo2(base * Math.pow(1 + p, idx));
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
          // helper
          const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

          // reemplazar el bloque por:
          if (r > 0) {
            const rn = Math.pow(1 + r, n);
            cuota = round2(total * ((r * rn) / (rn - 1)));
          } else {
            cuota = round2(total / n);
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
    const num = valor === '' ? 0 : Number(valor);
    if (Number.isNaN(num)) return;
    if (lockNegative && num < 0) return;
    setPresupuestoDataMes(oldData => {
      const newData = { ...oldData };
      if (!newData[mes]) newData[mes] = {};
      if (!newData[mes][categoria]) newData[mes][categoria] = { sugerido: 0, tipo: 'Egreso' };
      newData[mes][categoria][campo] = num;
      return newData;
    });
  };

  const { monthTotals, negativeMonths, totalIngresos, totalEgresos } = React.useMemo(() => {
    const totals = {};
    const negatives = [];
    let ingresosAcumulados = 0;
    let egresosAcumulados = 0;

    meses.forEach((mes) => {
      const cats = presupuestoDataMes[mes] || {};
      let ingresosMes = 0;
      let egresosMes = 0;

      Object.values(cats).forEach((cat) => {
        const valor = Number(cat?.sugerido ?? 0);
        if (!Number.isFinite(valor)) {
          return;
        }
        const tipo = (cat?.tipo || '').toString().toUpperCase();
        if (tipo === 'INGRESO') {
          ingresosMes += valor;
        } else if (tipo === 'EGRESO') {
          egresosMes += valor;
        }
      });

      const resultado = ingresosMes - egresosMes;
      totals[mes] = { ingresos: ingresosMes, egresos: egresosMes, resultado };
      ingresosAcumulados += ingresosMes;
      egresosAcumulados += egresosMes;
      if (resultado < 0) {
        negatives.push({ mes, resultado });
      }
    });

    return {
      monthTotals: totals,
      negativeMonths: negatives,
      totalIngresos: ingresosAcumulados,
      totalEgresos: egresosAcumulados
    };
  }, [meses, presupuestoDataMes]);

  const resultadoTotal = React.useMemo(() => totalIngresos - totalEgresos, [totalIngresos, totalEgresos]);
  const hasLosses = negativeMonths.length > 0;

  const lossSummaryText = React.useMemo(() => {
    if (!negativeMonths.length) {
      return '';
    }
    const labels = negativeMonths
      .slice(0, 6)
      .map((item) => formatMonthLabel(item.mes));
    let summary = labels.join(', ');
    if (negativeMonths.length > 6) {
      summary += ` y ${negativeMonths.length - 6} más`;
    }
    return summary;
  }, [negativeMonths]);


  // Guardar (CAMBIO MÍNIMO: enviar payload nuevo con `plantilla`)
  const handleGuardar = async () => {
    if (creating) {
      return;
    }
    // Validaciones finales
    const v1 = validarPaso1(); if (v1) return setErrors(v1);
    const v2 = validarPaso2(); if (v2) return setErrors(v2);

    setCreating(true);
    try {
      // Normalizo meses a YYYY-MM (ya vienen así desde el input type="month")
      const dDesde = fechaDesde;
      const dHasta = fechaHasta;

      // Tomo como base el PRIMER mes para cada categoría (si hay grilla calculada),
      // y si no existe, uso el importe de la regla (FIJO/UNICO/etc.).
      const firstMonth = meses[0];
      const plantilla = categorias.map((c) => {
        const catName = (c.categoria || '').trim();
        const tipo = (c.tipo || '').toString().toUpperCase(); // "INGRESO"/"EGRESO"

        const fallbackDeRegla = c?.regla?.importe ?? c?.regla?.montoTotal ?? 0;

        const detalles = meses.map((mes) => {
          const registroMes = presupuestoDataMes?.[mes]?.[catName];
          const sugerido = registroMes?.sugerido ?? 0;
          const real = registroMes?.montoReal ?? registroMes?.real ?? null;
          const estimadoRedondeado = roundTo2(sugerido);
          const realRedondeado = real == null ? null : roundTo2(real);
          return {
            mes,
            montoEstimado: estimadoRedondeado,
            montoReal: realRedondeado,
          };
        });

        const montoBase = firstMonth
          ? presupuestoDataMes?.[firstMonth]?.[catName]?.sugerido
          : undefined;

        const montoEstimadoPrincipal =
          montoBase != null ? roundTo2(montoBase) : roundTo2(fallbackDeRegla || 0);

        return {
          categoria: catName,
          tipo,
          montoEstimado: montoEstimadoPrincipal,
          montoReal: null,
          meses: detalles,
        };
      });

      const payload = {
        nombre,
        desde: dDesde,
        hasta: dHasta,
        autogenerarCeros: false,
        plantilla
      };

      const res = await http.post(
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
      if (error?.response?.status === 409) {
        setErrors("Ya existe un presupuesto con el mismo nombre y período.");
      } else {
        setErrors("No se pudo guardar el presupuesto. Probá de nuevo.");
      }
    } finally {
      setCreating(false);
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
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: 'column' }}>
            <TextField 
              label="Nombre del presupuesto" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              fullWidth 
              variant="outlined" 
            />
            <Box sx={{ maxWidth: 300 }}>
              <MonthRangeSelect
                value={{
                  from: fechaDesde,
                  to: fechaHasta
                }}
                onChange={(range) => {
                  setFechaDesde(range.from);
                  setFechaHasta(range.to);
                }}
              />
            </Box>
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
            <Table size="small" sx={{ tableLayout: 'auto', width: '100%', minWidth: 720 }}>
              <TableHead>
                <TableRow sx={tableRowStyle}>
                  <TableCell sx={tableCellStyle}>Categoría</TableCell>
                  <TableCell sx={tableCellStyle}>Tipo</TableCell>
                  <TableCell sx={tableCellStyle}>Regla</TableCell>
                  <TableCell sx={tableCellStyle}>Parámetros</TableCell>
                  <TableCell sx={{ ...tableCellStyle, width: 96, minWidth: 96, maxWidth: 96 }}>Acciones</TableCell>
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
                      <TableCell
                        sx={{
                          ...tableCellStyle,
                          textAlign: 'left',
                          whiteSpace: 'normal',
                          overflow: 'visible',
                          textOverflow: 'unset',
                          minWidth: 220,
                          maxWidth: 420,
                        }}
                      >
                        {r.modo === 'FIJO' && (
                          <Stack spacing={0.75} alignItems="flex-start">
                            <TextField
                              type="text"
                              label="Importe"
                              placeholder="$ 0"
                              value={
                                r.importe === 0 || r.importe === '0' || r.importe === ''
                                  ? ''
                                  : formatCurrencyInput(r.importe)
                              }
                              onChange={(e) => {
                                const parsed = parseCurrency(e.target.value, { returnEmpty: true });
                                handleCambioRegla(idx, 'importe', parsed === '' ? '' : parsed);
                              }}
                              size="small"
                              variant="standard"
                              InputLabelProps={{ shrink: true }}
                              sx={{ maxWidth: 180 }}
                              inputProps={{ inputMode: 'numeric' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Mismo importe para cada mes del rango
                            </Typography>
                          </Stack>
                        )}
                        {r.modo === 'AJUSTE' && (
                          <Stack spacing={0.75} alignItems="flex-start">
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ width: '100%' }}>
                              <TextField
                                type="text"
                                label="Importe inicial"
                                placeholder="$ 0"
                                value={
                                  r.importe === 0 || r.importe === '0' || r.importe === ''
                                    ? ''
                                    : formatCurrencyInput(r.importe)
                                }
                                onChange={(e) => {
                                  const parsed = parseCurrency(e.target.value, { returnEmpty: true });
                                  handleCambioRegla(idx, 'importe', parsed === '' ? '' : parsed);
                                }}
                                size="small"
                                variant="standard"
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: '1 1 140px', minWidth: 140 }}
                                inputProps={{ inputMode: 'numeric' }}
                              />
                              <TextField
                                type="number"
                                label="% mensual"
                                placeholder="% 0"
                                value={
                                  r.porcentaje === 0 || r.porcentaje === '0' || r.porcentaje === ''
                                    ? ''
                                    : r.porcentaje
                                }
                                onChange={(e) => handleCambioRegla(idx, 'porcentaje', e.target.value)}
                                size="small"
                                variant="standard"
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: '1 1 120px', minWidth: 120 }}
                                inputProps={{ step: 0.1, inputMode: 'decimal' }}
                              />
                            </Stack>
                            <Typography variant="caption" color="info.main">
                              Crecimiento compuesto mes a mes
                            </Typography>
                          </Stack>
                        )}
                        {r.modo === 'UNICO' && (
                          <Stack spacing={0.75} alignItems="flex-start">
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ width: '100%' }}>
                              <TextField
                                select
                                label="Mes"
                                value={r.mesUnico || ''}
                                onChange={e => handleCambioRegla(idx, 'mesUnico', e.target.value)}
                                size="small"
                                variant="standard"
                                sx={{ flex: '1 1 140px', minWidth: 140 }}
                              >
                                {meses.map(m => (
                                  <MenuItem key={m} value={m}>
                                    {m}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <TextField
                                type="text"
                                label="Importe"
                                placeholder="$ 0"
                                value={
                                  r.importe === 0 || r.importe === '0' || r.importe === ''
                                    ? ''
                                    : formatCurrencyInput(r.importe)
                                }
                                onChange={(e) => {
                                  const parsed = parseCurrency(e.target.value, { returnEmpty: true });
                                  handleCambioRegla(idx, 'importe', parsed === '' ? '' : parsed);
                                }}
                                size="small"
                                variant="standard"
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: '1 1 140px', minWidth: 140 }}
                                inputProps={{ inputMode: 'numeric' }}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Se aplica solo al mes seleccionado
                            </Typography>
                          </Stack>
                        )}
                        {r.modo === 'CUOTAS' && (
                          <Stack spacing={0.75} alignItems="flex-start">
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ width: '100%' }}>
                              <TextField
                                type="text"
                                label="Monto total"
                                placeholder="$ 0"
                                value={
                                  r.montoTotal === 0 || r.montoTotal === '0' || r.montoTotal === ''
                                    ? ''
                                    : formatCurrencyInput(r.montoTotal)
                                }
                                onChange={(e) => {
                                  const parsed = parseCurrency(e.target.value, { returnEmpty: true });
                                  handleCambioRegla(idx, 'montoTotal', parsed === '' ? '' : parsed);
                                }}
                                size="small"
                                variant="standard"
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: '1 1 150px', minWidth: 150 }}
                                inputProps={{ inputMode: 'numeric' }}
                              />
                              <TextField
                                type="number"
                                label="Cuotas"
                                value={r.cuotas ?? ''}
                                onChange={e => handleCambioRegla(idx, 'cuotas', e.target.value)}
                                size="small"
                                variant="standard"
                                sx={{ flex: '1 1 110px', minWidth: 110 }}
                                inputProps={{ min: 1, step: 1, inputMode: 'numeric' }}
                              />
                              <TextField
                                type="number"
                                label="% interés"
                                placeholder="% 0"
                                value={
                                  r.interesMensual === 0 || r.interesMensual === '0' || r.interesMensual === ''
                                    ? ''
                                    : r.interesMensual
                                }
                                onChange={(e) => handleCambioRegla(idx, 'interesMensual', e.target.value)}
                                size="small"
                                variant="standard"
                                InputLabelProps={{ shrink: true }}
                                sx={{ flex: '1 1 120px', minWidth: 120 }}
                                inputProps={{ step: 0.1, inputMode: 'decimal' }}
                              />
                              <TextField
                                select
                                label="Comienza"
                                value={r.comienza || meses[0] || ''}
                                onChange={e => handleCambioRegla(idx, 'comienza', e.target.value)}
                                size="small"
                                variant="standard"
                                sx={{ flex: '1 1 140px', minWidth: 140 }}
                              >
                                {meses.map(m => (
                                  <MenuItem key={m} value={m}>
                                    {m}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Stack>
                            <Typography variant="caption" color="warning.main">
                              Calcula cuotas estilo francés cuando hay interés
                            </Typography>
                          </Stack>
                        )}
                      </TableCell>

                      <TableCell sx={{ ...tableCellStyle, width: 96, minWidth: 96, maxWidth: 96, px: 0.5 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
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
              <Chip label={`Resultado: ${fmtARS(resultadoTotal)}`} color={resultadoTotal >= 0 ? 'info' : 'error'} />
            </Stack>
          </Box>

          {hasLosses && (
            <Alert
              severity="error"
              variant="filled"
              role="alert"
              aria-live="polite"
              sx={{ mb: 2 }}
            >
              <AlertTitle>Atención: hay meses en pérdida (resultado negativo).</AlertTitle>
              Revisá los montos. Meses afectados: {lossSummaryText || 'ver detalle en la grilla.'}
            </Alert>
          )}

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
                  const resumenMes = monthTotals[mes] || { ingresos: 0, egresos: 0, resultado: 0 };
                  const esPerdidaMes = resumenMes.resultado < 0;

                  return (
                    <TableRow
                      key={mes}
                      sx={tableRowStyle}
                    >
                      <TableCell sx={tableCellStyle}>{mes}</TableCell>
                      {categorias.map((cat, idx) => {
                        const valores = presupuestoDataMes[mes]?.[cat.categoria] || { sugerido: 0 };
                        return (
                          <TableCell key={idx} sx={tableCellStyle}>
                            <TextField
                              type="text"
                              variant="standard"
                              size="small"
                              value={formatCurrencyInput(valores.sugerido)}
                              onChange={(e) => handleCambioMonto(mes, cat.categoria, 'sugerido', parseCurrency(e.target.value, { returnEmpty: true }))}
                              inputProps={{ inputMode: 'numeric', style: { padding: '4px 6px', textAlign: 'right' } }}
                              sx={{ maxWidth: 90 }}
                            />
                          </TableCell>
                        );
                      })}
                      {/* CELDAS DE TOTALES POR MES */}
                      <TableCell sx={{ ...tableCellStyle, fontWeight: 700, color: '#66bb6a' }}>
                        {fmtARS(resumenMes.ingresos)}
                      </TableCell>
                      <TableCell sx={{ ...tableCellStyle, fontWeight: 700, color: '#ef5350' }}>
                        {fmtARS(resumenMes.egresos)}
                      </TableCell>
                      <TableCell sx={{ ...tableCellStyle }}>
                        <Tooltip
                          title={esPerdidaMes ? 'Este mes los egresos superan a los ingresos.' : ''}
                          disableHoverListener={!esPerdidaMes}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <Typography
                              component="span"
                              sx={{
                                fontWeight: 700,
                                color: esPerdidaMes ? 'error.main' : 'info.main'
                              }}
                            >
                              {fmtARS(resumenMes.resultado)}
                            </Typography>
                            {esPerdidaMes && (
                              <Chip
                                size="small"
                                color="error"
                                label="En pérdida"
                              />
                            )}
                          </Stack>
                        </Tooltip>
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
            <Button
              variant="contained"
              onClick={handleGuardar}
              disabled={creating}
              startIcon={creating ? <CircularProgress size={16} color="inherit" /> : null}
              disableElevation
              sx={{
                "&.Mui-disabled": {
                  backgroundColor: (theme) =>
                    `${theme.palette.action.disabledBackground} !important`,
                  color: (theme) => `${theme.palette.text.disabled} !important`,
                  backgroundImage: "none !important", // anula gradiente
                  boxShadow: "none",
                  borderColor: "transparent",
                },
              }}
            >
              {creating ? "Guardando…" : "Guardar presupuesto"}
            </Button>
            <Button variant="outlined" onClick={back}>Volver</Button>
            <Button variant="text" onClick={() => navigate(-1)}>Cancelar</Button>
          </Box>
        </>
      )}
    </Box>
  );
}

