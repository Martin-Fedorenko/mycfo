import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

const QuickActions = ({ actions = [], loading = false, onAction }) => {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ width: "100%" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Skeleton variant="text" width={160} />
          <Box sx={{ display: "flex", gap: 1 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                variant="rounded"
                width={120}
                height={40}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        backdropFilter: "blur(6px)",
        borderRadius: 2,
        mx: "auto",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Acciones rápidas
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: { xs: "nowrap", md: "wrap" },
            overflowX: { xs: "auto", md: "visible" },
            gap: 1,
            pb: { xs: 0.5, md: 0 },
            justifyContent: { xs: "flex-start", md: "center" },
            alignItems: "center",
            width: "100%",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outlined"
              color="primary"
              startIcon={action.icon}
              onClick={() => onAction?.(action)}
              sx={{
                flexShrink: 0,
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: "none",
                minWidth: { xs: 140, md: 150 },
                fontWeight: 600,
              }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
