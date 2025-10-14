import React, { useEffect, useState } from "react";
import {
  Box, Typography, Chip, IconButton
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WalletIcon from "@mui/icons-material/Wallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

export default function TablaRegistrosV2() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usuarioRol, setUsuarioRol] = useState(null);
  const API_BASE = process.env.REACT_APP_URL_REGISTRO;

  useEffect(() => {
    cargarMovimientos();
    cargarRolUsuario();
  }, []);

  const cargarRolUsuario = () => {
    // Obtener rol del usuario desde sessionStorage o hacer petición al backend
    const sub = sessionStorage.getItem("sub");
    if (sub) {
      // Aquí podrías hacer una petición al backend para obtener el rol
      // Por ahora, lo obtenemos de los datos del usuario si están disponibles
      fetch(`http://localhost:8081/api/usuarios/perfil`, {
        headers: { "X-Usuario-Sub": sub }
      })
        .then(res => res.json())
        .then(data => setUsuarioRol(data.rol))
        .catch(err => console.error("Error cargando rol:", err));
    }
  };

  const handleEditarMovimiento = (movimiento) => {
    // TODO: Implementar la edición de movimientos
    console.log("Editar movimiento:", movimiento);
    alert(`Funcionalidad de edición para movimiento ${movimiento.id} (próximamente)`);
  };

  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const organizacionId = sessionStorage.getItem("organizacionId") || "1";
      const params = {
        organizacionId,
        page: 0,
        size: 1000, // Cargamos todos para filtrado client-side
        sortBy: "fechaEmision",
        sortDir: "desc"
      };

      const response = await axios.get(`${API_BASE}/movimientos/organizacion/${organizacionId}`, { params });
      console.log("📊 Datos recibidos del backend:", response.data);
      console.log("📊 Content:", response.data.content);
      setMovimientos(response.data.content || []);
    } catch (error) {
      console.error("Error cargando movimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helpers para chips estilizados
  const getTipoColor = (tipo) => {
    if (tipo === "Ingreso") return "#2e7d32";
    if (tipo === "Egreso") return "#d32f2f";
    if (tipo === "Obligacion") return "#ed6c02";
    if (tipo === "Acreencia") return "#0288d1";
    return "#757575";
  };

  const getTipoIcon = (tipo) => {
    if (tipo === "Ingreso") return <TrendingUpIcon fontSize="small" />;
    if (tipo === "Egreso") return <TrendingDownIcon fontSize="small" />;
    if (tipo === "Obligacion") return <AccountBalanceIcon fontSize="small" />;
    if (tipo === "Acreencia") return <WalletIcon fontSize="small" />;
    return null;
  };

  const getMonedaColor = (moneda) => {
    if (moneda === "ARS") return "#1976d2";
    if (moneda === "USD") return "#2e7d32";
    if (moneda === "EUR") return "#ed6c02";
    return "#757575";
  };

  // Definir columnas para DataGrid
  const columns = [
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        if (!params || !params.value) {
          return (
            <Chip
              label="Sin tipo"
              size="small"
              sx={{
                backgroundColor: "#75757515",
                color: "#757575",
                fontWeight: 600,
                border: "1px solid #757575",
                fontSize: "0.8125rem",
              }}
            />
          );
        }
        const tipo = params.value;
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
            }}
          />
        );
      },
    },
    {
      field: "montoTotal",
      headerName: "Monto",
      flex: 0.7,
      minWidth: 100,
      type: "number",
      valueFormatter: (params) => {
        if (!params || params.value === null || params.value === undefined) return "$0";
        return new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(Math.abs(params.value));
      },
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 0.5,
      minWidth: 80,
      renderCell: (params) => {
        if (!params) return "-";
        const moneda = params.value || "-";
        return (
          <Chip
            label={moneda}
            size="small"
            sx={{
              backgroundColor: `${getMonedaColor(moneda)}15`,
              color: getMonedaColor(moneda),
              fontWeight: 600,
              border: `1px solid ${getMonedaColor(moneda)}`,
            }}
          />
        );
      },
    },
    {
      field: "fechaEmision",
      headerName: "Fecha",
      flex: 0.6,
      minWidth: 100,
      type: "date",
      valueGetter: (params) => {
        if (!params || !params.value) return null;
        try {
          return new Date(params.value);
        } catch (e) {
          return null;
        }
      },
      valueFormatter: (params) => {
        if (!params || !params.value) return "-";
        try {
          return params.value.toLocaleDateString("es-AR");
        } catch (e) {
          return "-";
        }
      },
    },
        {
          field: "estado",
          headerName: "Estado",
          flex: 0.8,
          minWidth: 120,
          renderCell: (params) => {
            if (!params || !params.value) return "-";
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
        if (!params || !params.value) return "-";
        return (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: "0.75rem" }}
          />
        );
      },
    },
    {
      field: "origenNombre",
      headerName: "Origen",
      flex: 1,
      minWidth: 130,
      valueGetter: (params) => {
        if (!params || params.value === null || params.value === undefined) return "-";
        return params.value;
      },
    },
    {
      field: "destinoNombre",
      headerName: "Destino",
      flex: 1,
      minWidth: 130,
      valueGetter: (params) => {
        if (!params || params.value === null || params.value === undefined) return "-";
        return params.value;
      },
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => {
        if (!params || params.value === null || params.value === undefined) return "-";
        return params.value;
      },
    },
        {
          field: "acciones",
          headerName: "Acciones",
          flex: 0.5,
          minWidth: 80,
          sortable: false,
          filterable: false,
          renderCell: (params) => {
            // Solo mostrar botón editar si es administrador
            if (usuarioRol !== "ADMINISTRADOR") return null;
            
            return (
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => handleEditarMovimiento(params.row)}
              >
                <EditIcon />
              </IconButton>
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
            columns: {
              columnVisibilityModel: {
                descripcion: true,
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
          autoHeight={false}
          sx={{
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              fontSize: "0.95rem",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            },
          }}
        />
      </Box>
    </Box>
  );
}

