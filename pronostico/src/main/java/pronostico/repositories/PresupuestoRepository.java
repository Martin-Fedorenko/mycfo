package pronostico.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pronostico.models.Presupuesto;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {
}
