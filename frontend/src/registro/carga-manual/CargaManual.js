import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Autocomplete,
  FormControl,
  FormLabel,
  TextareaAutosize
} from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function CargaManual() {
  const tipos = ['ingreso', 'egreso', 'deuda', 'acreencia'];

  const sugerenciasCategorias = [
    'Comida',
    'Combustible',
    'Donación',
    'Venta',
    'Compra',
    'Servicio',
    'Renta',
    'Impuestos',
    'Salud',
    'Transporte',
    'Entretenimiento',
  ];

  const [tipo, setTipo] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(dayjs());
  const [hora, setHora] = useState(dayjs());
  const [categorias, setCategorias] = useState([]);
  const [categoriaInput, setCategoriaInput] = useState('');
  const [tercero, setTercero] = useState('');
  const [comentario, setComentario] = useState('');

  const handleAgregarCategoria = (value) => {
    if (!value) return;
    const nuevaCategoria = value.trim();
    if (
      nuevaCategoria !== '' &&
      !categorias.some((c) => c.toLowerCase() === nuevaCategoria.toLowerCase())
    ) {
      setCategorias([...categorias, nuevaCategoria]);
    }
    setCategoriaInput('');
  };

  const handleDeleteCategoria = (categoriaABorrar) => {
    setCategorias(categorias.filter((c) => c !== categoriaABorrar));
  };

  const handleSubmit = () => {
    const fechaHora = fecha
      .hour(hora.hour())
      .minute(hora.minute())
      .second(0)
      .millisecond(0);

    const payload = {
      tipo,
      monto: parseFloat(monto),
      fecha: fechaHora.toISOString(),
      categorias,
      tercero,
      comentario,
    };
    console.log('Datos cargados:', payload);
  };

  const montoInvalido = isNaN(monto) || parseFloat(monto) <= 0;

  // Filtrado incremental: opciones que incluyen el texto escrito y que no estén ya seleccionadas
  const opcionesFiltradas = sugerenciasCategorias.filter(
    (option) =>
      option.toLowerCase().includes(categoriaInput.toLowerCase()) &&
      !categorias.some((c) => c.toLowerCase() === option.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Box height={100}>
        </Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Carga Manual
      </Typography>
      
      

      
      {/* Tipo */}
      <TextField
        select
        label="Tipo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      >
        {tipos.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>

      {/* Monto */}
      <TextField
        label="Monto"
        type="number"
        fullWidth
        required
        variant="outlined"
        sx={{ mb: 2 }}
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        error={montoInvalido}
        helperText={montoInvalido ? 'El monto debe ser mayor que 0' : ''}
        InputLabelProps={{ shrink: true }}
      />

      {/* Fecha y Hora */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid item xs={2} sx={{ mb: 2 }}>
            <DatePicker
              label="Fecha"
              value={fecha}
              onChange={(newDate) => newDate && setFecha(newDate)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                },
              }}
            />
          </Grid>
      </LocalizationProvider>

      <TextareaAutosize
    minRows={1}
    placeholder="Escribí tu comentario..."
    style={{
      width: '100%',
      fontFamily: 'inherit',
      fontSize: '1rem',
      padding: '12px',
      borderRadius: '4px',
      border: '1px solid rgba(255, 255, 255, 0.23)',
      backgroundColor: 'transparent',
      color: 'inherit',
      resize: 'vertical',
    }}
    value={comentario}
    onChange={(e) => setComentario(e.target.value)}
  />

      {/* Autocomplete para agregar una sola categoría a la vez */}
      <Autocomplete
        freeSolo
        options={opcionesFiltradas}
        inputValue={categoriaInput}
        onInputChange={(event, newInputValue, reason) => {
          // Solo actualizar inputValue si la causa NO es "reset" (cuando se selecciona una opción)
          if (reason !== 'reset') {
            setCategoriaInput(newInputValue);
          }
        }}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            handleAgregarCategoria(newValue);
          } else if (newValue && newValue.inputValue) {
            handleAgregarCategoria(newValue.inputValue);
          } else if (newValue) {
            handleAgregarCategoria(newValue);
          }
          // Limpiar el input en cualquier caso después de agregar
          setCategoriaInput('');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Agregar Categoría"
            placeholder="Escribí y presioná Enter o seleccioná"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAgregarCategoria(categoriaInput);
                setCategoriaInput('');
              }
            }}
            fullWidth
            sx={{ mb: 1 }}
            InputLabelProps={{ shrink: true }}
          />
        )}
      />


      {/* Mostrar tags aparte */}
      <Box sx={{ mb: 2, minHeight: 40 }}>
        {categorias.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onDelete={() => handleDeleteCategoria(cat)}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>

      {/* Guardar */}
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        size="large"
        onClick={handleSubmit}
        disabled={!tipo || montoInvalido}
      >
        Guardar
      </Button>
      
      
    </Box>
  );
}
