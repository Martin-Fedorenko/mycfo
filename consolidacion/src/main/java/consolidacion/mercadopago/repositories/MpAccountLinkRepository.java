package consolidacion.mercadopago.repositories;
import consolidacion.mercadopago.models.*;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;

public interface MpAccountLinkRepository extends JpaRepository<MpAccountLink, Long> {
    Optional<MpAccountLink> findByUserIdApp(Long userIdApp);
}

