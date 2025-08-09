import * as React from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import TablaDetalle from './TablaDetalle';
import Filtros from './Filtros';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';

export default function MainGrid() {
    // Inician vacíos: muestran solo el label hasta que elijas
    const [selectedMonth, setSelectedMonth] = React.useState('');          // '' | 0..11
    const [selectedYear, setSelectedYear] = React.useState('');            // '' | number
    const [selectedCategoria, setSelectedCategoria] = React.useState([]);  // [] | string[]

    const [data, setData] = React.useState({ ingresos: [], egresos: [] });

    React.useEffect(() => {
        const baseUrl = process.env.REACT_APP_URL_REPORTE;
        axios.get(`${baseUrl}/resumen`)
            .then(response => setData(response.data))
            .catch(error => {
                console.error('Error al obtener los datos del backend:', error);
            });
    }, []);

    const handleMonthChange = (e) => setSelectedMonth(e.target.value);
    const handleYearChange = (e) => setSelectedYear(e.target.value);
    const handleCategoriaChange = (e) => setSelectedCategoria(e.target.value);

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
                ingresos={data.ingresos}
                egresos={data.egresos}
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
