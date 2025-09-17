import React, { useEffect, useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const Filtros = ({
                     selectedMonth,
                     selectedYear,
                     onMonthChange,
                     onYearChange,
                     selectedCategoria,     // array
                     onCategoriaChange,
                 }) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const años = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    // Categorías base hardcodeadas (sin "Alimentos")
    const categoriasBase = ['Transporte', 'Entretenimiento', 'Educación', 'Ocio'];

    // Categorías traídas desde backend
    const [categoriasExtra, setCategoriasExtra] = useState([]);

    useEffect(() => {
        const baseUrl = process.env.REACT_APP_URL_REGISTRO;
        if (!baseUrl) return;

        fetch(`${baseUrl}/categorias`)
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();
                const nombres = Array.isArray(data)
                    ? data.map((c) => (c?.nombre ?? c)).filter(Boolean)
                    : [];
                setCategoriasExtra(nombres);
            })
            .catch((err) => {
                console.error('Error al cargar categorías desde registro:', err);
                setCategoriasExtra([]);
            });
    }, []);

    // Catálogo final (sin duplicados)
    const categorias = useMemo(
        () => Array.from(new Set([...categoriasBase, ...categoriasExtra])),
        [categoriasExtra]
    );

    // Sanear selección si hay valores que ya no existen
    useEffect(() => {
        const actual = Array.isArray(selectedCategoria) ? selectedCategoria : [];
        const saneada = actual.filter((c) => categorias.includes(c));
        if (saneada.length !== actual.length) {
            onCategoriaChange({ target: { value: saneada } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categorias]);

    // 👉 Si el usuario marca TODAS, mandamos [] al padre para que no se envíe 'categoria' en la query
    const handleCategoriaChange = (e) => {
        const v = e.target.value;
        const arr = Array.isArray(v)
            ? v
            : typeof v === 'string'
                ? (v ? v.split(',') : [])
                : [];

        const unique = Array.from(new Set(arr));
        const allSelected = unique.length === categorias.length;

        onCategoriaChange({ target: { value: allSelected ? [] : unique } });
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {/* Mes */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="mes-label">Mes</InputLabel>
                <Select
                    labelId="mes-label"
                    id="mes-select"
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
                <InputLabel id="anio-label">Año</InputLabel>
                <Select
                    labelId="anio-label"
                    id="anio-select"
                    value={selectedYear}
                    onChange={onYearChange}
                    label="Año"
                >
                    {años.map((año) => (
                        <MenuItem key={año} value={año}>{año}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Categoría (multiple) */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="categoria-label" shrink>Categoría</InputLabel>
                <Select
                    labelId="categoria-label"
                    id="categoria-select"
                    multiple
                    displayEmpty
                    value={Array.isArray(selectedCategoria) ? selectedCategoria : []}
                    onChange={handleCategoriaChange}
                    label="Categoría"
                    renderValue={(selected) => {
                        if (!selected || selected.length === 0 || selected.length === categorias.length) {
                            return <span style={{ opacity: 0.6 }}>Todas</span>;
                        }
                        if (selected.length === 1) return selected[0];
                        return 'Varios';
                    }}
                >
                    {categorias.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default Filtros;
