import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PublishedWithChangesRoundedIcon from "@mui/icons-material/PublishedWithChangesRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

import QuickActions from "./components/QuickActions";
import KpiCard from "./components/KpiCard";
import BudgetWidget from "./components/BudgetWidget";
import CashflowWidget from "./components/CashflowWidget";
import DueDatesWidget from "./components/DueDatesWidget";
import TasksWidget from "./components/TasksWidget";
import RecentMovementsWidget from "./components/RecentMovementsWidget";
import ReconciliationWidget from "./components/ReconciliationWidget";
import BillingWidget from "./components/BillingWidget";
import CashbackWidget from "./components/CashbackWidget";
import { formatCurrencyAR, formatPercentage } from "../utils/formatters";

const mockKpis = {
  cashPosition: 1250000,
  monthIncomes: 820000,
  monthExpenses: 540000,
  monthResult: 280000,
  budgetCompliancePct: 87,
  toPay14d: 210000,
  toCollect14d: 420000,
};

const mockKpiTrends = {
  cashPosition: [980000, 1020000, 1130000, 1250000],
  monthIncomes: [650000, 720000, 780000, 820000],
  monthExpenses: [480000, 510000, 530000, 540000],
  monthResult: [170000, 210000, 245000, 280000],
  budgetCompliancePct: [82, 84, 85, 87],
  payBalance: [140000, 160000, 180000, 210000],
};

const mockBudget = {
  name: "Presupuesto anual 2025",
  slug: "presupuesto-anual-2025",
  period: {
    label: "Octubre 2025",
    routeParam: "octubre-2025",
  },
  categories: [
    { name: "Ventas", planned: 850000, actual: 640000 },
    { name: "Marketing", planned: 250000, actual: 210000 },
    { name: "Operaciones", planned: 300000, actual: 320000 },
    { name: "RRHH", planned: 180000, actual: 150000 },
  ],
};

const mockCashflow = {
  labels: ["Hoy", "+5d", "+10d", "+15d", "+20d", "+25d", "+30d"],
  incomes: [220000, 180000, 210000, 190000, 230000, 200000, 250000],
  expenses: [150000, 160000, 170000, 165000, 175000, 160000, 185000],
  net: [70000, 20000, 40000, 25000, 55000, 40000, 65000],
};

const mockDueDates = [
  { id: "afip-01", date: new Date().toISOString(), type: "AFIP", name: "IVA mensual", amount: 155000 },
  {
    id: "prov-02",
    date: new Date(Date.now() + 3 * 86400000).toISOString(),
    type: "Proveedor",
    name: "Servicios Cloud",
    amount: 98000,
  },
  {
    id: "cli-03",
    date: new Date(Date.now() + 7 * 86400000).toISOString(),
    type: "Cliente",
    name: "Cobranza Grupo Litoral",
    amount: 210000,
  },
];

const mockTasks = [
  {
    id: "task-1",
    title: "Conciliar Banco Nación",
    description: "Tenés 4 movimientos pendientes de revisar.",
    severity: "high",
  },
  {
    id: "task-2",
    title: "Subir comprobantes de AFIP",
    description: "Faltan adjuntar comprobantes del último pago.",
    severity: "medium",
  },
  {
    id: "task-3",
    title: "Categorizar movimientos",
    description: "3 ingresos sin categoría asignada.",
    severity: "low",
  },
];

const mockMovements = [
  {
    id: "mov-1",
    date: new Date().toISOString(),
    description: "Pago proveedor logística",
    amount: -125000,
    pendingCategory: false,
    category: "Logística",
  },
  {
    id: "mov-2",
    date: new Date(Date.now() - 86400000).toISOString(),
    description: "Cobro Mercado Pago - Tienda online",
    amount: 185000,
    pendingCategory: false,
    category: "Ventas",
  },
  {
    id: "mov-3",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    description: "Gasto publicidad Meta",
    amount: -78000,
    pendingCategory: true,
  },
  {
    id: "mov-4",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    description: "Transferencia a caja chica",
    amount: -45000,
    pendingCategory: true,
  },
];

