package registro.cargarDatos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import registro.cargarDatos.models.Movimiento;
import registro.cargarDatos.models.TipoMovimiento;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long>, JpaSpecificationExecutor<Movimiento> {

    // Buscar por organización
    List<Movimiento> findByOrganizacionId(Long organizacionId);

    // Buscar por tipo
    List<Movimiento> findByTipo(TipoMovimiento tipo);

    // Buscar por tipo y organización
    List<Movimiento> findByTipoAndOrganizacionId(TipoMovimiento tipo, Long organizacionId);

    // Buscar por rango de fechas (fechaEmision con fecha y hora)
    List<Movimiento> findByFechaEmisionBetween(LocalDateTime inicio, LocalDateTime fin);

    // Buscar por fecha emision
    List<Movimiento> findByFechaEmisionIn(java.util.Set<LocalDateTime> fechas);

    List<Movimiento> findByOrganizacionIdAndFechaEmisionIn(Long organizacionId, java.util.Set<LocalDateTime> fechas);

    // Buscar por organización y rango de fechas
    List<Movimiento> findByOrganizacionIdAndFechaEmisionBetween(Long organizacionId, LocalDateTime inicio, LocalDateTime fin);

    List<Movimiento> findByOrganizacionIdAndUsuarioIdAndTipoAndFechaEmisionBetween(
            Long organizacionId,
            String usuarioId,
            TipoMovimiento tipo,
            LocalDateTime inicio,
            LocalDateTime fin
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
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    @Query("SELECT COUNT(m) FROM Movimiento m " +
            "WHERE (:organizacionId IS NULL OR m.organizacionId = :organizacionId) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND m.fechaEmision BETWEEN :inicio AND :fin")
    long countByOrganizacionOrUsuarioAndFechaEmisionBetween(
            @Param("organizacionId") Long organizacionId,
            @Param("usuarioId") String usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    @Query("SELECT COUNT(m) FROM Movimiento m " +
            "WHERE (:organizacionId IS NULL OR m.organizacionId = :organizacionId) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND m.fechaEmision BETWEEN :inicio AND :fin " +
            "AND m.documentoComercial IS NOT NULL")
    long countConciliadosByOrganizacionOrUsuarioAndFechaEmisionBetween(
            @Param("organizacionId") Long organizacionId,
            @Param("usuarioId") String usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    @Query("SELECT COUNT(m) FROM Movimiento m " +
            "WHERE (:organizacionId IS NULL OR m.organizacionId = :organizacionId) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND m.fechaEmision BETWEEN :inicio AND :fin " +
            "AND m.documentoComercial IS NULL")
    long countPendientesByOrganizacionOrUsuarioAndFechaEmisionBetween(
            @Param("organizacionId") Long organizacionId,
            @Param("usuarioId") String usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    @Query("SELECT MAX(COALESCE(m.fechaActualizacion, m.fechaEmision)) FROM Movimiento m " +
            "WHERE (:organizacionId IS NULL OR m.organizacionId = :organizacionId) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND m.fechaEmision BETWEEN :inicio AND :fin " +
            "AND m.documentoComercial IS NOT NULL")
    LocalDateTime findUltimaConciliacion(
            @Param("organizacionId") Long organizacionId,
            @Param("usuarioId") String usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    @Query("SELECT MAX(m.fechaEmision) FROM Movimiento m " +
            "WHERE (:organizacionId IS NULL OR m.organizacionId = :organizacionId) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND m.fechaEmision BETWEEN :inicio AND :fin " +
            "AND m.documentoComercial IS NULL")
    LocalDateTime findUltimoMovimientoPendiente(
            @Param("organizacionId") Long organizacionId,
            @Param("usuarioId") String usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    @Query("SELECT m.tipo, COUNT(m), SUM(CASE WHEN m.documentoComercial IS NOT NULL THEN 1 ELSE 0 END) " +
            "FROM Movimiento m " +
            "WHERE (:organizacionId IS NULL OR m.organizacionId = :organizacionId) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND m.fechaEmision BETWEEN :inicio AND :fin " +
            "GROUP BY m.tipo")
    List<Object[]> obtenerResumenConciliacionPorTipo(
            @Param("organizacionId") Long organizacionId,
            @Param("usuarioId") String usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );
}
