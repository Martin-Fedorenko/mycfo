import React, { useState } from 'react';
import {
  Box, Typography, Grid, MenuItem, Chip, Autocomplete,
  FormLabel, FormHelperText, Select, TextField, InputLabel
} from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import CustomButton from "./../../shared-components/CustomButton";

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function CargaManual() {
  const tipos = ['Ingreso', 'Egreso', 'Deuda', 'Acreencia'];

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
  const [fecha, setFecha] = useState(null);
  const [hora,  setHora]  = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriaInput, setCategoriaInput] = useState('');
  const [tercero, setTercero] = useState('');
  const [comentario, setComentario] = useState('');
  const [errores, setErrores] = useState({});

  const handleAgregarCategoria = (value) => {
    if (!value) return;
    const nueva = value.trim();
    if (
      nueva !== '' &&
      !categorias.some((c) => c.toLowerCase() === nueva.toLowerCase())
    ) {
      setCategorias((prev) => [...prev, nueva]);
    }
    setCategoriaInput('');
  };

  const handleDeleteCategoria = (cat) => {
    setCategorias((prev) => prev.filter((c) => c !== cat));
  };

  const URL_REGISTRO = process.env.REACT_APP_URL_REGISTRO;

  const handleSubmit = async () => {
    let nuevosErrores = {};
    const montoNum = Number(monto);

    if (!tipo) nuevosErrores.tipo = "El tipo es obligatorio";
    if (monto === '' || montoNum <= 0) nuevosErrores.monto = "El monto debe ser mayor que 0";
    if (!fecha) nuevosErrores.fecha = "La fecha es obligatoria";
    if (!hora) nuevosErrores.hora = "La hora es obligatoria";

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) return;

    const fechaHora = fecha
      .hour(hora.hour())
      .minute(hora.minute())
      .second(0)
      .millisecond(0);

    const payload = {
      tipo,
      monto: montoNum,
      fecha: fechaHora.format('YYYY-MM-DDTHH:mm:ss'),
      categorias,
      tercero,
      comentario,
    };

    console.log("📦 Datos que se van a enviar:", payload);

    try {
      const response = await axios.post(`${URL_REGISTRO}/registros`, payload);
      console.log('✅ Datos guardados:', response.data);

      // 🔹 Limpiar formulario si se guardó con éxito
      setTipo('');
      setMonto('');
      setFecha(null);
      setHora(null);
      setCategorias([]);
      setCategoriaInput('');
      setTercero('');
      setComentario('');
      setErrores({});
      
    } catch (error) {
      console.error('❌ Error al guardar los datos:', error);
    }
  };




  const montoNum = Number(monto);
  const montoInvalido = monto !== '' && montoNum < 0;

  const opcionesFiltradas = sugerenciasCategorias.filter(
    (option) =>
      option.toLowerCase().includes(categoriaInput.toLowerCase()) &&
      !categorias.some((c) => c.toLowerCase() === option.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Carga Manual
      </Typography>

      <Grid container spacing={2}>
        {/* Tipo */}
        <FormGrid size={{ xs: 12 }}>
          <InputLabel id="tipo" required>Tipo</InputLabel>
          <Select
            labelId="tipo"
            id="tipo"
            name="tipo"
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            displayEmpty
            size="small"
            input={<OutlinedInput />}
          >
            <MenuItem value="" disabled>
              Seleccioná un tipo
            </MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
          {errores.tipo && <FormHelperText error>{errores.tipo}</FormHelperText>}
        </FormGrid>


        {/* Monto */}
        <FormGrid size={{ xs: 12 }}>
          <FormLabel htmlFor="monto" required>
            Monto
          </FormLabel>
          <OutlinedInput
            id="monto"
            type="number"
            placeholder="0.00"
            inputProps={{ step: '0.01' }}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            size="small"
            aria-invalid={montoInvalido ? 'true' : 'false'}
          />
          {errores.monto && <FormHelperText error>{errores.monto}</FormHelperText>}
        </FormGrid>

        {/* Fecha */}
        <FormGrid size={{ xs: 12, sm: 6 }}>
          <FormLabel htmlFor="fecha" required>
            Fecha
          </FormLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={fecha}
              onChange={(newValue) => newValue && setFecha(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  id: 'fecha',
                  size: 'medium',
                  variant: 'outlined',
                  fullWidth: true,
                },
                openPickerButton: {
                  sx: { marginRight: '-5px' },
                },
              }}
            />
          </LocalizationProvider>
          {errores.fecha && <FormHelperText error>{errores.fecha}</FormHelperText>}
        </FormGrid>

        {/* Hora */}
        <FormGrid size={{ xs: 12, sm: 6 }}>
          <FormLabel htmlFor="hora" required>
            Hora
          </FormLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              value={hora}
              onChange={(newValue) => newValue && setHora(newValue)}
              ampm={false}
              views={['hours', 'minutes']}
              slotProps={{
                textField: {
                  id: 'hora',
                  size: 'medium',
                  variant: 'outlined',
                  fullWidth: true,
                },
                openPickerButton: {
                  sx: { marginRight: '-5px' },
                },
                 layout: {
                    sx: {
                      '& .MuiPickersLayout-contentWrapper': {
                        paddingRight: '20px',
                      },
                    },
                  },
              }}
            />
          </LocalizationProvider>
          {errores.hora && <FormHelperText error>{errores.hora}</FormHelperText>}
        </FormGrid>

        {/* Tercero (opcional) */}
        <FormGrid size={{ xs: 12 }}>
          <FormLabel htmlFor="tercero">Nombre del tercero (opcional)</FormLabel>
          <OutlinedInput
            id="tercero"
            placeholder="Ej: Proveedor, cliente, etc."
            value={tercero}
            onChange={(e) => setTercero(e.target.value)}
            size='large'
          />
        </FormGrid>

        {/* Comentario (opcional) */}
        <FormGrid size={{ xs: 12 }}>
          <FormLabel htmlFor="comentario">Comentario (opcional)</FormLabel>
          <OutlinedInput
            id="comentario"
            placeholder="Observaciones…"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            size='large'
          />
        </FormGrid>

        {/* Autocomplete para agregar categoría (opcional)*/}
        <FormGrid size={{ xs: 12 }}>
          <FormLabel htmlFor="categoria-input">Agregar categoría (opcional)</FormLabel>
          <Autocomplete
            id="categoria-input"
            freeSolo
            options={opcionesFiltradas}
            inputValue={categoriaInput}
            onInputChange={(event, newValue, reason) => {
              if (reason !== 'reset') setCategoriaInput(newValue);
            }}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                handleAgregarCategoria(newValue);
              } else if (newValue && newValue.inputValue) {
                handleAgregarCategoria(newValue.inputValue);
              } else if (newValue) {
                handleAgregarCategoria(newValue);
              }
              setCategoriaInput('');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="categoria-input"
                placeholder="Escribí y presioná Enter o seleccioná"
                size="large"
                variant="outlined"
              />
            )}
          />
        </FormGrid>

        {/* Chips de categorías */}
        <FormGrid size={{ xs: 12 }}>
          <Box sx={{ mt: 1 }}>
            {categorias.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onDelete={() => handleDeleteCategoria(cat)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        </FormGrid>

        {/* Guardar */}
        <FormGrid size={{ xs: 12 }}>
          <CustomButton
            label="Cargar movimiento"
            width="100%"
            onClick={handleSubmit}
          />
        </FormGrid>
      </Grid>
    </Box>
  );
}
