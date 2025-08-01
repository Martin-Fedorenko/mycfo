import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function MainGrid({ alerts = [], onClose }) {
  return (
    <Box sx={{ width: 320, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Notificaciones
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <List>
        {alerts.length === 0 ? (
          <Typography variant="body2">
            No hay notificaciones pendientes.
          </Typography>
        ) : (
          alerts.map((alert, idx) => (
            <ListItem button key={idx} onClick={onClose}>
              <ListItemText
                primary={alert.titulo}
                secondary={`${alert.fecha} – ${alert.tipo}`}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}
