import React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';


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

export default function NavbarBreadcrumbs({ routeConfig }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      {pathnames.length === 0 ? (
        <Typography
          variant="body1"
          sx={{ color: 'text.primary', fontWeight: 600 }}
        >
          MyCFO
        </Typography>
      ) : (
        <Link
          component={RouterLink}
          to="/"
          variant="body1"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'none',
              color: 'text.primary',
            },
            '&:active': {
              textDecoration: 'none',
              color: 'text.primary',
            },
          }}
        >
          MyCFO
        </Link>
      )}

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        const partialPath = pathnames.slice(0, index + 1).join('/');

        const matchedRoute = routeConfig.find((route) => {
          const routeSegments = route.path.split('/');
          const pathSegments = partialPath.split('/');

          if (routeSegments.length !== pathSegments.length) return false;

          return routeSegments.every((seg, i) =>
            seg.startsWith(':') || seg === pathSegments[i]
          );
        });

        let label;

        if (matchedRoute) {
          if (matchedRoute.label === 'Detalle') {

            label = `Detalle ${value}`;
          } else {
            label = matchedRoute.label;
          }
        } else {
          label = value.charAt(0).toUpperCase() + value.slice(1);
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
              '&:hover': {
                textDecoration: 'none',
                color: 'text.primary',
              },
              '&:active': {
                textDecoration: 'none',
                color: 'text.primary',
              },
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
