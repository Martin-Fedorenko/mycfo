package registro.cargarDatos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import registro.cargarDatos.models.Registro;

public interface RegistroRepository extends JpaRepository<Registro, Long> {
}
