package pronostico.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pronostico.models.PresupuestoDetalle;

import java.util.List;

public interface PresupuestoDetalleRepository extends JpaRepository<PresupuestoDetalle, Long> {
  List<PresupuestoDetalle> findByPresupuestoId(Long presupuestoId);
}
