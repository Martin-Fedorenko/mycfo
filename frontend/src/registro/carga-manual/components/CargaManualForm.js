import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Select,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
  Paper,
} from '@mui/material';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const tipos = ['ingreso', 'egreso', 'deuda', 'acreencia'];

const posiblesTerceros = {
  ingreso: 'cliente',
  egreso: 'proveedor',
  deuda: 'deudor',
  acreencia: 'acreedor',
};

const categoriasIniciales = ['Donación', 'Venta', 'Compra', 'Servicio'];

export default function CargaManualForm() {
  const [tipo, setTipo] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(dayjs());
  const [categorias, setCategorias] = useState([]);
  const [todasCategorias, setTodasCategorias] = useState(categoriasIniciales);
  const [nuevoTag, setNuevoTag] = useState('');
  const [tercero, setTercero] = useState('');
  const [comentario, setComentario] = useState('');

  const handleAgregarCategoria = () => {
    if (nuevoTag && !todasCategorias.includes(nuevoTag)) {
      setTodasCategorias((prev) => [...prev, nuevoTag]);
      setCategorias((prev) => [...prev, nuevoTag]);
      setNuevoTag('');
    }
  };

  const handleSubmit = () => {
    const payload = {
      tipo,
      monto: parseFloat(monto),
      fecha: fecha.toISOString(),
      categorias,
      tercero,
      comentario,
    };
    console.log('Datos cargados:', payload);
  };

  return (
    <Box
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: { sm: '100%', md: '600px' },
        mx: 'auto',
        mt: 4,
        p: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        Carga Manual
      </Typography>

      {/* Tipo */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel shrink>Tipo</InputLabel>
        <Select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          displayEmpty
          input={<OutlinedInput notched label="Tipo" />}
        >
          <MenuItem value="">
            <em>Seleccionar tipo</em>
          </MenuItem>
          {tipos.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Monto */}
      <TextField
        label="Monto"
        type="number"
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      {/* Fecha */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Fecha y Hora"
          value={fecha}
          onChange={setFecha}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'outlined',
              sx: { mb: 2 },
              InputLabelProps: { shrink: true },
            },
          }}
        />
      </LocalizationProvider>

      {/* Categorías */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel shrink>Categorías</InputLabel>
        <Select
          multiple
          value={categorias}
          onChange={(e) => setCategorias(e.target.value)}
          input={<OutlinedInput notched label="Categorías" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {todasCategorias.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Agregar nueva categoría */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Nueva categoría"
          value={nuevoTag}
          onChange={(e) => setNuevoTag(e.target.value)}
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={handleAgregarCategoria}>
          Agregar
        </Button>
      </Box>

      {/* Tercero involucrado */}
      <TextField
        label={tipo ? `Nombre del ${posiblesTerceros[tipo]}` : 'Nombre del tercero'}
        fullWidth
        sx={{ mb: 2 }}
        value={tercero}
        onChange={(e) => setTercero(e.target.value)}
        disabled={!tipo}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
      />

      {/* Comentario */}
      <TextField
        label="Comentario"
        fullWidth
        multiline
        minRows={3}
        sx={{ mb: 3 }}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
      />

      {/* Guardar */}
      <Button
        variant="contained"
        color="secundary"
        fullWidth
        size="large"
        onClick={handleSubmit}
        disabled={!tipo || !monto || !fecha || !tercero}
      >
        Guardar
      </Button>
    </Box>
  );
}
