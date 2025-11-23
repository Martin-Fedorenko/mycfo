import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import LogoutButton from './LogoutButton';
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 380;

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
  },
}));

// Icono de la marca
const CustomIcon = () => {
  return (
    <Box
      component="img"
      src={`${process.env.PUBLIC_URL}/logo192.png`}
      alt="Logo MyCFO"
      sx={{
        width: '2rem',
        height: '2rem',
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
};

const SideMenu = React.memo(function SideMenu({
  open,
  onClose,
  onNavigate,
  onHoverStart,
  onHoverEnd,
}) {
  const [userData, setUserData] = React.useState({
    nombre: '',
    email: '',
  });

  React.useEffect(() => {
    const updateUserData = () => {
      const storedNombre = sessionStorage.getItem('nombre') || '';
      const storedEmail = sessionStorage.getItem('email') || '';
      setUserData({
        nombre: storedNombre,
        email: storedEmail,
      });
    };

    updateUserData();
    window.addEventListener('userDataUpdated', updateUserData);

    return () => {
      window.removeEventListener('userDataUpdated', updateUserData);
    };
  }, []);

  return (
    <Drawer
      anchor="left"
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
      PaperProps={{
        onMouseEnter: onHoverStart,
        onMouseLeave: onHoverEnd,
      }}
    >
      <Box
        component={RouterLink}
        to="/"
        onClick={onNavigate}
        aria-label="Ir al inicio"
        sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
          textDecoration: 'none',
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        <CustomIcon />
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: 'text.primary', marginLeft: 1 }}
        >
          MyCFO
        </Typography>
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent onNavigate={onNavigate} />
      </Box>

      {/* Pie con datos del usuario */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt={userData.nombre}
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: '16px' }}
          >
            {userData.nombre || 'Nombre Usuario'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {userData.email || 'correo@ejemplo.com'}
          </Typography>
        </Box>
        <LogoutButton />
      </Stack>
    </Drawer>
  );
});

export default SideMenu;
