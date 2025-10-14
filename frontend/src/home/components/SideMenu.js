import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutButton from './LogoutButton';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const drawerWidth = 380;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

// Icono de la marca (funciona)
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

export default function SideMenu({
  variant = 'permanent',
  open = true,
  onClose,
  onNavigate,
}) {
  const navigate = useNavigate();
  const isTemporary = variant !== 'permanent';

  // 🔹 Datos de usuario obtenidos del sessionStorage
  const [userData, setUserData] = React.useState({
    name: '',
    familyName: '',
    email: '',
  });

React.useEffect(() => {
  const updateUserData = () => {
    const storedName = sessionStorage.getItem('name') || '';
    const storedFamilyName = sessionStorage.getItem('family_name') || '';
    const storedEmail = sessionStorage.getItem('email') || '';
    setUserData({
      name: storedName,
      familyName: storedFamilyName,
      email: storedEmail,
    });
  };

  // Cargar inicial
  updateUserData();

  // Escuchar cambios
  window.addEventListener("userDataUpdated", updateUserData);

  return () => {
    window.removeEventListener("userDataUpdated", updateUserData);
  };
}, []);

  return (
    <Drawer
      variant={variant}
      open={isTemporary ? open : undefined}
      onClose={isTemporary ? onClose : undefined}
      ModalProps={
        isTemporary
          ? {
              keepMounted: true,
            }
          : undefined
      }
      sx={{
        display: isTemporary ? 'block' : { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        component={RouterLink}
        to="/dashboard"
        aria-label="Ir al dashboard"
        sx={{
          display: 'flex',
          mt: isTemporary ? 2 : 'calc(var(--template-frame-height, 0px) + 4px)',
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
        <MenuContent onNavigate={onNavigate || onClose} />
      </Box>

      {/* Pie con datos del usuario */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt={`${userData.name} ${userData.familyName}`}
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: '16px' }}
          >
            {userData.name || 'Nombre'} {userData.familyName || ''}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {userData.email || 'correo@ejemplo.com'}
          </Typography>
        </Box>
        <Tooltip title="Organización">
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate('/organizacion')}
          >
            <ApartmentIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Perfil">
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate('/perfil')}
          >
            <PersonRoundedIcon />
          </IconButton>
        </Tooltip>
        <LogoutButton />
      </Stack>
    </Drawer>
  );
}
