package registro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import registro.models.Pagare;

@Repository
public interface PagareRepository extends JpaRepository<Pagare, Long> {

}
