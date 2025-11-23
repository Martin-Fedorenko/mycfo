import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme, alpha } from "@mui/material/styles";
import useResolvedColorTokens from "../useResolvedColorTokens";

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return "--";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "--";
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const SalesByCategoryWidget = ({
  data = [],
  loading = false,
  error = null,
  emptyMessage = "No hay datos para mostrar por categoría en este período.",
  title = "Ingresos por categorías",
  subtitle = "Distribución anual por segmento",
}) => {
  const theme = useTheme();
  const { primaryTextColor, secondaryTextColor } = useResolvedColorTokens();
  const chartContainerRef = React.useRef(null);
  const [chartWidth, setChartWidth] = React.useState(0);

  const effectiveWidth = React.useMemo(() => {
    if (!chartWidth) {
      return 820;
    }
    const MIN_WIDTH = 540;
    return Math.max(chartWidth, MIN_WIDTH);
  }, [chartWidth]);

  React.useLayoutEffect(() => {
    const element = chartContainerRef.current;
    if (!element) return undefined;

    const updateWidth = () => {
      const width =
        element.offsetWidth || element.getBoundingClientRect().width || 0;
      setChartWidth(width);
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(element);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title={title} subheader="Armando ranking..." />
        <CardContent>
          <Stack spacing={1}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={24} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title={title} />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  const hasData = Array.isArray(data) && data.length > 0;
  const safeData = hasData ? data : [];
  const categories = safeData.map((item) => item.category ?? "Sin categoría");
  const values = safeData.map((item) => Number(item.value) || 0);

  // Ajustamos el eje Y para permitir valores negativos y dar margen vertical
  // con un rango que tenga sentido visualmente.
  const hasNegativeValues = values.some((v) => v < 0);
  const hasPositiveValues = values.some((v) => v > 0);
  const rawMin = hasData ? Math.min(...values) : 0;
  const rawMax = hasData ? Math.max(...values) : 0;

  let yMin = 0;
  let yMax = 0;

  if (hasPositiveValues && !hasNegativeValues) {
    // Solo positivos: de 0 a un poco más del máximo
    yMin = 0;
    yMax = rawMax * 1.25 || 1;
  } else if (!hasPositiveValues && hasNegativeValues) {
    // Solo negativos: de un poco menos del mínimo a 0
    yMin = rawMin * 1.25 || -1;
    yMax = 0;
  } else if (hasPositiveValues && hasNegativeValues) {
    // Valores mixtos: rango simétrico alrededor de 0
    const absMax = Math.max(Math.abs(rawMin), Math.abs(rawMax)) || 1;
    const limit = absMax * 1.25;
    yMin = -limit;
    yMax = limit;
  } else {
    // Todo 0 o sin datos
    yMin = -1;
    yMax = 1;
  }

  let topCategory = null;
  let bottomCategory = null;
  let average = null;

  if (hasData) {
    const total = values.reduce((sum, value) => sum + value, 0);
    average = values.length > 0 ? total / values.length : null;
    const sorted = [...safeData].sort(
      (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
    );
    topCategory = sorted[0] ?? null;
    bottomCategory = sorted[sorted.length - 1] ?? null;
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        minHeight: 520,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        title={title}
        subheader={subtitle}
        titleTypographyProps={{
          variant: "h6",
          fontWeight: 600,
          sx: { color: primaryTextColor },
        }}
        subheaderTypographyProps={{
          variant: "body2",
          sx: { color: primaryTextColor },
        }}
        action={
          hasData ? (
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
              sx={{
                pr: 2.5,
                pt: 0.5,
                flexWrap: "wrap",
                rowGap: 1,
                justifyContent: "flex-end",
                "& .MuiTypography-overline": { letterSpacing: 0.6 },
              }}
            >
              <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 120 }}>
                <Typography
                  variant="overline"
                  sx={{ color: primaryTextColor }}
                >
                  Categoría superior
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ color: primaryTextColor }}
                >
                  {formatCurrency(topCategory?.value)}
                </Typography>
                <Typography variant="caption" sx={{ color: primaryTextColor }}>
                  {topCategory?.category ?? "--"}
                </Typography>
              </Stack>
              <Divider
                flexItem
                orientation="vertical"
                sx={{ alignSelf: "stretch", borderColor: "divider", mx: 0.5 }}
              />
              <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 120 }}>
                <Typography
                  variant="overline"
                  sx={{ color: primaryTextColor }}
                >
                  Categoría menor
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ color: primaryTextColor }}
                >
                  {formatCurrency(bottomCategory?.value)}
                </Typography>
                <Typography variant="caption" sx={{ color: primaryTextColor }}>
                  {bottomCategory?.category ?? "--"}
                </Typography>
              </Stack>
              <Divider
                flexItem
                orientation="vertical"
                sx={{ alignSelf: "stretch", borderColor: "divider", mx: 0.5 }}
              />
              <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 120 }}>
                <Typography
                  variant="overline"
                  sx={{ color: primaryTextColor }}
                >
                  Promedio
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ color: primaryTextColor }}
                >
                  {formatCurrency(average)}
                </Typography>
                <Typography variant="caption" sx={{ color: primaryTextColor }}>
                  {values.length} categorías
                </Typography>
              </Stack>
            </Stack>
          ) : null
        }
        sx={{
          py: 2,
          "& .MuiCardHeader-content": {
            gap: 0.25,
            alignSelf: "flex-start",
          },
          "& .MuiCardHeader-action": {
            mt: 0,
          },
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          px: { xs: 1, md: 1.5 },
          pt: { xs: 0.9, md: 1.25 },
          pb: { xs: 2.1, md: 2.35 },
        }}
      >
        {hasData ? (
          <Box
            ref={chartContainerRef}
            sx={{
              width: "100%",
              display: "block",
              mt: { xs: 1, md: 2 },
              px: 0,
            }}
          >
            <BarChart
              width={effectiveWidth}
              height={360}
              xAxis={[
                {
                  id: "categories",
                  data: categories,
                  scaleType: "band",
                  valueFormatter: (value) => value,
                  tickLabelStyle: {
                    textTransform: "capitalize",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  },
                },
              ]}
              yAxis={[
                {
                  min: yMin,
                  max: yMax,
                  tickNumber: 5,
                  valueFormatter: (value) => formatCurrency(value),
                  tickLabelStyle: {
                    fontSize: 11,
                  },
                },
              ]}
              series={[
                {
                  data: values,
                  color: theme.palette.primary.main,
                  valueFormatter: (value) => formatCurrency(value),
                },
              ]}
              margin={{ left: 60, right: 100, top: 12, bottom: 56 }}
              grid={{ vertical: true, horizontal: true }}
              slotProps={{
                legend: { hidden: true },
                tooltip: {
                  valueFormatter: (value) => formatCurrency(value),
                },
              }}
              sx={{
                "& .MuiChartsAxis-bottom .MuiTypography-root": {
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  overflow: "visible",
                },
                "& .MuiChartsAxis-left .MuiTypography-root": {
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  overflow: "visible",
                },
                "& .MuiBarElement-root": {
                  fill: alpha(theme.palette.primary.main, 0.85),
                },
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 2.5, md: 3 },
            }}
          >
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ color: secondaryTextColor }}
            >
              {emptyMessage}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesByCategoryWidget;
