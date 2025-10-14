import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { formatCurrencyAR, formatPercentage } from "../../utils/formatters";

const getStatusColor = (ratio) => {
  if (ratio <= 0.9) {
    return { color: "success", label: "En verde" };
  }
  if (ratio <= 1.1) {
    return { color: "warning", label: "Cerca del objetivo" };
  }
  return { color: "error", label: "Sobre el plan" };
};

const BudgetWidget = ({
  data,
  loading = false,
  error = null,
  onRetry,
  onNavigate,
  onCreateBudget,
}) => {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title="Presupuesto actual" subheader="Cargando datos..." />
        <CardContent>
          {Array.from({ length: 4 }).map((_, index) => (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="20%" />
            </Stack>
          ))}
          <Skeleton variant="rectangular" height={8} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title="Presupuesto actual" />
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

  const categories = data?.categories ?? [];

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title="Presupuesto actual"
        subheader={
          data?.period?.label
            ? `${data.period.label} · ${data.name || "General"}`
            : data?.name
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {categories.length === 0 ? (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              No encontramos presupuestos cargados para el período seleccionado.
            </Typography>
            {onCreateBudget ? (
              <Button variant="contained" onClick={onCreateBudget}>
                Crear presupuesto
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {categories.map((item) => {
              const planned = Number(item.planned) || 0;
              const actual = Number(item.actual) || 0;
              const ratio = planned === 0 ? 0 : actual / planned;
              const status = getStatusColor(ratio);
              const rawPercentage = planned === 0 ? 0 : (actual / planned) * 100;
              const progress = Math.min(rawPercentage, 150);

              return (
                <Box key={item.name} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">{item.name}</Typography>
                    <Chip
                      color={status.color}
                      label={`${formatPercentage(rawPercentage, { fractionDigits: 0 })} · ${status.label}`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={progress > 100 ? 100 : progress}
                    color={status.color}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: "action.hover",
                      [`& .MuiLinearProgress-bar`]: {
                        borderRadius: 999,
                      },
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Planificado: {formatCurrencyAR(planned)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Ejecutado: {formatCurrencyAR(actual)}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 0.5 }} />
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={onNavigate}
          disabled={!onNavigate}
        >
          Ver más
        </Button>
        {onCreateBudget ? (
          <Button variant="contained" onClick={onCreateBudget}>
            Nuevo presupuesto
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
};

export default BudgetWidget;
