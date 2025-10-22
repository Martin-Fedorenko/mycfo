import React, { useEffect, useState } from "react";
import {
  Box, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, Grid, TextField, Alert, FormLabel, FormHelperText, OutlinedInput
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WalletIcon from "@mui/icons-material/Wallet";
import axios from "axios";
import API_CONFIG from "../../config/api-config";
import CustomSelect from "../../shared-components/CustomSelect";
import CustomDatePicker from "../../shared-components/CustomDatePicker";
import CustomSingleAutoComplete from "../../shared-components/CustomSingleAutoComplete";
import { TODAS_LAS_CATEGORIAS } from "../../shared-components/categorias";
import dayjs from "dayjs";
import FormIngreso from "../carga-general/components/forms/FormIngreso";
import FormEgreso from "../carga-general/components/forms/FormEgreso";
import FormDeuda from "../carga-general/components/forms/FormDeuda";
import FormAcreencia from "../carga-general/components/forms/FormAcreencia";
import VerIngreso from "./components/VerIngreso";
import VerEgreso from "./components/VerEgreso";
import VerDeuda from "./components/VerDeuda";
import VerAcreencia from "./components/VerAcreencia";

export default function TablaRegistrosV2() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usuarioRol, setUsuarioRol] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("view"); // "view" o "edit"
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [movimientoToDelete, setMovimientoToDelete] = useState(null);
  
  const API_BASE = API_CONFIG.REGISTRO;

  // Campos obligatorios por tipo de movimiento
  const requiredFieldsMap = {
    Movimiento: ["montoTotal", "moneda", "medioPago", "fechaEmision"],
    Ingreso: ["montoTotal", "moneda", "fechaEmision"],
    Egreso: ["montoTotal", "moneda", "fechaEmision"],
    Deuda: ["montoTotal", "moneda", "fechaEmision"],
    Acreencia: ["montoTotal", "moneda", "fechaEmision"],
  };

  useEffect(() => {
    cargarMovimientos();
    cargarRolUsuario();
  }, []);

  const cargarRolUsuario = () => {
    const sub = sessionStorage.getItem("sub");
    if (sub) {
      fetch(`${API_CONFIG.ADMINISTRACION}/api/usuarios/perfil`, {
        headers: { "X-Usuario-Sub": sub }
      })
        .then(res => res.json())
        .then(data => setUsuarioRol(data.rol))
        .catch(err => console.error("Error cargando rol:", err));
    }
  };

  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const usuarioSub = sessionStorage.getItem("sub");
      
      if (!usuarioSub) {
        console.error("No se encontró sub de usuario en la sesión");
        alert("Error: No se encontró usuario en la sesión");
        return;
      }

      const headers = { "X-Usuario-Sub": usuarioSub };
      const params = {
        page: 0,
        size: 1000,
        sortBy: "fechaEmision",
        sortDir: "desc"
      };

      console.log("📡 Obteniendo movimientos para usuario:", usuarioSub);
      
      const response = await axios.get(`${API_BASE}/movimientos`, { headers, params });
      
      console.log("📊 Datos recibidos del backend:", response.data);
      setMovimientos(response.data.content || []);
    } catch (error) {
      console.error("Error cargando movimientos:", error);
      alert("Error al cargar movimientos: " + (error.response?.data?.mensaje || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Abrir dialog para VER movimiento
  const handleVerMovimiento = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setDialogMode("view");
    setDialogOpen(true);
  };

  // Abrir dialog para EDITAR movimiento
  const handleEditarMovimiento = (movimiento) => {
    setSelectedMovimiento(movimiento);
    
    // Convertir datos del movimiento al formato que esperan los formularios
    // El tipo se mantiene en selectedMovimiento para determinar qué formulario renderizar
    const formDataConvertido = {
      montoTotal: movimiento.montoTotal || "",
      moneda: movimiento.moneda || "ARS", // Valor por defecto para moneda
      fechaEmision: movimiento.fechaEmision ? dayjs(movimiento.fechaEmision) : null,
      categoria: movimiento.categoria || "",
      origenNombre: movimiento.origenNombre || "",
      origenCuit: movimiento.origenCuit || "",
      destinoNombre: movimiento.destinoNombre || "",
      destinoCuit: movimiento.destinoCuit || "",
      descripcion: movimiento.descripcion || "",
      medioPago: movimiento.medioPago || "", // Mantener string vacío para el formulario
      estado: movimiento.estado || ""
      // NO incluir 'tipo' aquí para que no se pueda modificar en el formulario
    };
    
    console.log("📝 Datos convertidos para edición:", formDataConvertido);
    setFormData(formDataConvertido);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  // Función para validar campos obligatorios
  const validarCamposObligatorios = () => {
    const tipoMovimiento = selectedMovimiento?.tipo || "Movimiento";
    const requiredFields = requiredFieldsMap[tipoMovimiento] || requiredFieldsMap["Movimiento"];
    const newErrors = {};

    requiredFields.forEach((field) => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === "")) {
        newErrors[field] = "Campo obligatorio";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar cambios al editar
  const handleGuardarCambios = async () => {
    // Validar campos obligatorios antes de enviar
    if (!validarCamposObligatorios()) {
      alert("⚠️ Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      const usuarioSub = sessionStorage.getItem("sub");
      const headers = { "X-Usuario-Sub": usuarioSub };
      
      // Convertir datos del formulario al formato del backend
      // IMPORTANTE: Incluir el tipo del selectedMovimiento para que no se envíe vacío
      const { tipo, ...formDataSinTipo } = formData;
      
      const datosParaBackend = {
        ...formDataSinTipo,
        tipo: selectedMovimiento.tipo, // ✅ Usar el tipo original del movimiento
        fechaEmision: formData.fechaEmision ? formData.fechaEmision.format('YYYY-MM-DD') : null,
        // Limpiar campos vacíos que pueden causar problemas con enums
        medioPago: formData.medioPago && formData.medioPago.trim() !== "" ? formData.medioPago : null,
        categoria: formData.categoria && formData.categoria.trim() !== "" ? formData.categoria : null,
        origenNombre: formData.origenNombre && formData.origenNombre.trim() !== "" ? formData.origenNombre : null,
        origenCuit: formData.origenCuit && formData.origenCuit.trim() !== "" ? formData.origenCuit : null,
        destinoNombre: formData.destinoNombre && formData.destinoNombre.trim() !== "" ? formData.destinoNombre : null,
        destinoCuit: formData.destinoCuit && formData.destinoCuit.trim() !== "" ? formData.destinoCuit : null,
        descripcion: formData.descripcion && formData.descripcion.trim() !== "" ? formData.descripcion : null
      };
      
      console.log("📤 Enviando datos al backend:", datosParaBackend);
      
      await axios.put(
        `${API_BASE}/movimientos/${selectedMovimiento.id}`,
        datosParaBackend,
        { headers }
      );
      
      alert("✅ Movimiento actualizado exitosamente");
      setDialogOpen(false);
      setErrors({}); // Limpiar errores
      cargarMovimientos(); // Recargar datos
    } catch (error) {
      console.error("Error actualizando movimiento:", error);
      console.error("Datos enviados:", formData);
      alert("❌ Error al actualizar: " + (error.response?.data?.mensaje || error.message));
    }
  };

  // Abrir confirmación de eliminación
  const handleEliminarClick = (movimiento) => {
    setMovimientoToDelete(movimiento);
    setDeleteConfirmOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmarEliminacion = async () => {
    try {
      const usuarioSub = sessionStorage.getItem("sub");
      const headers = { "X-Usuario-Sub": usuarioSub };
      
      await axios.delete(
        `${API_BASE}/movimientos/${movimientoToDelete.id}`,
        { headers }
      );
      
      alert("✅ Movimiento eliminado exitosamente");
      setDeleteConfirmOpen(false);
      setMovimientoToDelete(null);
      cargarMovimientos(); // Recargar datos
    } catch (error) {
      console.error("Error eliminando movimiento:", error);
      alert("❌ Error al eliminar: " + (error.response?.data?.mensaje || error.message));
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMovimiento(null);
    setFormData({});
    setErrors({}); // Limpiar errores al cerrar
  };

  // Función para renderizar el formulario correcto según el tipo de movimiento
  const renderFormularioMovimiento = () => {
    if (!selectedMovimiento) return null;

    console.log("🔍 Renderizando movimiento:", selectedMovimiento);
    console.log("🔍 Tipo de movimiento:", selectedMovimiento.tipo);
    console.log("🔍 Modo del diálogo:", dialogMode);

    // Si es modo "view", usar componentes de visualización
    if (dialogMode === "view") {
      const tipoUpper = selectedMovimiento.tipo?.toUpperCase();
      console.log("🔍 Tipo normalizado:", tipoUpper);
      
      switch (tipoUpper) {
        case "INGRESO":
          return <VerIngreso movimiento={selectedMovimiento} />;
        case "EGRESO":
          return <VerEgreso movimiento={selectedMovimiento} />;
        case "DEUDA":
          return <VerDeuda movimiento={selectedMovimiento} />;
        case "ACREENCIA":
          return <VerAcreencia movimiento={selectedMovimiento} />;
        default:
          console.error("❌ Tipo de movimiento no reconocido:", selectedMovimiento.tipo);
          return (
            <Box sx={{ p: 2 }}>
              <Typography color="error">
                Visualización no disponible para este tipo de movimiento: "{selectedMovimiento.tipo}"
              </Typography>
              <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                Tipos soportados: INGRESO, EGRESO, DEUDA, ACREENCIA
              </Typography>
            </Box>
          );
      }
    }

    // Si es modo "edit", usar formularios editables
    // Convertir fechaEmision a dayjs si es necesario
    const movimientoConFechaConvertida = {
      ...selectedMovimiento,
      fechaEmision: selectedMovimiento.fechaEmision 
        ? (typeof selectedMovimiento.fechaEmision === 'string' 
            ? dayjs(selectedMovimiento.fechaEmision) 
            : selectedMovimiento.fechaEmision)
        : null
    };

    const tipoUpperEdit = selectedMovimiento.tipo?.toUpperCase();
    
    switch (tipoUpperEdit) {
      case "INGRESO":
        return (
          <FormIngreso
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            modoEdicion={dialogMode === "edit"}
            movimientoOriginal={movimientoConFechaConvertida}
          />
        );
      case "EGRESO":
        return (
          <FormEgreso
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            modoEdicion={dialogMode === "edit"}
            movimientoOriginal={movimientoConFechaConvertida}
          />
        );
      case "DEUDA":
        return (
          <FormDeuda
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            modoEdicion={dialogMode === "edit"}
            movimientoOriginal={movimientoConFechaConvertida}
          />
        );
      case "ACREENCIA":
        return (
          <FormAcreencia
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            modoEdicion={dialogMode === "edit"}
            movimientoOriginal={movimientoConFechaConvertida}
          />
        );
      default:
        console.error("❌ Formulario no disponible para tipo:", selectedMovimiento.tipo);
        return (
          <Box sx={{ p: 2 }}>
            <Typography color="error">
              Formulario no disponible para este tipo de movimiento: "{selectedMovimiento.tipo}"
            </Typography>
          </Box>
        );
    }
  };

  // Helpers para chips estilizados
  const getTipoColor = (tipo) => {
    if (tipo === "Ingreso") return "#2e7d32";
    if (tipo === "Egreso") return "#d32f2f";
    if (tipo === "Deuda") return "#ed6c02";
    if (tipo === "Acreencia") return "#0288d1";
    return "#757575";
  };

  const getTipoIcon = (tipo) => {
    if (tipo === "Ingreso") return <TrendingUpIcon fontSize="small" />;
    if (tipo === "Egreso") return <TrendingDownIcon fontSize="small" />;
    if (tipo === "Deuda") return <AccountBalanceIcon fontSize="small" />;
    if (tipo === "Acreencia") return <WalletIcon fontSize="small" />;
    return null;
  };

  const getMonedaColor = (moneda) => {
    if (moneda === "ARS") return "#1976d2";
    if (moneda === "USD") return "#2e7d32";
    if (moneda === "EUR") return "#ed6c02";
    return "#757575";
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    try {
      // Si la fecha viene como array [year, month, day]
      if (Array.isArray(fecha)) {
        const [year, month, day] = fecha;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
      // Si viene como string
      const date = new Date(fecha);
      return date.toLocaleDateString("es-AR");
    } catch (e) {
      return "-";
    }
  };

  // Formatear monto
  const formatearMonto = (monto, moneda = "ARS") => {
    if (monto === null || monto === undefined) return "$0";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda === "USD" ? "USD" : moneda === "EUR" ? "EUR" : "ARS",
      minimumFractionDigits: 2
    }).format(Math.abs(monto));
  };

  // Definir columnas para DataGrid
  const columns = [
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const tipo = params.value;
        if (!tipo) return <Chip label="Sin tipo" size="small" sx={{ height: "24px" }} />;
        const icon = getTipoIcon(tipo);
        const color = getTipoColor(tipo);
        return (
          <Chip
            icon={icon}
            label={tipo}
            size="small"
            sx={{
              backgroundColor: `${color}15`,
              color: color,
              fontWeight: 600,
              border: `1px solid ${color}`,
              fontSize: "0.8125rem",
              height: "24px", // Altura fija para alineación
            }}
          />
        );
      },
    },
    {
      field: "montoTotal",
      headerName: "Monto",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const monto = params.row.montoTotal;
        const moneda = params.row.moneda || "ARS";
        return (
          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: "24px" }}>
            {monto ? `${new Intl.NumberFormat("es-AR").format(Math.abs(monto))} ${moneda}` : "-"}
          </Typography>
        );
      },
    },
    {
      field: "fechaEmision",
      headerName: "Fecha",
      flex: 0.7,
      minWidth: 110,
      renderCell: (params) => {
        return (
          <Typography variant="body2" sx={{ lineHeight: "24px" }}>
            {formatearFecha(params.value)}
          </Typography>
        );
      },
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2" sx={{ lineHeight: "24px" }}>-</Typography>;
        const estado = params.value;
        const getEstadoColor = () => {
          if (estado === "COBRADO" || estado === "PAGADO") return "#4caf50";
          if (estado === "PENDIENTE") return "#ff9800";
          if (estado === "VENCIDO") return "#d32f2f";
          if (estado === "PARCIAL") return "#2196f3";
          return "#757575";
        };
        return (
          <Chip
            label={estado}
            size="small"
            sx={{
              backgroundColor: `${getEstadoColor()}15`,
              color: getEstadoColor(),
              fontWeight: 600,
              border: `1px solid ${getEstadoColor()}`,
              height: "24px", // Altura fija para alineación
            }}
          />
        );
      },
    },
    {
      field: "categoria",
      headerName: "Categoría",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2" sx={{ lineHeight: "24px" }}>-</Typography>;
        return (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: "0.75rem", height: "24px" }}
          />
        );
      },
    },
    {
      field: "origenNombre",
      headerName: "Origen",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        return <Typography variant="body2" sx={{ lineHeight: "24px" }}>{params.value || "-"}</Typography>;
      },
    },
    {
      field: "destinoNombre",
      headerName: "Destino",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        return <Typography variant="body2" sx={{ lineHeight: "24px" }}>{params.value || "-"}</Typography>;
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      minWidth: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton 
              size="small" 
              color="info"
              onClick={() => handleVerMovimiento(params.row)}
              title="Ver detalles"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleEditarMovimiento(params.row)}
              title="Editar"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleEliminarClick(params.row)}
              title="Eliminar"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 600, color: "#1976d2" }}>
        📊 Movimientos Financieros
      </Typography>

      <Box sx={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={movimientos}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: "fechaEmision", sort: "desc" }] },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          disableRowSelectionOnClick
          autoHeight={false}
          sx={{
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center", // Centrar verticalmente todo el contenido
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              fontSize: "0.95rem",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            },
            // Quitar completamente el botón de ordenar
            "& .MuiDataGrid-sortIcon": {
              display: "none",
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              paddingRight: "8px",
              display: "flex",
              alignItems: "center", // Alinear título con el botón de menú
            },
            "& .MuiDataGrid-columnHeader": {
              display: "flex",
              alignItems: "center", // Centrar todo el contenido del header
              justifyContent: "space-between", // Distribuir título y botón
              "& .MuiDataGrid-iconButtonContainer": {
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center", // Centrar el botón dentro de su contenedor
              },
              "& .MuiIconButton-root": {
                padding: "4px",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center", // Centrar el ícono dentro del botón
              },
            },
            // Mostrar solo el botón de menú (3 puntitos), ocultar flecha de ordenar
            "& .MuiDataGrid-menuIcon": {
              fontSize: "16px",
              display: "block !important", // Forzar mostrar el botón de menú
            },
            "& .MuiDataGrid-sortIcon": {
              display: "none !important", // Ocultar solo la flecha de ordenar
            },
            // Ocultar el ícono de ordenar pero mantener el contenedor del menú
            "& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer .MuiIconButton-root:not([aria-label*='menu'])": {
              display: "none",
            },
          }}
        />
      </Box>

      {/* Dialog para VER o EDITAR - Estilo exacto del formulario original */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 600 }}>
          {dialogMode === "view" ? "👁️ Ver Movimiento" : "✏️ Editar Movimiento"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedMovimiento && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
              {renderFormularioMovimiento()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
          >
            {dialogMode === "view" ? "Cerrar" : "Cancelar"}
          </Button>
          {dialogMode === "edit" && (
            <Button 
              onClick={handleGuardarCambios} 
              variant="contained" 
              color="primary"
            >
              Guardar Cambios
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para ELIMINAR */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>⚠️ Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ¿Estás seguro que deseas eliminar este movimiento?
          </Alert>
          {movimientoToDelete && (
            <Box>
              <Typography variant="body2">
                <strong>Tipo:</strong> {movimientoToDelete.tipo}
              </Typography>
              <Typography variant="body2">
                <strong>Monto:</strong> {formatearMonto(movimientoToDelete.montoTotal, movimientoToDelete.moneda)}
              </Typography>
              <Typography variant="body2">
                <strong>Fecha:</strong> {formatearFecha(movimientoToDelete.fechaEmision)}
              </Typography>
            </Box>
          )}
          <Alert severity="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmarEliminacion} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
