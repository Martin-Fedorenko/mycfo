import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

const defaultFormatter = (value) => value;

const KpiCard = ({
  title,
  value,
  formatter = defaultFormatter,
  secondaryLabel,
  secondaryValue,
  secondaryFormatter = defaultFormatter,
  trend = [],
  trendColor = "primary.main",
  loading = false,
  error = null,
  onRetry,
}) => {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="70%" height={36} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
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

  if (value === null || typeof value === "undefined") {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sin datos disponibles para este indicador.
          </Typography>
          {onRetry ? (
            <Button variant="outlined" onClick={onRetry}>
              Actualizar
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-end"
          justifyContent="space-between"
          sx={{ mt: 1.5 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {formatter(value)}
            </Typography>
            {secondaryLabel ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {secondaryLabel}:{" "}
                <Box component="span" fontWeight={500}>
                  {secondaryFormatter(secondaryValue)}
                </Box>
              </Typography>
            ) : null}
          </Box>
          {trend.length > 1 ? (
            <Box sx={{ minWidth: 90, height: 48 }}>
              <SparkLineChart
                data={trend}
                height={48}
                showHighlight={false}
                showTooltip={false}
                curve="natural"
                colors={[trendColor]}
              />
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
