// /mercado-pago/components/MpToolbar.js
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
}) {
  const set = (patch) => onFiltersChange({ ...filters, ...patch });

  return (
    <Toolbar sx={{ p: 2, gap: 2, flexWrap: "wrap" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 2 }}>
        <Chip label={accountLabel} color="primary" variant="outlined" />
      </Stack>

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
      <TextField
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
      </TextField>
      <TextField
        size="small"
        label="Buscar"
        placeholder="ID, comprador, comprobante, detalle…"
        value={filters.q}
        onChange={(e) => set({ q: e.target.value })}
        sx={{ minWidth: 260 }}
      />

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title="Refrescar">
        <IconButton onClick={onRefresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>

      <Divider flexItem orientation="vertical" />

      <Button startIcon={<CloudDownloadIcon />} onClick={onOpenImport}>
        Importar
      </Button>
      <Button
        startIcon={<ReceiptLongIcon />}
        disabled={!selectedCount}
        onClick={onBillSelected}
      >
        Facturar ({selectedCount})
      </Button>
      <Button startIcon={<IosShareIcon />} onClick={onExport}>
        Exportar
      </Button>
      <Tooltip title="Configuración">
        <IconButton onClick={onOpenConfig}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Desvincular">
        <IconButton color="error" onClick={onUnlink}>
          <LinkOffIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}
