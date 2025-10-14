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
import LogoutButton from './LogoutButton';

function SideMenuMobile({ open, toggleDrawer }) {
  // 🔹 Datos de usuario obtenidos de sessionStorage (desde la BD)
  const [userData, setUserData] = React.useState({
    nombre: '',
    email: '',
  });

  React.useEffect(() => {
  const loadData = () => {
    setUserData({
      nombre: sessionStorage.getItem('nombre') || '',
      email: sessionStorage.getItem('email') || '',
    });
  };

  loadData(); // lectura inicial

  const onStorageChange = () => loadData();
  window.addEventListener('storage', onStorageChange);

  return () => window.removeEventListener('storage', onStorageChange);
  }, []);


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

          {/* Botón Perfil */}
          <Tooltip title="Perfil">
            <IconButton size="small" color="primary" onClick={() => console.log("Perfil")}>
              <PersonRoundedIcon />
            </IconButton>
          </Tooltip>

          {/* Logout */}
          <LogoutButton />

          {/* Cerrar menú (hamburguesa invertida) */}
          <MenuButton aria-label="cerrar menú" onClick={toggleDrawer(false)}>
            <MenuRoundedIcon />
          </MenuButton>
        </Stack>

        <Divider />

        {/* Avatar + nombre y email del usuario */}
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Avatar
            sizes="small"
            alt={userData.nombre}
            src="/static/images/avatar/7.jpg"
            sx={{ width: 24, height: 24 }}
          />
          <Box>
            <Typography component="p" variant="h6">
              {userData.nombre || 'Nombre Usuario'}
            </Typography>
            <Typography component="p" variant="caption" sx={{ color: 'text.secondary' }}>
              {userData.email || 'correo@ejemplo.com'}
            </Typography>
          </Box>
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

// Logo de la app
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
