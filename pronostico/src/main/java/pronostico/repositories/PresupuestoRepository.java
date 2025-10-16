package pronostico.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pronostico.models.Presupuesto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {

    List<Presupuesto> findByOwnerSub(String ownerSub);

    Page<Presupuesto> findByOwnerSub(String ownerSub, Pageable pageable);

    List<Presupuesto> findByOwnerSubAndDeletedFalse(String ownerSub);

    Page<Presupuesto> findByOwnerSubAndDeletedFalse(String ownerSub, Pageable pageable);

    List<Presupuesto> findByOwnerSubAndDeletedTrue(String ownerSub);

    Page<Presupuesto> findByOwnerSubAndDeletedTrue(String ownerSub, Pageable pageable);

    boolean existsByIdAndOwnerSub(Long id, String ownerSub);

    Optional<Presupuesto> findByIdAndOwnerSub(Long id, String ownerSub);

    Optional<Presupuesto> findByIdAndOwnerSubAndDeletedFalse(Long id, String ownerSub);

    @Query("SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from AND p.deleted = false")
    List<Presupuesto> findActiveOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to
    );

    @Query(
        value = "SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from AND p.deleted = false",
        countQuery = "SELECT COUNT(p) FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from AND p.deleted = false"
    )
    Page<Presupuesto> findActiveOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to,
        Pageable pageable
    );

    @Query("SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from AND p.deleted = true")
    List<Presupuesto> findDeletedOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to
    );

    @Query(
        value = "SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from AND p.deleted = true",
        countQuery = "SELECT COUNT(p) FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from AND p.deleted = true"
    )
    Page<Presupuesto> findDeletedOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to,
        Pageable pageable
    );

    @Query("SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from")
    List<Presupuesto> findAnyOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to
    );

    @Query(
        value = "SELECT p FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from",
        countQuery = "SELECT COUNT(p) FROM Presupuesto p WHERE p.ownerSub = :ownerSub AND p.desde <= :to AND p.hasta >= :from"
    )
    Page<Presupuesto> findAnyOverlapping(
        @Param("ownerSub") String ownerSub,
        @Param("from") String from,
        @Param("to") String to,
        Pageable pageable
    );

    @Query("SELECT p.id FROM Presupuesto p WHERE p.deleted = true AND p.deletedAt < :cutoff")
    List<Long> findIdsDeletedBefore(@Param("cutoff") LocalDateTime cutoff);

    @Modifying(clearAutomatically = true)
    @Query("""
        update Presupuesto p
           set p.deleted = true,
               p.deletedAt = :deletedAt,
               p.deletedBy = :deletedBy
         where p.id = :id and p.ownerSub = :ownerSub and p.deleted = false
        """)
    int markDeletedIfActive(@Param("id") Long id,
                            @Param("ownerSub") String ownerSub,
                            @Param("deletedAt") LocalDateTime deletedAt,
                            @Param("deletedBy") String deletedBy);
}
