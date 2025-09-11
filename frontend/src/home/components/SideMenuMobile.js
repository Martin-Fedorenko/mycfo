import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MenuButton from './MenuButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Box } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LogoutButton from './LogoutButton';

function SideMenuMobile({ open, toggleDrawer }) {
  return (
    <Drawer
      anchor="top"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Stack sx={{ width: '100%', p: 2, gap: 2 }}>
        {/* Header similar al AppBar */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            width: '100%',
            gap: 1,
          }}
        >
          {/* Icono + Título */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'center', alignItems: 'center', mr: 'auto' }}
          >
            <CustomIcon />
            <Typography variant="h4" component="h1" sx={{ color: 'text.primary' }}>
              MyCFO
            </Typography>
          </Stack>

          {/* Tus propios botones: Perfil y Logout */}
          <Tooltip title="Perfil">
            <IconButton size="small" color="primary" onClick={() => console.log("Perfil")}>
              <PersonRoundedIcon />
            </IconButton>
          </Tooltip>

          <LogoutButton />

          {/* Cerrar menú (como botón de hamburguesa invertido) */}
          <MenuButton aria-label="cerrar menú" onClick={toggleDrawer(false)}>
            <MenuRoundedIcon />
          </MenuButton>
        </Stack>

        <Divider />

        {/* Avatar + nombre (opcional si querés mantenerlo aparte) */}
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Avatar
            sizes="small"
            alt="Riley Carter"
            src="/static/images/avatar/7.jpg"
            sx={{ width: 24, height: 24 }}
          />
          <Typography component="p" variant="h6">
            Riley Carter
          </Typography>
        </Stack>

        <Divider />

        {/* Menú navegable */}
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;

// Aquí está el único cambio real: reemplazar el CustomIcon original con tu versión
function CustomIcon() {
  return (
    <Box
      component="img"
      src={`${process.env.PUBLIC_URL}/logo512.png`}
      alt="Logo MyCFO"
      sx={{
        width: '1.5rem',
        height: '1.5rem',
        objectFit: 'cover',
      }}
      onError={(e) => {
        console.error('Error al cargar logo:', e.target.src);
        e.target.style.backgroundColor = 'lightcoral';
        e.target.style.opacity = 0.5;
        e.target.style.objectFit = 'unset';
      }}
    />
  );
}