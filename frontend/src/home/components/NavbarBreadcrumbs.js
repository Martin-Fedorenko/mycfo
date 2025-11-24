import React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation, Link as RouterLink, matchPath } from 'react-router-dom';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Logo from '../../shared-components/Logo';

import routeConfig from '../../config/routes';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

function findMatchingRoute(path) {
  function search(routes) {
    for (const route of routes) {
      if (route.path) {
        const match = matchPath({ path: route.path, end: true }, path);
        if (match) {
          return { route, params: match.params };
        }
      }
      if (route.children) {
        const found = search(route.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(routeConfig);
}

function capitalizeFirst(text = '') {
  if (typeof text !== 'string') return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatLabel(input) {
  return typeof input === 'string' ? capitalizeFirst(input) : input;
}

export default function NavbarBreadcrumbs({ sx }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const renderCrumbContent = (label, icon) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {icon
        ? React.cloneElement(icon, {
            fontSize: 'small',
            sx: { color: 'text.secondary' },
          })
        : null}
      <Typography component="span" variant="body1" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
      sx={sx}
    >
      {/* Primer breadcrumb fijo */}
      <Link
        component={RouterLink}
        to="/"
        variant="body1"
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          textDecoration: 'none',
          '&:hover': { textDecoration: 'none', color: 'text.primary' },
          '&:active': { textDecoration: 'none', color: 'text.primary' },
        }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Logo size={48} />
          <Typography component="span" variant="body1" sx={{ fontWeight: 600 }}>
            MyCFO
          </Typography>
        </Box>
      </Link>

      {/* Resto de los breadcrumbs dinámicos */}
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        const matchResult = findMatchingRoute(to);
        let label;
        let icon = null;

        if (matchResult) {
          const { route, params } = matchResult;
          if (route.breadcrumb) {
            const bc = route.breadcrumb(params);
            if (bc && typeof bc === 'object') {
              label = bc.label;
              icon = bc.icon ?? route.icon ?? null;
            } else {
              label = bc;
            }
          } else if (typeof route.label === 'function') {
            // Support dynamic labels defined as functions in route config
            label = route.label(params);
          } else {
            label = formatLabel(route.label ?? value);
          }
          icon = icon || route.icon || null;
        } else {
          label = formatLabel(value);
        }

        if (label === null || label === undefined || label === false) {
          return null;
        }

        return isLast ? (
          <Box key={to} sx={{ color: 'text.primary' }}>
            {renderCrumbContent(label, icon)}
          </Box>
        ) : (
          <Link
            component={RouterLink}
            to={to}
            variant="body1"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'none', color: 'text.primary' },
              '&:active': { textDecoration: 'none', color: 'text.primary' },
            }}
            key={to}
          >
            {renderCrumbContent(label, icon)}
          </Link>
        );
      })}
    </StyledBreadcrumbs>
  );
}
