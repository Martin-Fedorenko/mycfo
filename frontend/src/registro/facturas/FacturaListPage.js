import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  DataGrid,
  GridToolbar,
} from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import FormFactura from "../carga-general/components/forms/FormFactura";
import {
  fetchFacturas,
  deleteFactura,
  updateFactura,
} from "./api/facturasService";
import { formatCurrencyAR } from "../../utils/formatters";
import SuccessSnackbar from "../../shared-components/SuccessSnackbar";
import API_CONFIG from "../../config/api-config";

const FACTURA_PAGE_SIZE = 250;

const FacturaListPage = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("view"); // view | edit
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [facturaToDelete, setFacturaToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [successSnackbar, setSuccessSnackbar] = useState({ open: false, message: "" });
  const [usuarioRol, setUsuarioRol] = useState(null);

  const loadFacturas = useCallback(async () => {
    setLoading(true);
    try {
      console.debug("[FacturaListPage] Fetching facturas with filters:", filters);
      const data = await fetchFacturas({
        page: 0,
        size: FACTURA_PAGE_SIZE,
        ...filters,
      });
      console.debug("[FacturaListPage] Respuesta facturas:", data);
      setFacturas(data.content ?? []);
    } catch (error) {
      console.error("Error cargando facturas", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error?.response?.data?.mensaje || error?.message || "No pudimos cargar las facturas.",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const cargarRolUsuario = useCallback(() => {
    const sub = sessionStorage.getItem("sub");
    if (!sub) return;
    fetch(`${API_CONFIG.ADMINISTRACION}/api/usuarios/perfil`, {
      headers: { "X-Usuario-Sub": sub },
    })
      .then((res) => res.json())
      .then((data) => setUsuarioRol(data.rol))
      .catch((err) => console.error("Error cargando rol:", err));
  }, []);

  useEffect(() => {
    loadFacturas();
    cargarRolUsuario();
  }, [loadFacturas, cargarRolUsuario]);

  const requiredFields = useMemo(
    () => [
      "numeroDocumento",
      "versionDocumento",
      "tipoFactura",
      "fechaEmision",
      "montoTotal",
      "moneda",
      "vendedorNombre",
      "compradorNombre",
    ],
    []
  );

  const initialState = useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: FACTURA_PAGE_SIZE } },
      sorting: { sortModel: [{ field: "fechaEmision", sort: "desc" }] },
    }),
    []
  );

  const validarFormulario = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      const value = formData[field];
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (value?.isValid && typeof value.isValid === "function" && !value.isValid())
      ) {
        newErrors[field] = "Campo obligatorio";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerFactura = (factura) => {
    setSelectedFactura(factura);
    setFormData({
      ...factura,
      fechaEmision: factura.fechaEmision ? dayjs(factura.fechaEmision) : null,
    });
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditarFactura = (factura) => {
    setSelectedFactura(factura);
    setFormData({
      ...factura,
      fechaEmision: factura.fechaEmision ? dayjs(factura.fechaEmision) : null,
    });
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleGuardarCambios = async () => {
    if (!selectedFactura) return;
    if (!validarFormulario()) {
      setSnackbar({
        open: true,
        severity: "warning",
        message: "Por favor completa todos los campos obligatorios.",
      });
      return;
    }

    try {
      const facturaId = selectedFactura.id ?? selectedFactura.idDocumento;
      if (!facturaId) {
        throw new Error("La factura seleccionada no tiene identificador.");
      }
      await updateFactura(facturaId, formData);
      setSuccessSnackbar({ open: true, message: "Factura actualizada correctamente." });
      setDialogOpen(false);
      loadFacturas();
    } catch (error) {
      console.error("Error actualizando factura", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error?.response?.data?.mensaje || error?.message || "No pudimos actualizar la factura.",
      });
    }
  };

  const handleEliminarFactura = async () => {
    if (!facturaToDelete) return;
    try {
      const facturaId = facturaToDelete.id ?? facturaToDelete.idDocumento;
      if (!facturaId) {
        throw new Error("La factura seleccionada no tiene identificador.");
      }
      await deleteFactura(facturaId);
      setSuccessSnackbar({ open: true, message: "Factura eliminada correctamente." });
      setDeleteConfirmOpen(false);
      setFacturaToDelete(null);
      loadFacturas();
    } catch (error) {
      console.error("Error al eliminar factura", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error?.response?.data?.mensaje || error?.message || "No pudimos eliminar la factura.",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFactura(null);
    setErrors({});
  };

  const handleCloseSnackbar = (_event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ open: false, message: "", severity: "info" });
  };

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbar({ open: false, message: "" });
  };

  const columns = useMemo(
    () => [
      {
        field: "numeroDocumento",
        headerName: "Número",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "tipoFactura",
        headerName: "Tipo",
        flex: 0.6,
        minWidth: 100,
        renderCell: (params) => (
          <Chip
            label={params.value ?? "-"}
            size="small"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        field: "fechaEmision",
        headerName: "Fecha emisión",
        flex: 0.7,
        minWidth: 160,
        valueFormatter: (params) =>
          params.value ? dayjs(params.value).format("DD/MM/YYYY HH:mm") : "-",
      },
      {
        field: "montoTotal",
        headerName: "Monto",
        flex: 1,
        minWidth: 140,
        renderCell: (params) =>
          params.row.montoTotal != null
            ? formatCurrencyAR(params.row.montoTotal)
            : "-",
      },
      {
        field: "moneda",
        headerName: "Moneda",
        flex: 0.5,
        minWidth: 90,
      },
      {
        field: "estadoPago",
        headerName: "Estado de pago",
        flex: 0.8,
        minWidth: 140,
        hide: true,
        renderCell: (params) => (
          <Chip
            label={params.value ?? "NO_PAGADO"}
            size="small"
            color={
              params.value === "PAGADO"
                ? "success"
                : params.value === "PARCIALMENTE_PAGADO"
                ? "warning"
                : "default"
            }
          />
        ),
      },
      {
        field: "vendedorNombre",
        headerName: "Vendedor",
        flex: 1.2,
        minWidth: 160,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2">{params.value ?? "-"}</Typography>
          </Box>
        ),
      },
      {
        field: "compradorNombre",
        headerName: "Comprador",
        flex: 1.2,
        minWidth: 160,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2">{params.value ?? "-"}</Typography>
          </Box>
        ),
      },
      {
        field: "acciones",
        headerName: "Acciones",
        flex: 0.7,
        minWidth: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const isAdmin = (usuarioRol || "").toUpperCase().includes("ADMIN");
          return (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                color="info"
                onClick={() => handleVerFactura(params.row)}
                title="Ver detalles"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
              {isAdmin && (
                <>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditarFactura(params.row)}
                    title="Editar"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setFacturaToDelete(params.row);
                      setDeleteConfirmOpen(true);
                    }}
                    title="Eliminar"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          );
        },
      },
    ],
    [usuarioRol]
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}
      >
        Facturas
      </Typography>

      <Box sx={{ height: 700, width: "100%", mt: 2 }}>
        <DataGrid
          rows={facturas}
          columns={columns}
          loading={loading}
          getRowId={(row) =>
            row.id ?? row.idDocumento ?? `${row.numeroDocumento}-${row.fechaEmision}`
          }
          pageSizeOptions={[25, 50, 100, 250]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: "fechaEmision", sort: "desc" }] },
            columns: {
              columnVisibilityModel: {
                estadoPago: false,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #e0e0e0",
              borderRight: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-cell:last-of-type": {
              borderRight: "none",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontSize: "0.95rem",
              borderTop: "1px solid #e0e0e0",
              borderBottom: "1px solid #e0e0e0",
            },
            "& .MuiDataGrid-columnHeader": {
              borderLeft: "1px solid #e0e0e0",
              borderRight: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box",
            },
            "& .MuiDataGrid-columnHeader:first-of-type": {
              borderLeft: "none",
            },
            "& .MuiDataGrid-columnHeader:last-of-type": {
              borderRight: "none",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 700,
            },
            "& .MuiDataGrid-columnSeparator": {
              opacity: 1,
              visibility: "visible",
              color: "#d5d5d5",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            },
            "& .MuiDataGrid-sortIcon": {
              display: "none",
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              paddingRight: "8px",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer": {
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            "& .MuiDataGrid-columnHeader .MuiIconButton-root": {
              padding: "4px",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            "& .MuiDataGrid-menuIcon": {
              fontSize: "16px",
              display: "block !important",
            },
            "& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer .MuiIconButton-root:not([aria-label*='menu'])": {
              display: "none",
            },
          }}
        />
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {dialogMode === "edit" ? "Editar factura" : "Detalle de factura"}
        </DialogTitle>
        <DialogContent dividers>
          {selectedFactura ? (
            <FormFactura
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              modoEdicion={dialogMode === "edit"}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            {dialogMode === "edit" ? "Cancelar" : "Cerrar"}
          </Button>
          {dialogMode === "edit" && (
            <Button onClick={handleGuardarCambios} variant="contained">
              Guardar cambios
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Eliminar factura</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ¿Seguro que querés eliminar la factura{" "}
            <strong>{facturaToDelete?.numeroDocumento}</strong>? Esta acción no
            se puede deshacer.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleEliminarFactura}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <SuccessSnackbar
        open={successSnackbar.open}
        message={successSnackbar.message}
        onClose={handleCloseSuccessSnackbar}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacturaListPage;


