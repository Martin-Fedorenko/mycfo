package consolidacion.mercadopago.repositories;
import consolidacion.mercadopago.models.*;
import org.springframework.data.jpa.repository.*;

public interface MpPaymentFacturaRepository extends JpaRepository<MpPaymentFactura, Long> {
    boolean existsByMpPayment(MpPayment p);
}
