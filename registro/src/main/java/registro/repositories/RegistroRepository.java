package registro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import registro.models.Registro;

public interface RegistroRepository extends JpaRepository<Registro, Long> {
}
