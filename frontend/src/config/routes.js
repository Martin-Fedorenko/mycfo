import StorageIcon from '@mui/icons-material/Storage';
import DescriptionIcon from '@mui/icons-material/Description';

import CargaManual from '../registro/carga-manual/CargaManual';
import CargaDocumento from '../registro/carga-documento/CargaDocumento';
import ReporteMensual from '../reportes/reporte-mensual/ReporteMensual';
import CargaMovimientos from '../consolidacion/carga-movimientos/CargaMovimientos';
import CashFlow from '../reportes/cash-flow/CashFlow';
import Notificaciones from '../notificaciones/listado-notificaciones/Notificaciones';
import Presupuesto from '../pronostico/presupuesto/Presupuesto';
import PresupuestoNuevo from '../pronostico/presupuesto/components/PresupuestoNuevo';
import PresupuestoDetalle from '../pronostico/presupuesto/components/PresupuestoDetalle';
import MesDetalle from '../pronostico/presupuesto/components/MesDetalle';
import CashFlowForecast from '../pronostico/rolling-forecast/RollingForecast';
import RollingForecast from '../pronostico/cash-flow-forecast/CashFlowForecast';
import HistorialCambios from '../administracion/historial-cambios/HistorialCambios';
import Roles from '../administracion/roles/Roles';
import Invitaciones from '../administracion/invitaciones/Invitaciones';

const routeConfig = [
  {
    label: "Carga de Datos",
    icon: <StorageIcon />,
    children: [
      {
        label: "Carga Manual",
        path: "/carga-manual",
        icon: <DescriptionIcon />,
        element: <CargaManual />
      },
      {
        label: "Carga mediante Documento",
        path: "/carga-documento",
        icon: <DescriptionIcon />,
        element: <CargaDocumento />
      },
      { label: "Carga mediante Audio", icon: <DescriptionIcon /> },
      { label: "Carga mediante Imagen", icon: <DescriptionIcon /> },
      { label: "Carga mediante API", icon: <DescriptionIcon /> },
    ],
  },
  {
    label: "Consolidación Bancaria",
    icon: <StorageIcon />,
    children: [
      {
        label: "Carga de movimientos",
        path: "/carga-movimientos",
        icon: <DescriptionIcon />,
        element: <CargaMovimientos />
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
        element: <ReporteMensual />
      },
      { label: "Reporte diario", icon: <DescriptionIcon /> },
      { 
        label: "Cash Flow",
        path: "/cash-flow",
        icon: <DescriptionIcon />,
        element: <CashFlow />
      },
      { label: "Profit & Loss", icon: <DescriptionIcon /> },
    ],
  },
  {
    label: "Pronóstico",
    icon: <StorageIcon />,
    children: [
      {
        label: "Presupuesto",
        path: "/presupuesto",
        icon: <DescriptionIcon />,
        element: <Presupuesto />,
        children: [
          {
            label: "Nuevo",
            path: "/presupuesto/nuevo",
            element: <PresupuestoNuevo />
          },
          {
            label: "Detalle",
            path: "/presupuesto/:id",
            element: <PresupuestoDetalle />
          },
          {
          label: (params) => `Mes ${params.mes} - ${params.id}`, // función para generar label dinámico
          path: "/presupuesto/:id/mes/:mes",
          element: <MesDetalle />
          },
        ]
      },
      {
        label: "Cash Flow Forecast",
        path: "/cash-flow-forecast",
        icon: <DescriptionIcon />,
        element: <CashFlowForecast />
      },
      {
        label: "Rolling Forecast",
        path: "/rolling-forecast",
        icon: <DescriptionIcon />,
        element: <RollingForecast />
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
        element: <Invitaciones />
      },
      {
        label: "Roles",
        path: "/roles",
        icon: <DescriptionIcon />,
        element: <Roles />
      },
      {
        label: "Historial de cambios",
        path: "/Historial",
        icon: <DescriptionIcon />,
        element: <HistorialCambios />
      },
    ],
  },
  {
    label: "Notificaciones",
    icon: <StorageIcon />,
    path: "/listado-notificaciones",
    element: <Notificaciones />
  },
];

export default routeConfig;
