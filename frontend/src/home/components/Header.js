import * as React from "react";
import Stack from "@mui/material/Stack";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import NotificationButton from "../../notificaciones/notification-button/NotificationButton";

const Header = React.memo(function Header() {
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
        <NavbarBreadcrumbs />
      </Stack>
      <Stack direction="row" sx={{ gap: 1 }}>
        <NotificationButton />
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
});

export default Header;
