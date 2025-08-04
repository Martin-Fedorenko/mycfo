import * as React from "react";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import NotificationDrawer from "../../notificaciones/notification-drawer/NotificationDrawer";

export default function Header() {
  
  const [openDrawer, setOpenDrawer] = React.useState(false);

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

  return (
    <>
      <Stack
        direction="row"
        sx={{
          display: { xs: "none", md: "flex" },
          width: "100%",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          maxWidth: { sm: "100%", md: "1700px" },
          pt: 1.5,
        }}
        spacing={2}
      >
        <NavbarBreadcrumbs />
        <Stack direction="row" sx={{ gap: 1 }}>
          <IconButton
            aria-label="Open notifications"
            color="inherit"
            onClick={() => setOpenDrawer(true)}
          >
            <Badge
              variant={notificaciones.length > 0 ? "dot" : "standard"}
              color="error"
            >
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
          <ColorModeIconDropdown />
        </Stack>
      </Stack>

      <NotificationDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        alerts={notificaciones}
      />
    </>
  );
}
