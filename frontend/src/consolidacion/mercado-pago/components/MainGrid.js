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
  const [unlinking, setUnlinking] = React.useState(false);
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

  // Nueva función para obtener pagos (con cache-buster)
  const fetchPayments = React.useCallback(async () => {
    const resp = await mpApi.listPayments({
      from: filters.from || undefined,
      to: filters.to || undefined,
      q: filters.q || undefined,
      payStatus: filters.payStatus || undefined,
      page, // 0-based
      pageSize,
      ts: Date.now(), // cache-buster
    });
    const items = resp?.content || [];
    const tot = resp?.totalElements ?? items.length;
    return { items, tot };
  }, [filters, page, pageSize]);

  // loadPayments ahora usa fetchPayments
  const loadPayments = React.useCallback(async () => {
    setLoading(true);
    try {
      const { items, tot } = await fetchPayments();
      setRows(items);
      setTotal(tot);
      setSelected([]);
    } catch (e) {
      notify(e?.message || "No se pudieron cargar los pagos", "error");
    } finally {
      setLoading(false);
    }
  }, [fetchPayments]);

  React.useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleUnlink = async () => {
    if (!window.confirm("¿Desvincular la cuenta de Mercado Pago?")) return;
    setUnlinking(true);
    try {
      await mpApi.unlink();
      setRows([]);
      setSelected([]);
      setPage(0);
      notify("Cuenta desvinculada");
      onRefreshStatus?.();
    } catch (e) {
      notify(e?.message || "No se pudo desvincular", "error");
    } finally {
      setUnlinking(false);
    }
  };

  // Polling para detectar cambios tras importación
  const refreshUntilChange = React.useCallback(
    async (prevTotal) => {
      const attempts = 6;
      for (let i = 0; i < attempts; i++) {
        try {
          const delay = 800 + i * 800;
          await new Promise((r) => setTimeout(r, delay));
          const { items, tot } = await fetchPayments();
          if (
            tot !== prevTotal ||
            (items?.length &&
              rows?.length &&
              items[0]?.mpPaymentId !== rows[0]?.mpPaymentId)
          ) {
            setRows(items);
            setTotal(tot);
            setSelected([]);
            return true;
          }
        } catch {
          // ignoramos y seguimos intentando
        }
      }
      return false;
    },
    [fetchPayments, rows]
  );

  // handleImport adaptado para usar polling
  const handleImport = async (args) => {
    try {
      const prevTotal = total;
      if (args.mode === "period") {
        await mpApi.importPaymentsByMonth({
          month: args.month,
          year: args.year,
        });
      } else {
        await mpApi.importPaymentById(args.paymentId);
      }
      notify("Importación solicitada. Buscando cambios…");
      setImportOpen(false);
      setPage(0);
      await loadPayments();
      const changed = await refreshUntilChange(prevTotal);
      if (!changed) {
        notify(
          "No se detectaron cambios aún. Probá refrescar en unos segundos.",
          "warning"
        );
      }
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

  const handleRefresh = () => {
    setPage(0);
    loadPayments();
  };

  // ===== Exportar a Excel (.xls - XML 2003) =====
  const handleExport = () => {
    // 1) Fuente: seleccionados si hay; si no, filas visibles
    const data = selected.length
      ? rows.filter((r) => selected.includes(r.mpPaymentId))
      : rows;

    if (!data.length) {
      notify("No hay datos para exportar", "warning");
      return;
    }

    // 2) Columnas (mismo orden que la tabla)
    const headers = [
      "Fecha",
      "Payment ID",
      "Detalle",
      "Comprador",
      "Comprobante",
      "Estado",
      "Total",
      "Moneda",
      "Orden/Referencia",
      "Link",
    ];

    // 3) Helpers
    const fmtDate = (v) => {
      if (!v) return "";
      const d = new Date(v);
      const hasTime = d.getHours() + d.getMinutes() + d.getSeconds() !== 0;
      return hasTime
        ? d.toLocaleString("es-AR")
        : d.toLocaleDateString("es-AR");
    };
    const xmlEscape = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    // 4) Transformar filas a celdas tipadas (Texto vs Número)
    const rowsXml = data
      .map((r) => {
        const cells = [
          { t: "String", v: fmtDate(r.fecha || r.date) },
          { t: "String", v: r.mpPaymentId || r.id || "" },
          { t: "String", v: r.detalle || r.description || "" },
          { t: "String", v: r.comprador || r.buyer || "" },
          { t: "String", v: r.comprobante || r.receipt || "" },
          { t: "String", v: r.estado || r.status || "" },
          // Total: si es número => Number; si viene string => lo dejamos texto
          (() => {
            const n = r.total ?? r.amount;
            const val = typeof n === "number" ? n : Number(n);
            return Number.isFinite(val)
              ? { t: "Number", v: val }
              : { t: "String", v: n ?? "" };
          })(),
          { t: "String", v: r.moneda || r.currency || "ARS" },
          { t: "String", v: r.externalReference || r.orderId || "" },
          { t: "String", v: r.permalink || r.init_point || "" },
        ]
          .map((c) => {
            if (c.t === "Number") {
              return `<Cell><Data ss:Type="Number">${c.v}</Data></Cell>`;
            }
            return `<Cell><Data ss:Type="String">${xmlEscape(
              c.v
            )}</Data></Cell>`;
          })
          .join("");
        return `<Row>${cells}</Row>`;
      })
      .join("");

    // 5) Encabezados XML Spreadsheet 2003
    const headersXml =
      "<Row>" +
      headers
        .map(
          (h) => `<Cell><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`
        )
        .join("") +
      "</Row>";

    const worksheetName = "Pagos_MP";
    const xml =
      `<?xml version="1.0"?>` +
      `<?mso-application progid="Excel.Sheet"?>` +
      `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ` +
      `xmlns:o="urn:schemas-microsoft-com:office:office" ` +
      `xmlns:x="urn:schemas-microsoft-com:office:excel" ` +
      `xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">` +
      `<Worksheet ss:Name="${xmlEscape(worksheetName)}">` +
      `<Table>` +
      headersXml +
      rowsXml +
      `</Table>` +
      `</Worksheet>` +
      `</Workbook>`;

    // 6) Descargar .xls (Excel abre directo)
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pagos_mp_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
  };
  // ===== Fin exportar =====

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3, px: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          borderRadius: 2,
          p: 1,
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? "background.default"
              : "background.paper",
        }}
      >
        <MpToolbar
          accountLabel={accountLabel}
          filters={filters}
          onFiltersChange={setFilters}
          onOpenImport={() => setImportOpen(true)}
          onOpenConfig={() => setConfigOpen(true)}
          onUnlink={handleUnlink}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onBillSelected={handleBill}
          selectedCount={selected.length}
          unlinkBusy={unlinking}
        />
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
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
          setPage(0);
          loadPayments();
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
