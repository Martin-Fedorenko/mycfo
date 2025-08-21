const meses = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const labels = {
  vincularTitle: "Para comenzar a utilizar la integración con Mercado Pago",
  vincularDesc:
    "Autorizanos a acceder a tu perfil para importar cobranzas y generar facturas internas.",
  iniciarVinculacion: "Iniciar vinculación",
};

const estadosPago = {
  approved: "Aprobado",
  pending: "Pendiente",
  rejected: "Rechazado",
  refunded: "Reembolsado",
  charged_back: "Chargeback",
};

export default { meses, labels, estadosPago };
