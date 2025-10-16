import StorageIcon from "@mui/icons-material/Storage";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";

import CargaManual from "../registro/carga-manual/CargaManual";
import CargaDocumento from "../registro/carga-documento/CargaDocumento";
import ReporteMensual from "../reportes/reporte-mensual/ReporteMensual";
import ExcelManagement from "../consolidacion/carga-movimientos/ExcelManagement";
import CashFlow from "../reportes/cash-flow/CashFlow";
import ProfitLoss from "../reportes/ProfitAndLoss/ProfitLoss"; // ✅ ruta corregida
import Notificaciones from "../notificaciones/listado-notificaciones/Notificaciones";
import NotificationCenter from "../notificaciones/components/NotificationCenter/NotificationCenter";
import ReminderManager from "../notificaciones/components/ReminderManager/ReminderManager";
import NotificationSettings from "../notificaciones/components/NotificationSettings/NotificationSettings";
import EmailConfiguration from "../notificaciones/components/EmailConfiguration/EmailConfiguration";
import Presupuesto from "../pronostico/presupuesto/Presupuesto";
import PresupuestoNuevo from "../pronostico/presupuesto/components/PresupuestoNuevo";
import PresupuestoDetalle from "../pronostico/presupuesto/components/PresupuestoDetalle";
import MesDetalle from "../pronostico/presupuesto/components/MesDetalle";
import CashFlowForecast from "../pronostico/rolling-forecast/RollingForecast";
import RollingForecast from "../pronostico/cash-flow-forecast/CashFlowForecast";
import HistorialCambios from "../administracion/historial-cambios/HistorialCambios";
import Roles from "../administracion/roles/Roles";
import Invitaciones from "../administracion/invitaciones/Invitaciones";
import MovimientosCargados from "../registro/movimientos-cargados/MovimientosCargados";
import MercadoPagoPage from "../consolidacion/mercado-pago/Mercado-Pago";
import CargaGeneral from "../registro/carga-general/CargaGeneral";
import TablaDetalle from "../reportes/reporte-mensual/components/TablaDetalle";
import TablaRegistros from "../registro/movimientos-cargados/TablaRegistros";
import ConciliacionPanel from "../conciliacion/ConciliacionPanel";
import CargaSeleccionTipo from "../registro/carga-general/CargaSeleccionTipo";
import CargaSeleccionMetodo from "../registro/carga-general/CargaSeleccionMetodo";
import CargaVistaFinal from "../registro/carga-general/CargaVistaFinal";

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
        element: <TablaRegistros />,
    },
    {
        label: "Conciliación",
        path: "/conciliacion",
        icon: <LinkIcon />,
        element: <ConciliacionPanel />,
    },
    {
        label: "Consolidación Bancaria",
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
            { label: "Ver movimientos consolidados", icon: <DescriptionIcon /> },
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
        label: "Administración",
        icon: <StorageIcon />,
        path: "/administracion",
        children: [
            {
                label: "Invitaciones",
                path: "/invitaciones",
                icon: <DescriptionIcon />,
                element: <Invitaciones />,
            },
            {
                label: "Roles",
                path: "/roles",
                icon: <DescriptionIcon />,
                element: <Roles />,
            },
            {
                label: "Historial de cambios",
                path: "/Historial",
                icon: <DescriptionIcon />,
                element: <HistorialCambios />,
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
