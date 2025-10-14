import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

const ReconciliationWidget = ({
  data,
  loading = false,
  error = null,
  onRetry,
  onNavigate,
}) => {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title="Conciliación bancaria" subheader="Sincronizando movimientos..." />
        <CardContent>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={48} sx={{ mb: 1.5 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title="Conciliación bancaria" />
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="error">{error}</Alert>
          {onRetry ? (
            <Button variant="outlined" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const accounts = data ?? [];

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title="Conciliación bancaria"
        subheader="Estado por cuenta con pendientes y atajos rápidos"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {accounts.length === 0 ? (
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              Aún no conectaste cuentas bancarias. Sincronizá una cuenta o importá un extracto
              para comenzar a conciliar.
            </Typography>
            {onRetry ? (
              <Button variant="outlined" onClick={onRetry}>
                Actualizar
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {accounts.map((account) => {
              const percent = Math.min(Math.max(account.percent || 0, 0), 100);
              return (
                <Stack
                  key={account.account}
                  spacing={1}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">{account.account}</Typography>
                    <Chip
                      size="small"
                      color={percent >= 95 ? "success" : percent >= 70 ? "warning" : "default"}
                      label={`${percent}% conciliado`}
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: "action.hover",
                      [`& .MuiLinearProgress-bar`]: {
                        borderRadius: 999,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {account.pendingCount} movimientos pendientes
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onNavigate?.(account.account)}
                    >
                      Conciliar
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => onNavigate?.(account.account)}
                    >
                      Ver pendientes
                    </Button>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </CardContent>
      <CardActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={() => onNavigate?.()} disabled={!onNavigate}>
          Ir a conciliación
        </Button>
      </CardActions>
    </Card>
  );
};

export default ReconciliationWidget;
