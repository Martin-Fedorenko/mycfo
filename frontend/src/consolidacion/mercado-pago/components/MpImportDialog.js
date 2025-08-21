import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import catalogs from "../..//mercado-pago/catalogs";

export default function MpImportDialog({
  open,
  onClose,
  onImportById,
  onImportByMonth,
}) {
  const [paymentId, setPaymentId] = React.useState("");
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [year, setYear] = React.useState(new Date().getFullYear());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importación Mercado Pago</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="subtitle2">
            – Para importar un único pago
          </Typography>
          <TextField
            label="Ingrese un número de pago"
            type="number"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            inputProps={{ min: 0 }}
          />
          <Typography variant="subtitle2">
            – Para importar los pagos por meses
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Mes"
              sx={{ minWidth: 160 }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {catalogs.meses.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Año"
              type="number"
              sx={{ minWidth: 120 }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() => {
            if (paymentId) onImportById(Number(paymentId));
            else onImportByMonth(month, year);
            onClose();
          }}
          variant="contained"
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
