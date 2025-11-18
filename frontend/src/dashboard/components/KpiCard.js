import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import useResolvedColorTokens from "../useResolvedColorTokens";

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
  const { primaryTextColor, secondaryTextColor } = useResolvedColorTokens();

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
          <Typography variant="body2" sx={{ color: secondaryTextColor }}>
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
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: 2.5, py: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ flexShrink: 0, whiteSpace: "nowrap", color: primaryTextColor }}
        >
          {title}
        </Typography>
        <Box sx={{ textAlign: "right", flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={600} sx={{ color: primaryTextColor }}>
            {formatter(value)}
          </Typography>
          {secondaryLabel ? (
            <Typography variant="body2" sx={{ color: secondaryTextColor }}>
              {secondaryLabel}:{" "}
              <Box component="span" fontWeight={500}>
                {secondaryFormatter(secondaryValue)}
              </Box>
            </Typography>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
