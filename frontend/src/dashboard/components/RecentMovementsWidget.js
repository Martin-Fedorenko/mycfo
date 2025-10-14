import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { formatCurrencyAR } from "../../utils/formatters";

const RecentMovementsWidget = ({
  data,
  loading = false,
  error = null,
  onRetry,
  onNavigate,
  onCategorize,
}) => {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title="Movimientos recientes & por categorizar" subheader="Cargando..." />
        <CardContent>
          <Skeleton variant="rectangular" height={180} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title="Movimientos recientes & por categorizar" />
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="error">{error}</Alert>
          {onRetry ? (
            <Button variant="outlined" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const movements = data ?? [];

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title="Movimientos recientes & por categorizar"
        subheader="Últimos egresos e ingresos pendientes de clasificación"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {movements.length === 0 ? (
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              Aún no cargaste movimientos. Importá un Excel o registrá un ingreso para comenzar.
            </Typography>
            {onRetry ? (
              <Button variant="outlined" onClick={onRetry}>
                Actualizar
              </Button>
            ) : null}
          </Stack>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.slice(0, 6).map((movement) => (
                  <TableRow key={movement.id} hover>
                    <TableCell>
                      {new Date(movement.date).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {movement.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {movement.category || "Sin categoría"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ color: movement.amount < 0 ? "error.main" : "success.main" }}>
                      {formatCurrencyAR(movement.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={movement.pendingCategory ? "warning" : "success"}
                        label={movement.pendingCategory ? "Por categorizar" : "Listo"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
      <CardActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" color="secondary" onClick={onCategorize} disabled={!onCategorize}>
          Categorizar con IA
        </Button>
        <Button variant="outlined" onClick={onNavigate} disabled={!onNavigate}>
          Ver más
        </Button>
      </CardActions>
    </Card>
  );
};

export default RecentMovementsWidget;
