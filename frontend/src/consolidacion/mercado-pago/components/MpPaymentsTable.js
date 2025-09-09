import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TableContainer,
  TablePagination,
  LinearProgress,
  Chip,
  Box,
} from "@mui/material";
import { PAGE_SIZE_OPTIONS } from "../catalogs";

const chipForEstado = (estadoRaw) => {
  const v = (estadoRaw || "").toString().toLowerCase();
  if (["approved", "aprobado"].includes(v))
    return { color: "success", label: "Aprobado", variant: "outlined" };
  if (["pending", "pendiente", "in_process", "en_proceso"].includes(v))
    return { color: "warning", label: "Pendiente", variant: "outlined" };
  if (
    [
      "rejected",
      "rechazado",
      "cancelled",
      "cancelado",
      "charged_back",
      "chargeback",
    ].includes(v)
  )
    return { color: "error", label: "Rechazado", variant: "outlined" };
  if (["refunded", "reembolsado"].includes(v))
    return { color: "info", label: "Reembolsado", variant: "outlined" };
  return { color: "default", label: estadoRaw || "—", variant: "outlined" };
};

const fmtCurrency = (n) => {
  const num = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(num)) return "—";
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(num);
  } catch {
    return String(n);
  }
};

export default function MpPaymentsTable({
  rows = [],
  loading = false,
  page = 0,
  pageSize = 20,
  total = 0,
  selected = [],
  onSelectChange,
  onPageChange,
  onPageSizeChange,
}) {
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const someSelected = selected.length > 0 && selected.length < rows.length;

  const toggleAll = (e) => {
    if (e.target.checked) onSelectChange(rows.map((r) => r.mpPaymentId));
    else onSelectChange([]);
  };

  const toggleOne = (id) => {
    if (selected.includes(id)) onSelectChange(selected.filter((s) => s !== id));
    else onSelectChange([...selected, id]);
  };

  return (
    <TableContainer>
      {loading && <LinearProgress />}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
              />
            </TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Payment ID</TableCell>
            <TableCell>Detalle</TableCell>
            <TableCell>Comprador</TableCell>
            <TableCell>Comprobante</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
                >
                  No hay pagos para mostrar.
                </Box>
              </TableCell>
            </TableRow>
          )}

          {rows.map((r) => {
            const id = r.mpPaymentId;
            const fecha = r.fecha
              ? new Date(r.fecha).toLocaleDateString()
              : "—";
            return (
              <TableRow key={id} hover selected={selected.includes(id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(id)}
                    onChange={() => toggleOne(id)}
                  />
                </TableCell>
                <TableCell>{fecha}</TableCell>
                <TableCell>{id}</TableCell>
                <TableCell>{r.detalle || "—"}</TableCell>
                <TableCell>{r.comprador || "—"}</TableCell>
                <TableCell>{r.comprobante || "—"}</TableCell>
                <TableCell>
                  <Chip size="small" {...chipForEstado(r.estado)} />
                </TableCell>
                <TableCell align="right">{fmtCurrency(r.total)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) =>
          onPageSizeChange(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
      />
    </TableContainer>
  );
}
