// /mercado-pago/Mercado-Pago.js
import React from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { mpApi } from "./mpApi";
import MpLinkCard from "./components/MpLinkCard";
import MainGrid from "./components/MainGrid";

export default function MercadoPagoPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [status, setStatus] = React.useState(null);

  const loadStatus = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await mpApi.getStatus());
    } catch (e) {
      setError(e?.message || "No se pudo cargar el estado");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <MpLinkCard onLinked={loadStatus} />
      </Box>
    );

  if (!status?.linked) return <MpLinkCard onLinked={loadStatus} />;

  return <MainGrid status={status} onRefreshStatus={loadStatus} />;
}
