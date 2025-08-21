import React from "react";
import { DataGrid } from "@mui/x-data-grid";

export default function MpPaymentsTable({
  rows,
  rowCount,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
}) {
  const columns = [
    { field: "mpPaymentId", headerName: "Número", width: 140 },
    { field: "fecha", headerName: "Fecha", width: 120 },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      width: 120,
      valueFormatter: (p) => Number(p.value ?? 0).toFixed(2),
    },
    { field: "detalle", headerName: "Detalle", flex: 1, minWidth: 200 },
    { field: "comprador", headerName: "Comprador", width: 200 },
    { field: "comprobante", headerName: "Comprobante", width: 160 },
    { field: "estado", headerName: "Cobranzas/Estado", width: 160 },
  ];

  return (
    <DataGrid
      rows={rows}
      getRowId={(r) => r.mpPaymentId}
      columns={columns}
      checkboxSelection
      disableRowSelectionOnClick
      pagination
      paginationMode="server"
      page={page}
      pageSizeOptions={[10, 25, 50]}
      pageSize={pageSize}
      rowCount={rowCount}
      loading={loading}
      onPaginationModelChange={({ page, pageSize }) => {
        onPageChange(page);
        onPageSizeChange(pageSize);
      }}
      onRowSelectionModelChange={(m) => onSelectionChange(m.map(Number))}
      autoHeight
    />
  );
}
