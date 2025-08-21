import React from "react";
import { Box, Stack, TextField, Button, MenuItem } from "@mui/material";

export default function MpToolbar({
  accountId,
  from,
  to,
  q,
  onChange,
  onOpenImport,
  onOpenConfig,
  onFacturar,
  disableFacturar,
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ my: 2, flexWrap: "wrap" }}
    >
      <TextField
        select
        label="Cuenta MP"
        value={accountId ?? ""}
        onChange={(e) =>
          onChange({
            accountId: e.target.value ? Number(e.target.value) : undefined,
            from,
            to,
            q,
          })
        }
        sx={{ minWidth: 220 }}
      >
        {/* TODO: poblar con cuentas reales del backend */}
        <MenuItem value={1}>Cuenta MP (Demo)</MenuItem>
      </TextField>

      <TextField
        label="Desde"
        type="date"
        value={from || ""}
        onChange={(e) => onChange({ accountId, from: e.target.value, to, q })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Hasta"
        type="date"
        value={to || ""}
        onChange={(e) => onChange({ accountId, from, to: e.target.value, q })}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Buscar"
        value={q || ""}
        onChange={(e) => onChange({ accountId, from, to, q: e.target.value })}
        placeholder="Número, detalle o comprador"
        sx={{ minWidth: 280 }}
      />

      <Box sx={{ flex: 1 }} />
      <Button variant="outlined" onClick={onOpenConfig}>
        Configurar
      </Button>
      <Button variant="contained" onClick={onOpenImport}>
        Importar
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={onFacturar}
        disabled={disableFacturar}
      >
        Facturar
      </Button>
    </Stack>
  );
}
