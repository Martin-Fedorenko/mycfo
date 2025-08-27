package registro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import registro.models.Factura;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {


}
