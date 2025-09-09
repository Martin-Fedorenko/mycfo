import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
} from "@mui/material";

const MONTHS = [
  { v: 1, label: "Enero" },
  { v: 2, label: "Febrero" },
  { v: 3, label: "Marzo" },
  { v: 4, label: "Abril" },
  { v: 5, label: "Mayo" },
  { v: 6, label: "Junio" },
  { v: 7, label: "Julio" },
  { v: 8, label: "Agosto" },
  { v: 9, label: "Septiembre" },
  { v: 10, label: "Octubre" },
  { v: 11, label: "Noviembre" },
  { v: 12, label: "Diciembre" },
];

export default function MpImportDialog({ open, onClose, onImport }) {
  const now = new Date();
  const [mode, setMode] = React.useState("period"); // "period" | "id"
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());
  const [paymentId, setPaymentId] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    if (open) {
      setErr(null);
      setBusy(false);
      setMode("period");
    }
  }, [open]);

  const submit = async () => {
    setErr(null);
    if (mode === "period") {
      if (!month || !year) {
        setErr("Seleccioná mes y año");
        return;
      }
    } else {
      if (!paymentId) {
        setErr("Ingresá un Payment ID");
        return;
      }
      if (!/^\d+$/.test(paymentId)) {
        setErr("El Payment ID debe ser numérico");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "period") {
        await onImport?.({ mode, month: Number(month), year: Number(year) });
      } else {
        await onImport?.({ mode, paymentId: Number(paymentId) });
      }
    } catch (e) {
      setErr(e?.message || "Error en la importación");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Importar pagos</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <FormControlLabel
              value="period"
              control={<Radio />}
              label="Por período"
            />
            <FormControlLabel
              value="id"
              control={<Radio />}
              label="Por Payment ID"
            />
          </RadioGroup>

          {mode === "period" ? (
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Mes"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                fullWidth
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m.v} value={m.v}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Año"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                fullWidth
                inputProps={{ min: 2000, max: 2100, step: 1 }}
              />
            </Stack>
          ) : (
            <TextField
              label="Payment ID"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value.trim())}
              fullWidth
              placeholder="Ej. 1234567890"
            />
          )}

          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {busy ? "Importando…" : "Importar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
