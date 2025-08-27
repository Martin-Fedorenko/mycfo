package registro.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import registro.models.ItemFactura;

@Repository
public interface ItemFacturaRepository extends JpaRepository<ItemFactura, Long> {

}
