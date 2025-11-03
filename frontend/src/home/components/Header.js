import * as React from "react";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import NotificationButton from "../../notificaciones/notification-button/NotificationButton";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

export default function Header({ onToggleSidebar = () => {} }) {
  return (
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
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          aria-label="Abrir menu de navegacion"
          onClick={onToggleSidebar}
          size="large"
          edge="start"
        >
          <MenuRoundedIcon />
        </IconButton>
        <NavbarBreadcrumbs />
      </Stack>
      <Stack direction="row" sx={{ gap: 1 }}>
        <NotificationButton />
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
