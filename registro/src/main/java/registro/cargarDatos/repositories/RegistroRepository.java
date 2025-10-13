package registro.cargarDatos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import registro.cargarDatos.models.Registro;

import java.time.LocalDate;
import java.util.List;

public interface RegistroRepository extends JpaRepository<Registro, Long>, JpaSpecificationExecutor<Registro> {
    List<Registro> findByFechaEmisionIn(java.util.Set<LocalDate> fechas);
}
