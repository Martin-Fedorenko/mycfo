// /mercado-pago/Mercado-Pago.js
import React from "react";
import {
  Container,
  Alert,
  Stack,
  LinearProgress,
  Skeleton,
  Typography,
  Box,
  Button,
} from "@mui/material";
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
      const s = await mpApi.getStatus();
      setStatus(s);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el estado");
    } finally {
      setLoading(false);
    }
  }, []);

  // Primera carga
  React.useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Soporte a ?mp=linked / ?linked=1 después del OAuth y limpieza de URL
  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("mp") === "linked" || p.get("linked") === "1") {
      window.history.replaceState({}, document.title, window.location.pathname);
      loadStatus();
    }
  }, [loadStatus]);

  const onRefreshStatus = () => loadStatus();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Encabezado simple (opcional) */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Mercado Pago</Typography>
        {/* espacio reservado para acciones futuras */}
        <Box sx={{ minWidth: 120 }} />
      </Stack>

      {/* Estado de error con acción de reintento */}
      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={loadStatus}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Cargando: barra + skeletons para que se vea “vivo” */}
      {loading && (
        <Stack spacing={2}>
          <LinearProgress />
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={420} />
        </Stack>
      )}

      {/* Contenido */}
      {!loading && !error && (
        <>
          {!status?.linked ? (
            <MpLinkCard onLinked={loadStatus} />
          ) : (
            <MainGrid status={status} onRefreshStatus={onRefreshStatus} />
          )}
        </>
      )}
    </Container>
  );
}
