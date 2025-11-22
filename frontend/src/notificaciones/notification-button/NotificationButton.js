// components/NotificationButton.js

import React from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NotificationDrawer from "../notification-drawer/NotificationDrawer";
import Box from "@mui/material/Box";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";

export default function NotificationButton(props) {
  const [openDrawer, setOpenDrawer] = React.useState(false);

  // Obtener userId del estado de autenticación
  const { userId, isAuthenticated } = useAuth();
  
  // Solo usar notificaciones si está autenticado
  const { items, unread, loading, error, markAllAsRead, isWebSocketConnected } =
    useNotifications(isAuthenticated ? userId : null);

  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

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
        <Tooltip
          title={
            isWebSocketConnected
              ? `Notificaciones (${unread} sin leer)`
              : `Notificaciones (${unread} sin leer)`
          }
        >
          <IconButton
            onClick={handleOpenDrawer}
            disableRipple
            size="small"
            aria-label="Open notifications"
            disabled={loading}
            {...props}
          >
            <Badge
              badgeContent={unread}
              color="error"
              overlap="circular"
              max={99}
            >
              <NotificationsRoundedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <NotificationDrawer
        open={openDrawer}
        onClose={handleCloseDrawer}
        notifications={items}
        unreadCount={unread}
        loading={loading}
        error={error}
        onMarkAllRead={markAllAsRead}
      />
    </React.Fragment>
  );
}
