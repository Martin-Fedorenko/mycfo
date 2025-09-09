// /mercado-pago/components/MainGrid.js
import React from "react";
import { Box, Snackbar, Alert, Paper } from "@mui/material";
import { mpApi } from "../mpApi";
import MpToolbar from "./MpToolbar";
import MpPaymentsTable from "./MpPaymentsTable";
import MpImportDialog from "./MpImportDialog";
import MpConfigDialog from "./MpConfigDialog";
import { DEFAULT_PAGE_SIZE } from "../catalogs";

export default function MainGrid({ status, onRefreshStatus }) {
  const [filters, setFilters] = React.useState({
    from: "",
    to: "",
    payStatus: "",
    q: "",
  });
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = React.useState(0);
  const [selected, setSelected] = React.useState([]);
  const [importOpen, setImportOpen] = React.useState(false);
  const [configOpen, setConfigOpen] = React.useState(false);
  const [snack, setSnack] = React.useState({
    open: false,
    severity: "success",
    message: "",
  });

  const accountLabel =
    status?.account?.nickname ||
    status?.account?.email ||
    status?.account?.legalName ||
    "Cuenta vinculada";

  const notify = (message, severity = "success") =>
    setSnack({ open: true, severity, message });

  const loadPayments = React.useCallback(async () => {
    setLoading(true);
    try {
      const resp = await mpApi.listPayments({
        from: filters.from || undefined,
        to: filters.to || undefined,
        q: filters.q || undefined,
        page, // 0-based
        pageSize,
      });
      const items = resp?.content || [];
      const tot = resp?.totalElements ?? items.length;
      setRows(items);
      setTotal(tot);
      setSelected([]);
    } catch (e) {
      notify(e?.message || "No se pudieron cargar los pagos", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  React.useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleUnlink = async () => {
    if (!window.confirm("¿Desvincular la cuenta de Mercado Pago?")) return;
    try {
      await mpApi.unlink();
      notify("Cuenta desvinculada");
      onRefreshStatus?.();
    } catch (e) {
      notify(e?.message || "No se pudo desvincular", "error");
    }
  };

  const handleImport = async (args) => {
    try {
      if (args.mode === "period") {
        await mpApi.importPaymentsByMonth({
          month: args.month,
          year: args.year,
        });
      } else {
        await mpApi.importPaymentById(args.paymentId);
      }
      notify("Importación solicitada. Actualizando…");
      setImportOpen(false);
      setPage(0);
      loadPayments();
    } catch (e) {
      notify(e?.message || "Error al importar pagos", "error");
    }
  };

  const handleBill = async () => {
    if (!selected.length) return;
    if (!window.confirm(`¿Facturar ${selected.length} pago(s) seleccionados?`))
      return;
    try {
      await mpApi.billPayments(selected);
      notify("Facturación en proceso/completada");
      loadPayments();
    } catch (e) {
      notify(e?.message || "Error al facturar", "error");
    }
  };

  const handleExport = () => {
    // Export simple a CSV en cliente (podemos mejorar a backend luego)
    const header = [
      "fecha",
      "id",
      "descripcion",
      "estado",
      "monto",
      "moneda",
      "orden",
      "link",
    ];
    const lines = rows.map((r) => [
      r.date || r.fecha || "",
      r.id || r.mpId || "",
      (r.description || r.descripcion || "").toString().replaceAll('"', '""'),
      r.status || r.estado || "",
      r.amount ?? r.monto ?? "",
      r.currency || r.moneda || "",
      r.orderId || r.externalReference || "",
      r.permalink || r.init_point || "",
    ]);
    const csv = [header, ...lines]
      .map((cols) => cols.map((c) => `"${c ?? ""}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pagos_mp_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3, px: 2 }}>
      <Paper sx={{ mb: 2 }}>
        <MpToolbar
          accountLabel={accountLabel}
          filters={filters}
          onFiltersChange={setFilters}
          onOpenImport={() => setImportOpen(true)}
          onOpenConfig={() => setConfigOpen(true)}
          onUnlink={handleUnlink}
          onRefresh={loadPayments}
          onExport={handleExport}
          onBillSelected={handleBill}
          selectedCount={selected.length}
        />
      </Paper>

      <Paper>
        <MpPaymentsTable
          rows={rows}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          selected={selected}
          onSelectChange={setSelected}
          onPageChange={setPage}
          onPageSizeChange={(ps) => {
            setPageSize(ps);
            setPage(0);
          }}
        />
      </Paper>

      <MpImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      <MpConfigDialog
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onSaved={() => {
          setConfigOpen(false);
          notify("Configuración guardada");
        }}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
