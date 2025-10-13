package pronostico.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pronostico.models.PresupuestoLinea;

import java.util.List;

public interface PresupuestoLineaRepository extends JpaRepository<PresupuestoLinea, Long> {
  List<PresupuestoLinea> findByPresupuesto_Id(Long presupuestoId);
  List<PresupuestoLinea> findByPresupuesto_IdAndMes(Long presupuestoId, String mes);
}
