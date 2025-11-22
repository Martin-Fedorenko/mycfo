import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from '@mui/material';
import { listItemTextClasses } from '@mui/material/ListItemText';
import { typographyClasses } from '@mui/material/Typography';
import { svgIconClasses } from '@mui/material/SvgIcon';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import routeConfig from '../../config/routes';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.3s, color 0.3s',
  color: '#000',
  '& .MuiListItemIcon-root': {
    minWidth: 'auto',
    marginRight: theme.spacing(2),
    color: 'inherit !important',
    transition: 'color 0.3s',
    [`& .${svgIconClasses.root}`]: {
      color: 'inherit !important',
    },
  },
  [`& .${listItemTextClasses.primary}`]: {
    fontSize: '0.95rem',
    fontWeight: 500,
    fontFamily: theme.typography.fontFamily,
    color: 'inherit !important',
  },
  [`& .${typographyClasses.root}`]: {
    color: 'inherit !important',
  },
  '&:hover': {
    backgroundColor: '#008375',
    color: '#fff',
  },
  '&.Mui-selected': {
    backgroundColor: '#008375 !important',
    color: '#fff !important',
    [`& .${listItemTextClasses.primary}`]: {
      fontWeight: 'bold',
      color: 'inherit !important',
    },
    '&:hover': {
      backgroundColor: '#008375',
      color: '#fff',
    },
  },
  ...(theme.applyStyles
    ? theme.applyStyles('dark', {
        color: '#fff',
        '&.Mui-selected': {
          backgroundColor: '#008375 !important',
          color: '#fff !important',
        },
        '&:hover': {
          backgroundColor: '#008375',
          color: '#000',
        },
      })
    : theme.palette.mode === 'dark'
    ? {
        color: '#fff',
        '&.Mui-selected': {
          backgroundColor: '#008375 !important',
          color: '#fff !important',
        },
        '&:hover': {
          backgroundColor: '#008375',
          color: '#000',
        },
      }
    : {}),
}));

export default function MenuContent({ onNavigate }) {
  const theme = useTheme();
  const [openMenus, setOpenMenus] = React.useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const getMenuTextSx = React.useCallback(
    (label) => {
      const base = {
        color: 'inherit',
        fontSize: '0.95rem',
        fontWeight: 500,
        fontFamily: theme.typography.fontFamily,
      };

      if (label === 'Notificaciones') {
        return {
          ...base,
          fontSize: theme.typography.h4.fontSize,
          fontWeight: theme.typography.h4.fontWeight,
        };
      }

      return base;
    },
    [theme.typography.fontFamily, theme.typography.h4.fontSize, theme.typography.h4.fontWeight],
  );

  const handleNavigate = (path) => {
    navigate(path);
    if (typeof onNavigate === 'function') {
      onNavigate();
    }
  };

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [label]: !prev[label],
    }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
        <List dense>
          {routeConfig
            .filter((item) => !item.hidden)
            .map((item, index) => {
              const isParentActive =
                (item.path && isActive(item.path)) ||
                item.children?.some((child) => isActive(child.path));

              return (
                <React.Fragment key={index}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <StyledListItemButton
                      onClick={
                        item.children
                          ? () => handleToggle(item.label)
                          : () => handleNavigate(item.path)
                      }
                      selected={isParentActive}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ sx: getMenuTextSx(item.label) }}
                      />
                      {item.children ? (
                        openMenus[item.label] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )
                      ) : null}
                    </StyledListItemButton>
                  </ListItem>

                  {item.children && (
                    <Collapse
                      in={openMenus[item.label]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding sx={{ pl: 2 }}>
                        {item.children.map((child, childIndex) => (
                          <ListItem
                            key={childIndex}
                            disablePadding
                            sx={{ display: 'block' }}
                          >
                            <StyledListItemButton
                              sx={{ pl: 4 }}
                              onClick={() => handleNavigate(child.path)}
                              selected={isActive(child.path)}
                            >
                              <ListItemIcon>{child.icon}</ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{ sx: getMenuTextSx(child.label) }}
                              />
                            </StyledListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            })}
        </List>
      </Box>
    </Stack>
  );
}
