// ListaNotificaciones.js
import { Container, Typography } from "@mui/material";
import NotificationCard from "./NotificationCard";

const notificacionesEjemplo = [
  {
    titulo: "Vencimiento de monotributo",
    fecha: "01/08/2025",
    tipo: "Recordatorio",
  },
  {
    titulo: "Ingreso detectado en cuenta bancaria",
    fecha: "31/07/2025",
    tipo: "Movimiento",
  },
  {
    titulo: "Actualización de presupuesto disponible",
    fecha: "30/07/2025",
    tipo: "Presupuesto",
  },
];

export default function ListaNotificaciones() {
  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Notificaciones
      </Typography>
      {notificacionesEjemplo.map((notif, idx) => (
        <NotificationCard
          key={idx}
          titulo={notif.titulo}
          fecha={notif.fecha}
          tipo={notif.tipo}
        />
      ))}
    </Container>
  );
}
