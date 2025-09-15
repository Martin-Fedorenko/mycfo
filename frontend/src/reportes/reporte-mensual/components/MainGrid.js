import * as React from 'react';
import { Box, Typography } from '@mui/material';
import TablaDetalle from './TablaDetalle';
import Filtros from './Filtros';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';

export default function MainGrid() {
    // Inician vacíos
    const [selectedMonth, setSelectedMonth] = React.useState('');          // '' | 0..11
    const [selectedYear, setSelectedYear] = React.useState('');            // '' | number
    const [selectedCategoria, setSelectedCategoria] = React.useState([]);  // [] | string[]

    // Estructura alineada al backend (evita undefined)
    const [data, setData] = React.useState({ detalleIngresos: [], detalleEgresos: [] });

    // Llamada al backend cada vez que cambian los filtros
    React.useEffect(() => {
        const baseUrl = process.env.REACT_APP_URL_REPORTE;
        if (!baseUrl) return;
        if (!(selectedYear && selectedMonth !== '')) return;

        const params = new URLSearchParams();
        params.set('anio', selectedYear);
        params.set('mes', Number(selectedMonth) + 1); // selects 0..11 → backend 1..12

        // Solo enviar 'categoria' cuando hay exactamente una elegida
        if (Array.isArray(selectedCategoria) && selectedCategoria.length === 1) {
            params.set('categoria', selectedCategoria[0]);
        }

        fetch(`${baseUrl}/resumen?${params.toString()}`)
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const json = await r.json();
                setData({
                    detalleIngresos: json?.detalleIngresos ?? [],
                    detalleEgresos: json?.detalleEgresos ?? [],
                });
            })
            .catch((error) => {
                console.error('Error al obtener los datos del backend:', error);
                setData({ detalleIngresos: [], detalleEgresos: [] });
            });
    }, [selectedYear, selectedMonth, selectedCategoria]);

    const handleMonthChange = (e) => setSelectedMonth(e.target.value);
    const handleYearChange = (e) => setSelectedYear(e.target.value);

    // Garantizar SIEMPRE array (corrige caso string y evita “Varios” con 1 selección)
    const handleCategoriaChange = (e) => {
        const v = e.target.value;
        const arr = Array.isArray(v) ? v : (typeof v === 'string' ? (v ? v.split(',') : []) : []);
        setSelectedCategoria(arr);
    };

    const getNombreMes = (mesIndex) => {
        if (mesIndex === '' || mesIndex === null || mesIndex === undefined) return '';
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];
        return meses[mesIndex];
    };

    const handleExportPdf = () => console.log('Exportar PDF desde módulo Reportes');
    const handleExportExcel = () => console.log('Exportar Excel desde módulo Reportes');

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Resumen mensual de ingresos y egresos
            </Typography>

            <Filtros
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
                selectedCategoria={selectedCategoria}
                onCategoriaChange={handleCategoriaChange}
            />

            <Typography component="h3" variant="h6" sx={{ mb: 2 }}>
                {getNombreMes(selectedMonth) && selectedYear
                    ? `Resumen mensual - ${getNombreMes(selectedMonth)} ${selectedYear}`
                    : 'Resumen mensual'}
            </Typography>

            <TablaDetalle
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                ingresos={data.detalleIngresos}
                egresos={data.detalleEgresos}
                topRightActions={
                    <ExportadorSimple
                        onExportPdf={handleExportPdf}
                        onExportExcel={handleExportExcel}
                    />
                }
            />
        </Box>
    );
}
