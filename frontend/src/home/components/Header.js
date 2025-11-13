import * as React from 'react';
import Stack from '@mui/material/Stack';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import NotificationButton from '../../notificaciones/notification-button/NotificationButton';
import MenuButton from './MenuButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

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
