package registro.cargarDatos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
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
}

