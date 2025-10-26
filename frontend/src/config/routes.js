import React from "react";
import StorageIcon from "@mui/icons-material/Storage";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";

// Lazy loading para componentes pesados
const ReporteMensual = React.lazy(() => import("../reportes/reporte-mensual/ReporteMensual"));
const ExcelManagement = React.lazy(() => import("../consolidacion/carga-movimientos/ExcelManagement"));
const CashFlow = React.lazy(() => import("../reportes/cash-flow/CashFlow"));
const ProfitLoss = React.lazy(() => import("../reportes/ProfitAndLoss/ProfitLoss"));
const Notificaciones = React.lazy(() => import("../notificaciones/listado-notificaciones/Notificaciones"));
const NotificationCenter = React.lazy(() => import("../notificaciones/components/NotificationCenter/NotificationCenter"));
const ReminderManager = React.lazy(() => import("../notificaciones/components/ReminderManager/ReminderManager"));
const NotificationSettings = React.lazy(() => import("../notificaciones/components/NotificationSettings/NotificationSettings"));
const EmailConfiguration = React.lazy(() => import("../notificaciones/components/EmailConfiguration/EmailConfiguration"));
const Presupuesto = React.lazy(() => import("../pronostico/presupuesto/Presupuesto"));
const PresupuestoNuevo = React.lazy(() => import("../pronostico/presupuesto/components/PresupuestoNuevo"));
const PresupuestoDetalle = React.lazy(() => import("../pronostico/presupuesto/components/PresupuestoDetalle"));
const MesDetalle = React.lazy(() => import("../pronostico/presupuesto/components/MesDetalle"));
const CashFlowForecast = React.lazy(() => import("../pronostico/rolling-forecast/RollingForecast"));
const RollingForecast = React.lazy(() => import("../pronostico/cash-flow-forecast/CashFlowForecast"));
const HistorialCambios = React.lazy(() => import("../administracion/historial-cambios/HistorialCambios"));
const Roles = React.lazy(() => import("../administracion/roles/Roles"));
const Invitaciones = React.lazy(() => import("../administracion/invitaciones/Invitaciones"));
const MovimientosCargados = React.lazy(() => import("../registro/movimientos-cargados/MovimientosCargados"));
const MercadoPagoPage = React.lazy(() => import("../consolidacion/mercado-pago/Mercado-Pago"));
const TablaDetalle = React.lazy(() => import("../reportes/reporte-mensual/components/TablaDetalle"));
const TablaRegistrosV2 = React.lazy(() => import("../registro/movimientos-cargados/TablaRegistrosV2"));
const ConciliacionPanel = React.lazy(() => import("../conciliacion/ConciliacionPanel"));
const CargaSeleccionTipo = React.lazy(() => import("../registro/carga-general/CargaSeleccionTipo"));
const CargaSeleccionMetodo = React.lazy(() => import("../registro/carga-general/CargaSeleccionMetodo"));
const CargaVistaFinal = React.lazy(() => import("../registro/carga-general/CargaVistaFinal"));

const routeConfig = [
  {
    label: "Carga de datos",
    path: "/carga",
    icon: <DescriptionIcon />,
    element: <CargaSeleccionTipo />,
  },
  {
    path: "/carga/:tipo",
    element: <CargaSeleccionMetodo />,
    hidden: true,
  },
  {
    path: "/carga/:tipo/:modo",
    element: <CargaVistaFinal />,
    hidden: true,
  },
  {
    label: "Ver movimientos",
    path: "/ver-movimientos",
    icon: <DescriptionIcon />,
    element: <TablaRegistrosV2 />,
  },
  {
    label: "Ver facturas",
    path: "/ver-facturas",
    icon: <DescriptionIcon />,
    element: <TablaRegistrosV2 />,
  },
  {
    label: "Conciliación",
    path: "/conciliacion",
    icon: <LinkIcon />,
    element: <ConciliacionPanel />,
  },
  {
    label: "Vinculación Bancaria",
    icon: <StorageIcon />,
    children: [
      {
        label: "Carga de movimientos",
        path: "/carga-movimientos",
        icon: <DescriptionIcon />,
        element: <ExcelManagement />,
      },
      {
        label: "Mercado Pago",
        path: "/mercado-pago",
        icon: <DescriptionIcon />,
        element: <MercadoPagoPage />,
      },
    ],
  },
  {
    label: "Reportes",
    icon: <StorageIcon />,
    children: [
      {
        label: "Reporte mensual",
        path: "/reporte-mensual",
        icon: <DescriptionIcon />,
        element: <ReporteMensual />,
      },
      {
        label: "Cash Flow",
        path: "/cash-flow",
        icon: <DescriptionIcon />,
        element: <CashFlow />,
      },
      {
        label: "Profit & Loss",
        path: "/profit-loss",
        icon: <DescriptionIcon />,
        element: <ProfitLoss />,
      },
    ],
  },
  {
    label: "Pronóstico",
    icon: <StorageIcon />,
    children: [
      {
        label: "Presupuesto",
        path: "/presupuestos",
        icon: <DescriptionIcon />,
        element: <Presupuesto />,
        children: [
          {
            label: "Nuevo",
            path: "/presupuestos/nuevo",
            element: <PresupuestoNuevo />,
          },
          {
            label: "Detalle",
            path: "/presupuestos/:nombre",
            element: <PresupuestoDetalle />,
          },
          {
            label: (params) => `Mes ${params.mesNombre}`,
            path: "/presupuestos/:nombre/detalle/:mesNombre",
            element: <MesDetalle />,
          },
        ],
      },
      {
        label: "Cash Flow Forecast",
        path: "/cash-flow-forecast",
        icon: <DescriptionIcon />,
        element: <CashFlowForecast />,
      },
      {
        label: "Rolling Forecast",
        path: "/rolling-forecast",
        icon: <DescriptionIcon />,
        element: <RollingForecast />,
      },
    ],
  },
  {
    label: "Notificaciones",
    icon: <StorageIcon />,
    children: [
      {
        label: "Centro de Notificaciones",
        path: "/listado-notificaciones",
        icon: <DescriptionIcon />,
        element: <Notificaciones />,
      },
      {
        label: "Recordatorios",
        path: "/recordatorios",
        icon: <DescriptionIcon />,
        element: <ReminderManager />,
      },
      {
        label: "Configuración",
        path: "/configuracion-notificaciones",
        icon: <DescriptionIcon />,
        element: <NotificationSettings />,
      },
      // {
      //   label: "Configuración Email",
      //   path: "/configuracion-email",
      //   icon: <DescriptionIcon />,
      //   element: <EmailConfiguration />,
      // },
    ],
  },
];

export default routeConfig;