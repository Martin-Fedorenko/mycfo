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
  if (typeof text !== 'string') return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatLabel(input) {
  return typeof input === 'string' ? capitalizeFirst(input) : input;
}

export default function NavbarBreadcrumbs({ sx }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

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
          if (route.breadcrumb) {
            label = route.breadcrumb(params);
          } else if (typeof route.label === 'function') {
            // Support dynamic labels defined as functions in route config
            label = route.label(params);
          } else {
            label = formatLabel(route.label ?? value);
          }
        } else {
          label = formatLabel(value);
        }

        if (label === null || label === undefined || label === false) {
          return null;
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
