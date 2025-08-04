// components/NotificationButton.js

import React from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NotificationDrawer from "../notification-drawer/NotificationDrawer";
import Box from "@mui/material/Box";

// Notificaciones simuladas
const notificaciones = [
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
];

export default function NotificationButton(props) {
  const [openDrawer, setOpenDrawer] = React.useState(false);

  return (
    <React.Fragment>
      <Box
        sx={(theme) => ({
          verticalAlign: "bottom",
          display: "inline-flex",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: (theme.vars || theme).shape.borderRadius,
          border: "1px solid",
          borderColor: (theme.vars || theme).palette.divider,
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <IconButton
          onClick={() => setOpenDrawer(true)}
          disableRipple
          size="small"
          aria-label="Open notifications"
          {...props}
        >
          <Badge
            variant={notificaciones.length > 0 ? "dot" : "standard"}
            color="error"
            overlap="circular"
          >
            <NotificationsRoundedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Box>

      <NotificationDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        alerts={notificaciones}
      />
    </React.Fragment>
  );
}
