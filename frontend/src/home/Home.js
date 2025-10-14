import * as React from 'react';

import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';




export default function Home(props) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
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
        <SideMenu
          variant={isDashboard ? 'temporary' : 'permanent'}
          open={isDashboard ? sidebarOpen : undefined}
          onClose={handleCloseSidebar}
          onNavigate={handleCloseSidebar}
          isDashboard={isDashboard}
        />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
          }}
        >
          <Header
            isDashboard={isDashboard}
            onToggleSidebar={isDashboard ? handleToggleSidebar : undefined}
          />
          <Outlet />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}




