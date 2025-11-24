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
import { LineChart } from "@mui/x-charts/LineChart";
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

const numberFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

const monthLabel = (raw, index) => {
  if (!raw) {
    const fallback = new Date(2000, index % 12, 1);
    return new Intl.DateTimeFormat("es-AR", { month: "long" }).format(fallback);
  }

  const normalized = String(raw).trim().toLowerCase();
  const dictionary = {
    ene: "enero",
    feb: "febrero",
    mar: "marzo",
    abr: "abril",
    may: "mayo",
    jun: "junio",
    jul: "julio",
    ago: "agosto",
    sep: "septiembre",
    oct: "octubre",
    nov: "noviembre",
    dic: "diciembre",
    january: "enero",
    february: "febrero",
    march: "marzo",
    april: "abril",
    june: "junio",
    july: "julio",
    august: "agosto",
    september: "septiembre",
    october: "octubre",
    november: "noviembre",
    december: "diciembre",
  };

  if (dictionary[normalized]) {
    return dictionary[normalized];
  }

  const parsed = Date.parse(`${normalized} 1, 2020`);
  if (Number.isNaN(parsed)) {
    const fallback = new Date(2000, index % 12, 1);
    return new Intl.DateTimeFormat("es-AR", { month: "long" }).format(fallback);
  }
  return new Intl.DateTimeFormat("es-AR", { month: "long" }).format(parsed);
};

const SalesTrendWidget = ({ data, loading = false, error = null, emptyMessage }) => {
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
        <CardHeader
          title={data?.title ?? "Ingresos durante el período"}
          subheader="Generando serie..."
        />
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={220} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title={data?.title ?? "Ingresos durante el período"} />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  const points = data?.points ?? [];
  const xAxis = points.map((item) => monthLabel(item.month, item.monthIndex));
  const seriesValues = points.map((item) => item.value);
  const noDataMessage = emptyMessage ?? data?.emptyMessage ?? "No hay ingresos registrados en este período.";
  const hasData = seriesValues.length > 0;

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
          title={data?.title ?? "Ingresos durante el período"}
          subheader={data?.subheader ?? "Serie mensual de ingresos registrados en los últimos 12 meses."}
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
              <Typography variant="overline" sx={{ color: primaryTextColor }}>
                Maximo
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: primaryTextColor }}>
                {formatCurrency(data?.max?.value)}
              </Typography>
              <Typography variant="caption" sx={{ color: primaryTextColor }}>
                {data?.max?.label ?? "--"}
              </Typography>
            </Stack>
            <Divider
              flexItem
              orientation="vertical"
              sx={{ alignSelf: "stretch", borderColor: "divider", mx: 0.5 }}
            />
            <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 120 }}>
              <Typography variant="overline" sx={{ color: primaryTextColor }}>
                Minimo
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: primaryTextColor }}>
                {formatCurrency(data?.min?.value)}
              </Typography>
              <Typography variant="caption" sx={{ color: primaryTextColor }}>
                {data?.min?.label ?? "--"}
              </Typography>
            </Stack>
            <Divider
              flexItem
              orientation="vertical"
              sx={{ alignSelf: "stretch", borderColor: "divider", mx: 0.5 }}
            />
            <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 120 }}>
              <Typography variant="overline" sx={{ color: primaryTextColor }}>
                Promedio
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: primaryTextColor }}>
                {formatCurrency(data?.average)}
              </Typography>
                <Typography variant="caption" sx={{ color: primaryTextColor }}>
                  Últimos 12 meses
                </Typography>
            </Stack>
          </Stack>
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
        <Box
          ref={chartContainerRef}
          sx={{
            width: "100%",
            display: "block",
            mt: { xs: 1, md: 2 },
            px: 0,
          }}
        >
          {hasData ? (
            <LineChart
              width={effectiveWidth}
              height={360}
              series={[
                {
                  data: seriesValues,
                  type: "line",
                  area: true,
                  curve: "natural",
                  color: theme.palette.primary.main,
                  areaStyle: { fill: alpha(theme.palette.primary.main, 0.22) },
                  showMark: true,
                  valueFormatter: (value) => numberFormatter.format(value ?? 0),
                  lineStyle: { strokeWidth: 3 },
                },
              ]}
              yAxis={[
                {
                  tickInterval: "auto",
                  valueFormatter: () => "",
                  tickLabelStyle: { display: "none" },
                },
              ]}
              xAxis={[
                {
                  id: "months",
                  data: xAxis,
                  scaleType: "point",
                  tickLabelStyle: {
                    textTransform: "capitalize",
                    fontSize: 10.5,
                    transform: "translateY(6px)",
                    whiteSpace: "nowrap",
                  },
                  tickLabelSpacing: 0,
                },
              ]}
              margin={{ left: 50, right: 90, top: 8, bottom: 40 }}
              grid={{ vertical: true, horizontal: true }}
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
                "& .MuiChartsAxis-label": { fontWeight: 500 },
                "& .MuiChartsGrid-line": { strokeDasharray: "4 4" },
                "& .MuiMarkElement-root": {
                  strokeWidth: 2,
                  stroke: theme.palette.background.paper,
                  r: 4,
                },
                "& .MuiAreaElement-root": { opacity: 0.24 },
              }}
              slotProps={{
                legend: { hidden: true },
                tooltip: {
                  valueFormatter: (value) => formatCurrency(value),
                },
              }}
              showTooltip
            />
          ) : (
            <Box
              sx={{
                height: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                color: secondaryTextColor,
                typography: "body2",
              }}
            >
              {noDataMessage}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesTrendWidget;






