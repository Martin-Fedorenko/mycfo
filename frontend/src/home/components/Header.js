import * as React from 'react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import NotificationButton from '../../notificaciones/notification-button/NotificationButton';
import MenuButton from './MenuButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { CustomIcon as AppLogoIcon } from './AppNavbar';

const Header = React.memo(function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Stack
      direction="row"
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      {/* Columna izquierda */}
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Mobile: logo que lleva al home */}
        <Stack
          component={RouterLink}
          to="/"
          sx={{
            display: { xs: 'flex', md: 'none' },
            textDecoration: 'none',
            color: 'inherit',
            minWidth: 0,
            lineHeight: 0,
            ml: 1,
          }}
          aria-label="Ir al inicio"
        >
          <AppLogoIcon />
        </Stack>
        {/* Desktop: breadcrumbs */}
        <NavbarBreadcrumbs sx={{ display: { xs: 'none', md: 'flex' } }} />
      </Stack>

      {/* Columna derecha */}
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        {isMobile ? (
          // Modo móvil: theme, notificaciones, menú lateral
          <>
            <ColorModeIconDropdown />
            <NotificationButton />
            <MenuButton aria-label="abrir menú" onClick={onToggleSidebar}>
              <MenuRoundedIcon />
            </MenuButton>
          </>
        ) : (
          // Modo desktop: theme, perfil, organización, notificaciones
          <>
            <ColorModeIconDropdown />
            <Tooltip title="Perfil">
              <IconButton
                size="small"
                color="primary"
                sx={{
                  transition: 'color 0.2s, background-color 0.2s',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0,131,117,0.12)',
                    color: '#008375',
                  },
                }}
                onClick={() => navigate('/perfil')}
              >
                <PersonRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Organización">
              <IconButton
                size="small"
                color="primary"
                sx={{
                  transition: 'color 0.2s, background-color 0.2s',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0,131,117,0.12)',
                    color: '#008375',
                  },
                }}
                onClick={() => navigate('/organizacion')}
              >
                <ApartmentIcon />
              </IconButton>
            </Tooltip>
            <NotificationButton />
          </>
        )}
      </Stack>
    </Stack>
  );
});

export default Header;
