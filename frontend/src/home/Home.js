import * as React from "react";

import { alpha, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import SideMenu from "./components/SideMenu";
import SideMenuMobile from "./components/SideMenuMobile";
import AppTheme from "../shared-theme/AppTheme";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import useMediaQuery from "@mui/material/useMediaQuery";

const Home = React.memo(function Home(props) {
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = React.useState(false);
  const desktopMenuCloseTimer = React.useRef(null);

  const clearDesktopMenuCloseTimer = React.useCallback(() => {
    if (desktopMenuCloseTimer.current) {
      clearTimeout(desktopMenuCloseTimer.current);
      desktopMenuCloseTimer.current = null;
    }
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopMenuOpen(false);
    clearDesktopMenuCloseTimer();
  }, [location.pathname, clearDesktopMenuCloseTimer]);

  React.useEffect(() => {
    if (!isDesktop) {
      setDesktopMenuOpen(false);
      clearDesktopMenuCloseTimer();
    }
  }, [isDesktop, clearDesktopMenuCloseTimer]);

  React.useEffect(
    () => () => {
      clearDesktopMenuCloseTimer();
    },
    [clearDesktopMenuCloseTimer]
  );

  const handleToggleMobileMenu = React.useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleCloseMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleOpenDesktopMenu = React.useCallback(() => {
    if (!isDesktop) return;
    clearDesktopMenuCloseTimer();
    setDesktopMenuOpen(true);
  }, [clearDesktopMenuCloseTimer, isDesktop]);

  const scheduleCloseDesktopMenu = React.useCallback(() => {
    if (!isDesktop) return;
    clearDesktopMenuCloseTimer();
    desktopMenuCloseTimer.current = setTimeout(() => {
      setDesktopMenuOpen(false);
    }, 200);
  }, [clearDesktopMenuCloseTimer, isDesktop]);

  const handleCloseDesktopMenu = React.useCallback(() => {
    clearDesktopMenuCloseTimer();
    setDesktopMenuOpen(false);
  }, [clearDesktopMenuCloseTimer]);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        {/* Menú lateral desktop: aparece al hacer hover en el borde izquierdo */}
        {isDesktop && (
          <>
            <Box
              aria-label="zona de activación menú lateral"
              onMouseEnter={handleOpenDesktopMenu}
              onMouseLeave={scheduleCloseDesktopMenu}
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: 12,
                zIndex: (theme) => theme.zIndex.drawer - 1,
              }}
            />
            <SideMenu
              open={desktopMenuOpen}
              onClose={handleCloseDesktopMenu}
              onNavigate={handleCloseDesktopMenu}
              onHoverStart={handleOpenDesktopMenu}
              onHoverEnd={scheduleCloseDesktopMenu}
            />
          </>
        )}

        {/* Menú móvil que baja desde arriba (controlado por el Header en pantallas chicas) */}
        <SideMenuMobile
          open={mobileMenuOpen}
          toggleDrawer={(newOpen) => () => setMobileMenuOpen(newOpen)}
        />

        <Box
          component="main"
          sx={(theme) => ({
            position: "relative",
            zIndex: 0,
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
            ml: 0,
            "&::before": {
              content: '""',
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: 460,
              background:
                "linear-gradient(180deg, rgba(0, 131, 117, 0.95) 0%, rgba(0, 131, 117, 0.6) 45%, rgba(0, 131, 117, 0) 100%)",
              pointerEvents: "none",
              zIndex: 0,
            },
          })}
        >
          <Stack
            spacing={2}
            sx={{
              position: "relative",
              zIndex: 1,
              mx: 3,
              pb: 5,
              minHeight: "100vh",
              alignItems: "center",
            }}
          >
            <Header onToggleSidebar={handleToggleMobileMenu} />
            <Box
              sx={{
                flexGrow: 1,
                width: "100%",
                maxWidth: { sm: "100%", md: "1700px" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Outlet />
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
});

export default Home;
