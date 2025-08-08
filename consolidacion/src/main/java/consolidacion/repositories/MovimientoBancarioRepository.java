package consolidacion.repositories;

import consolidacion.models.MovimientoBancario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoBancarioRepository extends JpaRepository<MovimientoBancario, Long> {
}
