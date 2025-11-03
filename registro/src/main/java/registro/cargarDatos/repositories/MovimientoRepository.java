package registro.cargarDatos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import registro.cargarDatos.models.Movimiento;
import registro.cargarDatos.models.TipoMovimiento;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long>, JpaSpecificationExecutor<Movimiento> {

    // Buscar por organización
    List<Movimiento> findByOrganizacionId(Long organizacionId);

    // Buscar por tipo
    List<Movimiento> findByTipo(TipoMovimiento tipo);

    // Buscar por tipo y organización
    List<Movimiento> findByTipoAndOrganizacionId(TipoMovimiento tipo, Long organizacionId);

    // Buscar por rango de fechas
    List<Movimiento> findByFechaEmisionBetween(LocalDate inicio, LocalDate fin);

    // Buscar por fecha emision
    List<Movimiento> findByFechaEmisionIn(java.util.Set<LocalDate> fechas);

    // Buscar por organización y rango de fechas
    List<Movimiento> findByOrganizacionIdAndFechaEmisionBetween(Long organizacionId, LocalDate inicio, LocalDate fin);

    List<Movimiento> findByOrganizacionIdAndUsuarioIdAndTipoAndFechaEmisionBetween(
            Long organizacionId,
            String usuarioId,
            TipoMovimiento tipo,
            LocalDate inicio,
            LocalDate fin
    );

    @Query("SELECT COALESCE(SUM(m.montoTotal), 0) FROM Movimiento m " +
            "WHERE (:organizacionId IS NULL OR m.organizacionId = :organizacionId) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND m.tipo = :tipo " +
            "AND m.fechaEmision BETWEEN :inicio AND :fin")
    Double sumMontoByOrganizacionOrUsuarioAndTipoAndFechaBetween(
            @Param("organizacionId") Long organizacionId,
            @Param("usuarioId") String usuarioId,
            @Param("tipo") TipoMovimiento tipo,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin
    );

    @Query("SELECT COUNT(m) FROM Movimiento m " +
            "WHERE (:organizacionId IS NULL OR m.organizacionId = :organizacionId) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND m.fechaEmision BETWEEN :inicio AND :fin")
    long countByOrganizacionOrUsuarioAndFechaEmisionBetween(
            @Param("organizacionId") Long organizacionId,
            @Param("usuarioId") String usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin
    );
}
