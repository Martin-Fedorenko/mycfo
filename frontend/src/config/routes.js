import CargaManual from '../registro/carga-manual/CargaManual';
import CargaDocumento from '../registro/carga-documento/CargaDocumento';
import ReporteMensual from '../reportes/reporte-mensual/ReporteMensual';
import CargaExcel from '../registro/carga-excel/CargaExcel';
import CashFlow from '../reportes/cash-flow/CashFlow';
import Notificaciones from '../notificaciones/listado-notificaciones/Notificaciones';
import Presupuesto from '../pronostico/presupuesto/Presupuesto';
import PresupuestoNuevo from '../pronostico/presupuesto/components/PresupuestoNuevo';
import PresupuestoDetalle from '../pronostico/presupuesto/components/PresupuestoDetalle';
import CashFlowForecast from '../pronostico/rolling-forecast/RollingForecast';
import RollingForecast from '../pronostico/cash-flow-forecast/CashFlowForecast';

/*
path: endpoint
element: a donde va a buscar el componente que va a mostrar
lable: lo que va a mostrar en el breadcrumb
*/

const routeConfig = [
  { path: 'carga-manual', element: <CargaManual />, label: 'Carga Manual' },
  { path: 'carga-documento', element: <CargaDocumento />, label: 'Carga Documento' },
  { path: 'reporte-mensual', element: <ReporteMensual />, label: 'Reporte Mensual' },
  { path: 'carga-excel', element: <CargaExcel />, label: 'Carga Excel' },
  { path: 'cash-flow', element: <CashFlow />, label: 'Cash Flow' },
  { path: 'listado-notificaciones', element: <Notificaciones />, label: 'Notificaciones' },
  { path: 'presupuesto', element: <Presupuesto />, label: 'Presupuesto' },
  { path: 'presupuesto/nuevo', element: <PresupuestoNuevo />, label: 'Nuevo' },
  { path: 'presupuesto/:id', element: <PresupuestoDetalle />, label: 'Detalle' },
  { path: 'cash-flow-forecast', element: <CashFlowForecast />, label: 'Cash Flow Forecast' },
  { path: 'rolling-forecast', element: <RollingForecast />, label: 'Rolling Forecast' },
];

export default routeConfig;
