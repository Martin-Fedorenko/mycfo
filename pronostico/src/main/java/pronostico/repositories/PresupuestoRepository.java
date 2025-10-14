package pronostico.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pronostico.models.Presupuesto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {

    List<Presupuesto> findByOwnerSub(String ownerSub);

    List<Presupuesto> findByOwnerSubAndDeletedFalse(String ownerSub);

    List<Presupuesto> findByOwnerSubAndDeletedTrue(String ownerSub);

    boolean existsByIdAndOwnerSub(Long id, String ownerSub);

    Optional<Presupuesto> findByIdAndOwnerSub(Long id, String ownerSub);

    Optional<Presupuesto> findByIdAndOwnerSubAndDeletedFalse(Long id, String ownerSub);

    @Query("SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from AND p.deleted = false")
    List<Presupuesto> findActiveOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to
    );

    @Query("SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from AND p.deleted = true")
    List<Presupuesto> findDeletedOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to
    );

    @Query("SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from")
    List<Presupuesto> findAnyOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to
    );

    @Query("SELECT p.id FROM Presupuesto p WHERE p.deleted = true AND p.deletedAt < :cutoff")
    List<Long> findIdsDeletedBefore(@Param("cutoff") LocalDateTime cutoff);
}
