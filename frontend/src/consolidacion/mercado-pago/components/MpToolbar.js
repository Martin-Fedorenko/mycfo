import React from "react";
import {
  Toolbar,
  Stack,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import IosShareIcon from "@mui/icons-material/IosShare";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { PAYMENT_STATUS } from "../catalogs";

export default function MpToolbar({
  accountLabel,
  filters,
  onFiltersChange,
  onOpenImport,
  onOpenConfig,
  onUnlink,
  onRefresh,
  onExport,
  onBillSelected,
  selectedCount = 0,
  unlinkBusy = false, // <-- nuevo: deshabilita el botón mientras corre
}) {
  const set = (patch) => onFiltersChange({ ...filters, ...patch });

  const handleReset = () => {
    // Reset suave: limpia solo si hay algo cargado
    if (filters.from || filters.to || filters.payStatus || filters.q) {
      onFiltersChange({ from: "", to: "", payStatus: "", q: "" });
    }
  };

  return (
    <Toolbar
      sx={{
        p: 2,
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        "& .MuiTextField-root": { minWidth: { xs: "100%", sm: 180 } },
      }}
    >
      {/* Identificación de cuenta */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 1 }}>
        <Chip label={accountLabel} color="primary" variant="outlined" />
      </Stack>

      {/* Filtros */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{ flexGrow: 1 }}
      >
        <TextField
          size="small"
          type="date"
          label="Desde"
          InputLabelProps={{ shrink: true }}
          value={filters.from}
          onChange={(e) => set({ from: e.target.value })}
        />
        <TextField
          size="small"
          type="date"
          label="Hasta"
          InputLabelProps={{ shrink: true }}
          value={filters.to}
          onChange={(e) => set({ to: e.target.value })}
        />
        {/* Filtro de estado oculto temporalmente */}
        {/* <TextField
          size="small"
          select
          label="Estado"
          sx={{ minWidth: 160 }}
          value={filters.payStatus}
          onChange={(e) => set({ payStatus: e.target.value })}
        >
          <MenuItem value="">Todos</MenuItem>
          {PAYMENT_STATUS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField> */}
        <TextField
          size="small"
          label="Buscar"
          placeholder="ID, comprador, comprobante, detalle…"
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          sx={{ minWidth: { xs: "100%", sm: 260 } }}
        />
        <Tooltip title="Limpiar filtros">
          <span>
            <IconButton
              onClick={handleReset}
              disabled={
                !(filters.from || filters.to || filters.payStatus || filters.q)
              }
            >
              <FilterListOffIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Botón de refrescar oculto temporalmente */}
        {/* <Tooltip title="Refrescar">
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip> */}

        <Tooltip title="Configuración">
          <IconButton onClick={onOpenConfig}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={unlinkBusy ? "Desvinculando..." : "Desvincular"}>
          <span>
            <IconButton color="error" onClick={onUnlink} disabled={unlinkBusy}>
              <LinkOffIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Acciones */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Divider flexItem orientation="vertical" />
        <Button
          variant="contained"
          startIcon={<CloudDownloadIcon />}
          onClick={onOpenImport}
        >
          Importar
        </Button>
        {/* Botones de facturar y exportar ocultos temporalmente */}
        {/* <Button
          variant="contained"
          color="inherit"
          startIcon={<ReceiptLongIcon />}
          disabled={!selectedCount}
          onClick={onBillSelected}
          sx={{
            bgcolor: "#fff",
            color: "#222",
            boxShadow: 1,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          Facturar ({selectedCount})
        </Button>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<IosShareIcon />}
          onClick={onExport}
          sx={{
            bgcolor: "#fff",
            color: "#222",
            boxShadow: 1,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          Exportar
        </Button> */}
      </Box>
    </Toolbar>
  );
}
