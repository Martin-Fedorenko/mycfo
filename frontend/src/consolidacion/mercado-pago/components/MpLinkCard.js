// /mercado-pago/components/MpLinkCard.js
import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import { mpApi } from "../mpApi";

export default function MpLinkCard({ onLinked }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const startLink = async () => {
    setBusy(true);
    setErr(null);
    try {
      const url = await mpApi.startOAuth();
      if (!url) throw new Error("URL de autorización vacía");
      window.location.href = url;
    } catch (e) {
      setErr(e?.message || "No se pudo iniciar la vinculación");
      setBusy(false);
    }
  };

  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if ((p.get("mp") === "linked" || p.get("linked") === "1") && onLinked)
      onLinked();
  }, [onLinked]);

  return (
    <Card sx={{ maxWidth: 720, mx: "auto", mt: 6 }}>
      <CardContent>
        <Stack spacing={1.2}>
          <Typography variant="h5">
            Vincular tu cuenta de Mercado Pago
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Serás redirigido a Mercado Pago para otorgar permisos. Solo se piden
            alcances para <strong>leer pagos</strong> e integrar{" "}
            <strong>facturación</strong>.
          </Typography>
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="contained" onClick={startLink} disabled={busy}>
          {busy ? "Redirigiendo..." : "Vincular con Mercado Pago"}
        </Button>
        <Typography variant="caption" sx={{ ml: 1 }} color="text.secondary">
          Podrás desvincular cuando quieras desde Configuración.
        </Typography>
      </CardActions>
    </Card>
  );
}
