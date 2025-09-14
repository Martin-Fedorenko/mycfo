package pronostico.repositories;

import pronostico.models.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {
    // Podés agregar findByNombre si lo necesitás
}
