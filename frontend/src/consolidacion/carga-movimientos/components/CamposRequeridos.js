// src/carga-excel/components/CamposRequeridos.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

function createData(fecha, descripcion, monto, categoria) {
  return { fecha, descripcion, monto, categoria };
}

const rows = [
  createData("2024-05-01", "Pago proveedor", -15000, "Servicios"),
  createData("2024-05-02", "Venta producto", 22000, "Ventas"),
  createData("2024-05-03", "Pago alquiler", -35000, "Alquiler"),
  createData("2024-05-04", "Interés bancario", 1500, "Finanzas"),
];

const CamposRequeridos = () => (
  <>
    <Typography variant="h6" gutterBottom>
      Ejemplo de archivo esperado:
    </Typography>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="tabla de ejemplo de carga">
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Monto</TableCell>
            <TableCell>Categoría</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.fecha}</TableCell>
              <TableCell>{row.descripcion}</TableCell>
              <TableCell>{row.monto}</TableCell>
              <TableCell>{row.categoria}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
);

export default CamposRequeridos;
