import * as React from 'react';
import Stack from '@mui/material/Stack';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import NotificationButton from '../../notificaciones/notification-button/NotificationButton';
import MenuButton from './MenuButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Link as RouterLink } from 'react-router-dom';
import { CustomIcon as AppLogoIcon } from './AppNavbar';

const Header = React.memo(function Header({ onToggleSidebar }) {
  return (
    <Stack
      direction="row"
      sx={{
        display: 'flex', // Visible en todos los tamaños
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Stack
          component={RouterLink}
          direction="row"
          spacing={0}
          alignItems="center"
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            mr: 1,
            minWidth: 0,
            lineHeight: 0, // keeps logo snug in the corner
          }}
          aria-label="Ir al inicio"
        >
          <AppLogoIcon />
        </Stack>
        <MenuButton
          aria-label="abrir menú"
          onClick={onToggleSidebar}
        >
          <MenuRoundedIcon />
        </MenuButton>
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
