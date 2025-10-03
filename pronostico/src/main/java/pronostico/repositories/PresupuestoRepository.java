package pronostico.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pronostico.models.Presupuesto;

import java.util.List;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {

    @Query("SELECT p FROM Presupuesto p WHERE p.desde <= :to AND p.hasta >= :from")
    List<Presupuesto> findOverlapping(@Param("from") String from, @Param("to") String to);
}