const mockReconciliation = [
  { account: "Banco Nación ARS", percent: 92, pendingCount: 4 },
  { account: "Mercado Pago", percent: 78, pendingCount: 9 },
  { account: "Santander Río USD", percent: 63, pendingCount: 7 },
];

const mockBilling = {
  invoices: [
    {
      id: "fac-01",
      number: "A-0003-000125",
      customer: "Fábrica El Sol",
      amount: 145000,
      date: new Date().toISOString(),
    },
    {
      id: "fac-02",
      number: "A-0003-000124",
      customer: "Cooperativa Delta",
      amount: 98000,
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "fac-03",
      number: "B-0001-000543",
      customer: "Estudio Contable Sur",
      amount: 54000,
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
};

const mockCashback = {
  accumulated: 36200,
  benefits: [
    { id: "benef-1", title: "15% cashback en Ualá bis", cta: "Activar promoción >" },
    { id: "benef-2", title: "3 meses bonificados en AWS", cta: "Ver requisitos >" },
    { id: "benef-3", title: "Descuento 10% en seguros Sancor", cta: "Solicitar asesor >" },
  ],
};

const initialDashboardState = {
  kpis: { loading: true, error: null, data: null },
  budget: { loading: true, error: null, data: null },
  cashflow: { loading: true, error: null, data: null },
  dueDates: { loading: true, error: null, data: null },
  tasks: { loading: true, error: null, data: null },
  movements: { loading: true, error: null, data: null },
  reconciliation: { loading: true, error: null, data: null },
  billing: { loading: true, error: null, data: null },
  cashback: { loading: true, error: null, data: null },
};

const companiesMock = ["MyCFO Demo", "Acme Corp", "Globex Latam"];

const getRecentPeriods = (count = 6) =>
  Array.from({ length: count }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const label = new Intl.DateTimeFormat("es-AR", {
      month: "long",
      year: "numeric",
    }).format(date);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { label, value };
  });

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [state, setState] = React.useState(initialDashboardState);
  const fetchTimeoutRef = React.useRef();
  const [snackbar, setSnackbar] = React.useState(null);
  const [company, setCompany] = React.useState(companiesMock[0]);
  const periodOptions = React.useMemo(() => getRecentPeriods(6), []);
  const [period, setPeriod] = React.useState(periodOptions[0]?.value ?? "");

  const userDisplayName =
    (typeof window !== "undefined" && (sessionStorage.getItem("name") || sessionStorage.getItem("email"))) ||
    "Usuario";

  const loadDashboardData = React.useCallback(() => {
    setState((prev) => {
      const next = {};
      Object.entries(prev).forEach(([key, value]) => {
        next[key] = { ...value, loading: true, error: null };
      });
      return next;
    });

    clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => {
      setState({
        kpis: { loading: false, error: null, data: mockKpis },
        budget: { loading: false, error: null, data: mockBudget },
        cashflow: { loading: false, error: null, data: mockCashflow },
        dueDates: { loading: false, error: null, data: mockDueDates },
        tasks: { loading: false, error: null, data: mockTasks },
        movements: { loading: false, error: null, data: mockMovements },
        reconciliation: { loading: false, error: null, data: mockReconciliation },
        billing: { loading: false, error: null, data: mockBilling },
        cashback: { loading: false, error: null, data: mockCashback },
      });
    }, 700);
  }, []);

  React.useEffect(() => {
    loadDashboardData();
    return () => clearTimeout(fetchTimeoutRef.current);
  }, [loadDashboardData]);

  const handleNavigate = React.useCallback(
    (path, params) => {
      if (!path) return;
      if (params) {
        const searchParams = new URLSearchParams(params);
        navigate({ pathname: path, search: `?${searchParams.toString()}` });
      } else {
        navigate(path);
      }
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [navigate]
  );

  const quickActions = React.useMemo(
    () => [
      {
        id: "income",
        label: "+ Ingreso",
        icon: <AddCircleOutlineRoundedIcon />,
        action: () => handleNavigate("/carga", { tipo: "ingreso" }),
      },
      {
        id: "expense",
        label: "+ Egreso",
        icon: <RemoveCircleOutlineRoundedIcon />,
        action: () => handleNavigate("/carga", { tipo: "egreso" }),
      },
      {
        id: "excel",
        label: "Importar Excel",
        icon: <UploadFileRoundedIcon />,
        action: () => handleNavigate("/carga-movimientos"),
      },
      {
        id: "mp",
        label: "Mercado Pago",
        icon: <AccountBalanceWalletRoundedIcon />,
        action: () => handleNavigate("/mercado-pago"),
      },
      {
        id: "reconcile",
        label: "Conciliar",
        icon: <PublishedWithChangesRoundedIcon />,
        action: () => handleNavigate("/conciliacion"),
      },
      {
        id: "invoice",
        label: "Emitir factura",
        icon: <ReceiptLongRoundedIcon />,
        action: () => handleNavigate("/carga", { tipo: "factura" }),
      },
      {
        id: "budget",
        label: "Nuevo presupuesto",
        icon: <AssessmentRoundedIcon />,
        action: () => handleNavigate("/presupuestos/nuevo"),
      },
      {
        id: "reminder",
        label: "Recordatorio",
        icon: <NotificationsActiveRoundedIcon />,
        action: () => handleNavigate("/recordatorios"),
      },
    ],
    [handleNavigate]
  );

  const handleQuickAction = (action) => {
    if (action?.action) {
      action.action();
    } else {
      setSnackbar({ severity: "info", message: `${action?.label ?? "Acción"} en desarrollo.` });
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar(null);
  };

  const showMessage = React.useCallback((message, severity = "success") => {
    setSnackbar({ message, severity });
  }, []);

  const kpiCards = React.useMemo(() => {
    const data = state.kpis.data;
    if (!data) return [];
    return [
      {
        id: "cashPosition",
        title: "Posición de caja",
        value: data.cashPosition,
        formatter: formatCurrencyAR,
        trend: mockKpiTrends.cashPosition,
        trendColor: theme.palette.success.main,
      },
      {
        id: "incomes",
        title: "Ingresos (mes)",
        value: data.monthIncomes,
        formatter: formatCurrencyAR,
        trend: mockKpiTrends.monthIncomes,
        trendColor: theme.palette.success.dark,
      },
      {
        id: "expenses",
        title: "Egresos (mes)",
        value: data.monthExpenses,
        formatter: formatCurrencyAR,
        trend: mockKpiTrends.monthExpenses,
        trendColor: theme.palette.error.main,
      },
      {
        id: "result",
        title: "Resultado (mes)",
        value: data.monthResult,
        formatter: formatCurrencyAR,
        trend: mockKpiTrends.monthResult,
        trendColor: theme.palette.info.main,
      },
      {
        id: "budgetCompliance",
        title: "% Cumplimiento Presupuesto",
        value: data.budgetCompliancePct,
        formatter: (value) => formatPercentage(value, { fractionDigits: 0 }),
        trend: mockKpiTrends.budgetCompliancePct,
        trendColor: theme.palette.warning.main,
      },
      {
        id: "payCollect",
        title: "A pagar / A cobrar (14 días)",
        value: data.toPay14d,
        formatter: formatCurrencyAR,
        trend: mockKpiTrends.payBalance,
        trendColor: theme.palette.primary.main,
        secondaryLabel: "A cobrar",
        secondaryValue: data.toCollect14d,
        secondaryFormatter: formatCurrencyAR,
      },
    ];
  }, [state.kpis.data, theme.palette.error.main, theme.palette.info.main, theme.palette.primary.main, theme.palette.success.dark, theme.palette.success.main, theme.palette.warning.main]);

  const quickActionsLoading = state.kpis.loading && !state.kpis.data;

  const quickActionsSx = React.useMemo(
    () => ({
      position: { xs: "relative", md: "sticky" },
      top: { md: theme.spacing(1) },
      zIndex: theme.zIndex.appBar - 1,
    }),
    [theme]
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1650, pb: 6 }}>
      <Stack spacing={3} sx={{ width: "100%" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          sx={{ width: "100%" }}
        >
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Hola, {userDisplayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Este es el resumen financiero de tu empresa. Revisá KPIs, vencimientos y tareas clave.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <TextField
              select
              label="Empresa"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 200 } }}
            >
              {companiesMock.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Período"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 200 } }}
            >
              {periodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        <Box sx={quickActionsSx}>
          <QuickActions actions={quickActions} loading={quickActionsLoading} onAction={handleQuickAction} />
        </Box>

        <Grid container spacing={2}>
          {kpiCards.map((card) => (
            <Grid item xs={12} sm={6} lg={4} key={card.id}>
              <KpiCard
                title={card.title}
                value={card.value}
                formatter={card.formatter}
                secondaryLabel={card.secondaryLabel}
                secondaryValue={card.secondaryValue}
                secondaryFormatter={card.secondaryFormatter}
                trend={card.trend}
                trendColor={card.trendColor}
                loading={state.kpis.loading && !state.kpis.data}
                error={state.kpis.error}
                onRetry={loadDashboardData}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} xl={6}>
            <BudgetWidget
              companyId={company}
              period={period}
              data={state.budget.data}
              loading={state.budget.loading && !state.budget.data}
              error={state.budget.error}
              onRetry={loadDashboardData}
            />
          </Grid>
          <Grid item xs={12} xl={6}>
            <CashflowWidget
              data={state.cashflow.data}
              loading={state.cashflow.loading && !state.cashflow.data}
              error={state.cashflow.error}
              onRetry={loadDashboardData}
              onNavigate={() => handleNavigate("/cash-flow")}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6} xl={4}>
            <DueDatesWidget
              data={state.dueDates.data}
              loading={state.dueDates.loading && !state.dueDates.data}
              error={state.dueDates.error}
              onRetry={loadDashboardData}
              onNavigate={() => handleNavigate("/listado-notificaciones")}
              onMarkPaid={(item) => showMessage(`Vencimiento "${item.name}" marcado como pagado.`)}
              onSendReminder={(item) => showMessage(`Recordatorio enviado a ${item.name}.`, "info")}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={4}>
            <TasksWidget
              data={state.tasks.data}
              loading={state.tasks.loading && !state.tasks.data}
              error={state.tasks.error}
              onRetry={loadDashboardData}
              onNavigate={() => handleNavigate("/recordatorios")}
              onResolve={(task) => showMessage(`Actualizaste "${task.title}".`, "success")}
            />
          </Grid>
          <Grid item xs={12} xl={4}>
            <RecentMovementsWidget
              data={state.movements.data}
              loading={state.movements.loading && !state.movements.data}
              error={state.movements.error}
              onRetry={loadDashboardData}
              onNavigate={() => handleNavigate("/ver-movimientos")}
              onCategorize={() => showMessage("IA ejecutando categorización...", "info")}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6} xl={4}>
            <ReconciliationWidget
              data={state.reconciliation.data}
              loading={state.reconciliation.loading && !state.reconciliation.data}
              error={state.reconciliation.error}
              onRetry={loadDashboardData}
              onNavigate={(account) => handleNavigate("/conciliacion", account ? { cuenta: account } : undefined)}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={4}>
            <BillingWidget
              data={state.billing.data}
              loading={state.billing.loading && !state.billing.data}
              error={state.billing.error}
              onRetry={loadDashboardData}
              onNavigate={() => handleNavigate("/carga", { tipo: "factura" })}
            />
          </Grid>
          <Grid item xs={12} xl={4}>
            <CashbackWidget
              data={state.cashback.data}
              loading={state.cashback.loading && !state.cashback.data}
              error={state.cashback.error}
              onRetry={loadDashboardData}
              onNavigate={() => handleNavigate("/mercado-pago")}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="text" size="small" onClick={loadDashboardData}>
            Recargar datos de Dashboard
          </Button>
        </Box>
      </Stack>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: isMobile ? "top" : "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity ?? "info"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
