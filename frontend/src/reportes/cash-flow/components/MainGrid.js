import * as React from 'react';
import { Box, Typography } from '@mui/material';
import Filtros from './Filtros';
import TablaDetalle from './TablaDetalle';
import Exportador from '../../reporte-mensual/components/Exportador';

export default function MainGrid() {
    const [selectedYear, setSelectedYear] = React.useState(2025);

    const handleYearChange = (e) => setSelectedYear(e.target.value);

    // Ingresos completos para 2025
    const ingresos = [
        // Enero
        { id: 1, categoria: 'Salario', monto: 5000, fecha: `2025-01-05` },
        { id: 2, categoria: 'Freelance', monto: 800, fecha: `2025-01-20` },
        // Febrero
        { id: 3, categoria: 'Salario', monto: 5000, fecha: `2025-02-05` },
        { id: 4, categoria: 'Bonus', monto: 600, fecha: `2025-02-15` },
        // Marzo
        { id: 5, categoria: 'Salario', monto: 5000, fecha: `2025-03-05` },
        { id: 6, categoria: 'Dividendos', monto: 400, fecha: `2025-03-18` },
        // Abril
        { id: 7, categoria: 'Salario', monto: 5000, fecha: `2025-04-05` },
        { id: 8, categoria: 'Inversión', monto: 1200, fecha: `2025-04-22` },
        // Mayo
        { id: 9, categoria: 'Salario', monto: 5000, fecha: `2025-05-05` },
        { id: 10, categoria: 'Freelance', monto: 1000, fecha: `2025-05-11` },
        // Junio
        { id: 11, categoria: 'Salario', monto: 5000, fecha: `2025-06-05` },
        { id: 12, categoria: 'Regalo', monto: 300, fecha: `2025-06-25` },
        // Julio
        { id: 13, categoria: 'Salario', monto: 5000, fecha: `2025-07-05` },
        { id: 14, categoria: 'Venta producto', monto: 950, fecha: `2025-07-18` },
        // Agosto
        { id: 15, categoria: 'Salario', monto: 5000, fecha: `2025-08-05` },
        { id: 16, categoria: 'Dividendos', monto: 700, fecha: `2025-08-28` },
        // Septiembre
        { id: 17, categoria: 'Salario', monto: 5000, fecha: `2025-09-05` },
        { id: 18, categoria: 'Bonus', monto: 800, fecha: `2025-09-20` },
        // Octubre
        { id: 19, categoria: 'Salario', monto: 5000, fecha: `2025-10-05` },
        { id: 20, categoria: 'Freelance', monto: 1500, fecha: `2025-10-14` },
        // Noviembre
        { id: 21, categoria: 'Salario', monto: 5000, fecha: `2025-11-05` },
        { id: 22, categoria: 'Inversión', monto: 900, fecha: `2025-11-27` },
        // Diciembre
        { id: 23, categoria: 'Salario', monto: 5000, fecha: `2025-12-05` },
        { id: 24, categoria: 'Dividendos', monto: 1100, fecha: `2025-12-20` },
    ];

    // Egresos completos para 2025
    const egresos = [
        // Enero
        { id: 101, categoria: 'Alquiler', monto: 2000, fecha: `2025-01-01` },
        { id: 102, categoria: 'Transporte', monto: 300, fecha: `2025-01-12` },
        { id: 103, categoria: 'Alimentos', monto: 700, fecha: `2025-01-15` },
        // Febrero
        { id: 104, categoria: 'Alquiler', monto: 2000, fecha: `2025-02-01` },
        { id: 105, categoria: 'Ocio', monto: 400, fecha: `2025-02-20` },
        // Marzo
        { id: 106, categoria: 'Alquiler', monto: 2000, fecha: `2025-03-01` },
        { id: 107, categoria: 'Educación', monto: 500, fecha: `2025-03-10` },
        { id: 108, categoria: 'Transporte', monto: 350, fecha: `2025-03-22` },
        // Abril
        { id: 109, categoria: 'Alquiler', monto: 2000, fecha: `2025-04-01` },
        { id: 110, categoria: 'Electrodoméstico', monto: 1800, fecha: `2025-04-12` },
        // Mayo
        { id: 111, categoria: 'Alquiler', monto: 2000, fecha: `2025-05-01` },
        { id: 112, categoria: 'Viaje', monto: 2500, fecha: `2025-05-18` },
        // Junio
        { id: 113, categoria: 'Alquiler', monto: 2000, fecha: `2025-06-01` },
        { id: 114, categoria: 'Alimentos', monto: 900, fecha: `2025-06-14` },
        // Julio
        { id: 115, categoria: 'Alquiler', monto: 2000, fecha: `2025-07-01` },
        { id: 116, categoria: 'Transporte', monto: 400, fecha: `2025-07-09` },
        { id: 117, categoria: 'Ocio', monto: 600, fecha: `2025-07-25` },
        // Agosto
        { id: 118, categoria: 'Alquiler', monto: 2000, fecha: `2025-08-01` },
        { id: 119, categoria: 'Viaje', monto: 3000, fecha: `2025-08-20` },
        // Septiembre
        { id: 120, categoria: 'Alquiler', monto: 2000, fecha: `2025-09-01` },
        { id: 121, categoria: 'Educación', monto: 600, fecha: `2025-09-15` },
        { id: 122, categoria: 'Alimentos', monto: 800, fecha: `2025-09-22` },
        // Octubre
        { id: 123, categoria: 'Alquiler', monto: 2000, fecha: `2025-10-01` },
        { id: 124, categoria: 'Electrodoméstico', monto: 1500, fecha: `2025-10-12` },
        { id: 125, categoria: 'Transporte', monto: 500, fecha: `2025-10-20` },
        // Noviembre
        { id: 126, categoria: 'Alquiler', monto: 2000, fecha: `2025-11-01` },
        { id: 127, categoria: 'Salud', monto: 1200, fecha: `2025-11-18` },
        // Diciembre
        { id: 128, categoria: 'Alquiler', monto: 2000, fecha: `2025-12-01` },
        { id: 129, categoria: 'Ocio', monto: 700, fecha: `2025-12-10` },
        { id: 130, categoria: 'Transporte', monto: 450, fecha: `2025-12-21` },
    ];

    const saldoInicial = 2000; // ejemplo fijo

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Cashflow anual
            </Typography>

            <Filtros
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
            />

            <TablaDetalle
                year={selectedYear}
                ingresos={ingresos}
                egresos={egresos}
                saldoInicial={saldoInicial}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Exportador />
            </Box>
        </Box>
    );
}
