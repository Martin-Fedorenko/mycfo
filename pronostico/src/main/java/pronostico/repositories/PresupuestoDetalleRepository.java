package pronostico.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pronostico.models.PresupuestoDetalle;

import java.util.List;
import java.util.Optional;

public interface PresupuestoDetalleRepository extends JpaRepository<PresupuestoDetalle, Long> {
  List<PresupuestoDetalle> findByPresupuestoId(Long presupuestoId);

  Optional<PresupuestoDetalle> findByIdAndPresupuestoId(Long detalleId, Long presupuestoId);

}
