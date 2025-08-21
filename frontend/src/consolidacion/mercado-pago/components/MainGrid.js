import React from "react";
import { Container, Snackbar, Alert } from "@mui/material";
import MpToolbar from "./MpToolbar";
import MpImportDialog from "./MpImportDialog";
import MpConfigDialog from "./MpConfigDialog";
import MpPaymentsTable from "./MpPaymentsTable";
import { mpApi } from "../..//mercado-pago/mpApi";

export default function MainGrid({ status }) {
  const [filters, setFilters] = React.useState({
    accountId: 1,
    from: "",
    to: "",
    q: "",
  });
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [openImport, setOpenImport] = React.useState(false);
  const [openConfig, setOpenConfig] = React.useState(false);
  const [selection, setSelection] = React.useState([]);
  const [toast, setToast] = React.useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {
        accountId: filters.accountId,
        from: filters.from || undefined,
        to: filters.to || undefined,
        q: filters.q || undefined,
        page,
        size: pageSize,
        sort: "dateApproved,desc",
      };
      const res = await mpApi.getPayments(params);
      // Backend esperado: { content: [...], totalElements: n }
      setRows(res.content || []);
      setTotal(res.totalElements || 0);
    } catch (e) {
      setToast({ sev: "error", msg: "No se pudo cargar el listado" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), page, pageSize]);

  const onImportById = async (id) => {
    try {
      await mpApi.importById(id);
      setToast({ sev: "success", msg: "Importación completada" });
      fetchPayments();
    } catch {
      setToast({ sev: "error", msg: "Error importando el pago" });
    }
  };

  const onImportByMonth = async (m, y) => {
    try {
      await mpApi.importByMonth(m, y);
      setToast({ sev: "success", msg: "Importación por período completada" });
      fetchPayments();
    } catch {
      setToast({ sev: "error", msg: "Error importando el período" });
    }
  };

  const onFacturar = async () => {
    try {
      const res = await mpApi.facturar(selection);
      setSelection([]);
      setToast({
        sev: "success",
        msg: `Facturas creadas: ${res.creadas} | Omitidas: ${
          res.omitidas
        } | Errores: ${res.errores?.length || 0}`,
      });
      fetchPayments();
    } catch {
      setToast({ sev: "error", msg: "No se pudo facturar" });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <MpToolbar
        accountId={filters.accountId}
        from={filters.from}
        to={filters.to}
        q={filters.q}
        onChange={(next) => {
          setPage(0);
          setFilters((f) => ({ ...f, ...next }));
        }}
        onOpenImport={() => setOpenImport(true)}
        onOpenConfig={() => setOpenConfig(true)}
        onFacturar={onFacturar}
        disableFacturar={selection.length === 0}
      />

      <MpPaymentsTable
        rows={rows}
        rowCount={total}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSelectionChange={setSelection}
      />

      <MpImportDialog
        open={openImport}
        onClose={() => setOpenImport(false)}
        onImportById={onImportById}
        onImportByMonth={onImportByMonth}
      />

      <MpConfigDialog open={openConfig} onClose={() => setOpenConfig(false)} />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
      >
        {toast ? (
          <Alert severity={toast.sev} onClose={() => setToast(null)}>
            {toast.msg}
          </Alert>
        ) : null}
      </Snackbar>
    </Container>
  );
}
