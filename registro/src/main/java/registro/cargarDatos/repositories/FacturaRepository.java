package registro.cargarDatos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import registro.cargarDatos.models.Factura;

import java.util.List;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {
    
    List<Factura> findByOrganizacionId(Long organizacionId);
    
    List<Factura> findByUsuarioId(String usuarioId);
    
    List<Factura> findByNumeroDocumento(String numeroDocumento);
}
