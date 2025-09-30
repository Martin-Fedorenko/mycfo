import { Container, Typography, Alert } from "@mui/material";
import NotificationCard from "./NotificationCard";
import { useNotifications } from "../../hooks/useNotifications";

export default function ListaNotificaciones({ userId = 1 }) {
  const { items, unread, loading, error, markOneRead } =
    useNotifications(userId);

  if (loading)
    return (
      <Container sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Cargando notificaciones...
        </Typography>
      </Container>
    );
  if (error)
    return (
      <Container sx={{ mt: 2 }}>
        <Alert severity="error">
          No se pudieron cargar las notificaciones.
        </Alert>
      </Container>
    );

  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Notificaciones {unread > 0 ? `(${unread} sin leer)` : ""}
      </Typography>

      {items.map((n) => (
        <NotificationCard
          key={n.id}
          titulo={n.title}
          fecha={new Date(n.date).toLocaleDateString()}
          tipo={n.badge} // "Movimiento", "Recordatorio", etc.
          isRead={n.is_read}
          onClick={() => markOneRead(n.id)}
        />
      ))}
    </Container>
  );
}
