import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";

export default function MpConfigDialog({ open, onClose }) {
  const [autoImport, setAutoImport] = React.useState(true);
  const [autoInvoice, setAutoInvoice] = React.useState(false);

  // TODO: leer/guardar preferencias reales al backend si corresponde
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Preferencias de Mercado Pago</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={autoImport}
              onChange={(e) => setAutoImport(e.target.checked)}
            />
          }
          label="Importar automáticamente por Webhook"
        />
        <FormControlLabel
          control={
            <Switch
              checked={autoInvoice}
              onChange={(e) => setAutoInvoice(e.target.checked)}
            />
          }
          label="Facturar automáticamente pagos aprobados"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" onClick={onClose}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
