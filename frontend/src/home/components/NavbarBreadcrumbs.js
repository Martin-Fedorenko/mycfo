import React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation, Link as RouterLink, matchPath } from 'react-router-dom';
import Link from '@mui/material/Link';

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
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
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
        MyCFO
      </Link>

      {/* Resto de los breadcrumbs dinámicos */}
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        const matchResult = findMatchingRoute(to);
        let label;

        if (matchResult) {
          const { route, params } = matchResult;
          const paramValues = params && Object.values(params);

          if (paramValues.length > 0) {
            label = capitalizeFirst(paramValues[0]); // mostrar ID
          } else {
            label = capitalizeFirst(route.label || value); // usar label si está
          }
        } else {
          label = capitalizeFirst(value); // fallback
        }

        return isLast ? (
          <Typography
            variant="body1"
            sx={{ color: 'text.primary', fontWeight: 600 }}
            key={to}
          >
            {label}
          </Typography>
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
            {label}
          </Link>
        );
      })}
    </StyledBreadcrumbs>
  );
}
