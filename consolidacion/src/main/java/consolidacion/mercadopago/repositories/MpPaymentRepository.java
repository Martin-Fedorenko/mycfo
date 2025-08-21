package consolidacion.mercadopago.repositories;
import consolidacion.mercadopago.models.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface MpPaymentRepository extends JpaRepository<MpPayment, Long>, JpaSpecificationExecutor<MpPayment> {
    Optional<MpPayment> findByMpPaymentId(Long mpPaymentId);
}
