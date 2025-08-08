import * as React from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import TablaDetalle from './TablaDetalle';
import Exportador from './Exportador';
import Filtros from './Filtros';

export default function MainGrid() {
    const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [data, setData] = React.useState({ ingresos: [], egresos: [] });

    React.useEffect(() => {
        const baseUrl = process.env.REACT_APP_URL_REPORTE; // usa variable del .env
        axios.get(`${baseUrl}/resumen`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error al obtener los datos del backend:', error);
            });
    }, []);

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const getNombreMes = (mesIndex) => {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];
        return meses[mesIndex];
    };

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3, position: 'relative' }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Resumen mensual de ingresos y egresos
            </Typography>

            <Filtros
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
            />

            <Typography component="h3" variant="h6" sx={{ mb: 2 }}>
                Resumen mensual - {getNombreMes(selectedMonth)} {selectedYear}
            </Typography>

            <TablaDetalle
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                ingresos={data.ingresos}
                egresos={data.egresos}
            />

            <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                <Exportador />
            </Box>
        </Box>
    );
}
