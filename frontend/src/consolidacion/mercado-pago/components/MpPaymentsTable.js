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
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  PAGE_SIZE_OPTIONS,
  statusChipProps,
  currencyFormatter,
} from "../catalogs";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  // Solo mostrar la fecha (sin hora)
  return d.toLocaleDateString("es-AR");
  // Si algún día quieres mostrar la hora cuando corresponda, descomenta esto:
  // const hasTime = d.getHours() + d.getMinutes() + d.getSeconds() !== 0;
  // return hasTime ? d.toLocaleString("es-AR") : d.toLocaleDateString("es-AR");
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

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text));
  };

  return (
    <TableContainer sx={{ borderRadius: 2 }}>
      {loading && <LinearProgress />}
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
                inputProps={{ "aria-label": "Seleccionar todos" }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>ID Pago</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Detalle</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Comprador</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Comprobante</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 600 }}> Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  No hay pagos para mostrar.
                </Box>
              </TableCell>
            </TableRow>
          )}

          {rows.map((r) => {
            const id = r.mpPaymentId;
            const fecha = formatDate(r.fecha || r.date);

            return (
              <TableRow
                key={id}
                hover
                selected={selected.includes(id)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: (t) => t.palette.action.selected,
                  },
                  "&:hover": {
                    backgroundColor: (t) => t.palette.action.hover,
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(id)}
                    onChange={() => toggleOne(id)}
                    inputProps={{ "aria-label": `Seleccionar ${id}` }}
                  />
                </TableCell>

                <TableCell>{fecha}</TableCell>

                <TableCell>
                  <Box component="span" sx={{ fontFamily: "monospace" }}>
                    {id || "—"}
                  </Box>
                </TableCell>

                <TableCell>{r.detalle || r.description || "—"}</TableCell>
                <TableCell>{r.comprador || r.buyer || "—"}</TableCell>
                <TableCell>{r.comprobante || r.receipt || "—"}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    {...statusChipProps(r.estado || r.status)}
                  />
                </TableCell>

                <TableCell align="right">
                  {currencyFormatter(
                    r.total ?? r.amount,
                    r.moneda || r.currency || "ARS",
                    "es-AR"
                  )}
                </TableCell>
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
