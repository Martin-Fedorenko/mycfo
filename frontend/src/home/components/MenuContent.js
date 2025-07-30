import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';

const menuItems = [
  {
    label: 'Carga de Datos',
    icon: <StorageIcon />,
    children: [
      { label: 'Carga Manual', path: '/carga-manual', icon: <DescriptionIcon /> },
      { label: 'Carga mediante Documento', path: '/carga-documento', icon: <DescriptionIcon /> },
      { label: 'Carga mediante Audio',  icon: <DescriptionIcon /> },
      { label: 'Carga mediante Imagen',  icon: <DescriptionIcon /> },
      { label: 'Carga mediante API',  icon: <DescriptionIcon /> },
    ],
  },
  {
    label: 'Consolidación Bancaria',
    icon: <StorageIcon />,
    children: [
      { label: 'Carga de movimientos',  icon: <DescriptionIcon /> },
      { label: 'Ver movimientos consolidados',  icon: <DescriptionIcon /> },
    ],
  },
  {
    label: 'Reportes',
    icon: <StorageIcon />,
    children: [
      { label: 'Reporte mensual', path: '/reporte-mensual', icon: <DescriptionIcon /> },
      { label: 'Reporte diario',  icon: <DescriptionIcon /> },
      { label: 'Cash Flow', path: '/cash-flow', icon: <DescriptionIcon /> },
      { label: 'Profit & Loss', icon: <DescriptionIcon /> },
    ],
  },
  {
    label: 'Pronóstico',
    icon: <StorageIcon />,
    children: [
      { label: 'Presupuesto',  icon: <DescriptionIcon /> },
      { label: 'Cash Flow Forecast', icon: <DescriptionIcon /> },
      { label: 'Rolling Forecast', icon: <DescriptionIcon /> },
    ],
  },
];

export default function MenuContent() {
  const [openMenus, setOpenMenus] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {menuItems.map((item, index) => {
          const isParentActive =
           (item.path && isActive(item.path)) ||
            (item.children?.some((child) => isActive(child.path)));

          return (
            <React.Fragment key={index}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={
                    item.children
                      ? () => handleToggle(item.label)
                      : () => navigate(item.path)
                  }
                  selected={isParentActive}
                  sx={{ mb: 0.5 }} 
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.children ? (
                    openMenus[item.label] ? <ExpandLess /> : <ExpandMore />
                  ) : null}
                </ListItemButton>
              </ListItem>

              {item.children && (
                <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit >
                  <List component="div" disablePadding>
                    {item.children.map((child, childIndex) => (
                      <ListItem key={childIndex} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => navigate(child.path)}
                          selected={isActive(child.path)}
                        >
                          <ListItemIcon>{child.icon}</ListItemIcon>
                          <ListItemText primary={child.label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Stack>
  );
}
