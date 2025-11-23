import * as React from 'react';

import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import SideMenu from './components/SideMenu';
import SideMenuMobile from './components/SideMenuMobile';
import AppTheme from '../shared-theme/AppTheme';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';

const Home = React.memo(function Home(props) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleToggleSidebar = React.useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = React.useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        {/* Drawer móvil que baja desde arriba, controlado por el Header en pantallas chicas */}
        <SideMenuMobile
          open={sidebarOpen}
          toggleDrawer={(newOpen) => () => setSidebarOpen(newOpen)}
        />
        <SideMenu
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          onNavigate={handleCloseSidebar}
        />
        <Box
          component="main"
          sx={(theme) => ({
            position: 'relative',
            zIndex: 0,
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            ml: 0, // Ocupar todo el ancho
            '&::before': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: 460,
              background:
                'linear-gradient(180deg, rgba(0, 131, 117, 0.95) 0%, rgba(0, 131, 117, 0.6) 45%, rgba(0, 131, 117, 0) 100%)',
              pointerEvents: 'none',
              zIndex: 0,
            },
          })}
        >
          <Stack
            spacing={2}
            sx={{
              position: 'relative',
              zIndex: 1,
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 2 }, // Ajuste de margen superior
            }}
          >
            <Header onToggleSidebar={handleToggleSidebar} />
            <Outlet />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
});

export default Home;




