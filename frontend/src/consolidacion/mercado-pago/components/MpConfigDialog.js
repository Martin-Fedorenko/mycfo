// /mercado-pago/components/MpConfigDialog.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { mpApi } from "../mpApi";

export default function MpConfigDialog({ open, onClose, onSaved }) {
  const [cfg, setCfg] = React.useState({
    autoBill: false,
    timezone: "America/Argentina/Buenos_Aires",
    currency: "ARS",
  });
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const load = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setErr(null);
    try {
      const c = await mpApi.getConfig();
      setCfg({
        autoBill: !!c?.autoBill,
        timezone: c?.timezone || "America/Argentina/Buenos_Aires",
        currency: c?.currency || "ARS",
      });
    } catch (e) {
      setErr(e?.message || "No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  }, [open]);

  React.useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await mpApi.updateConfig(cfg);
      onSaved?.();
    } catch (e) {
      setErr(e?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Configuración</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={cfg.autoBill}
                onChange={(e) => setCfg({ ...cfg, autoBill: e.target.checked })}
              />
            }
            label="Facturar automáticamente pagos aprobados"
          />
          <TextField
            label="Zona horaria"
            helperText="Ej.: America/Argentina/Buenos_Aires"
            value={cfg.timezone}
            onChange={(e) => setCfg({ ...cfg, timezone: e.target.value })}
            disabled={loading}
          />
          <TextField
            label="Moneda"
            value={cfg.currency}
            onChange={(e) =>
              setCfg({ ...cfg, currency: e.target.value.toUpperCase() })
            }
            disabled={loading}
            inputProps={{ maxLength: 3 }}
            helperText="Código ISO (ARS, USD, EUR)"
          />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cerrar
        </Button>
        <Button variant="contained" onClick={save} disabled={saving || loading}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
