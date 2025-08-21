package pronostico.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pronostico.models.PresupuestoMesCategoria;

import java.util.List;

public interface PresupuestoMesCategoriaRepository extends JpaRepository<PresupuestoMesCategoria, Long> {
  List<PresupuestoMesCategoria> findByPresupuestoDetalleId(Long detalleId);
}
