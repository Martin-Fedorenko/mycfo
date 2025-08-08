import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const Filtros = ({
                     selectedMonth,
                     selectedYear,
                     onMonthChange,
                     onYearChange,
                     selectedTipo,
                     onTipoChange,
                     selectedCategoria,
                     onCategoriaChange
                 }) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const años = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const tipos = ['Ingreso', 'Egreso', 'Deuda', 'Acreencias'];

    const categorias = [
        'Comida', 'Combustible', 'donacion', 'venta', 'compra',
        'servicio', 'renta', 'impuestos', 'salud', 'Transporte', 'Entretenimiento'
    ];

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {/* Mes */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Mes</InputLabel>
                <Select
                    value={selectedMonth}
                    onChange={onMonthChange}
                    label="Mes"
                >
                    {meses.map((mes, index) => (
                        <MenuItem key={index} value={index}>{mes}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Año */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Año</InputLabel>
                <Select
                    value={selectedYear}
                    onChange={onYearChange}
                    label="Año"
                >
                    {años.map((año) => (
                        <MenuItem key={año} value={año}>{año}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Tipo */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                    value={selectedTipo || ''}
                    onChange={onTipoChange}
                    label="Tipo"
                >
                    {tipos.map((tipo, index) => (
                        <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Categoría */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                    value={selectedCategoria || ''}
                    onChange={onCategoriaChange}
                    label="Categoría"
                >
                    {categorias.map((cat, index) => (
                        <MenuItem key={index} value={cat}>{cat}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default Filtros;
