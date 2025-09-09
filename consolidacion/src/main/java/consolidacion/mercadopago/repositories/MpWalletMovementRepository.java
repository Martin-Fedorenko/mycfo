// consolidacion/mercadopago/repositories/MpWalletMovementRepository.java
package consolidacion.mercadopago.repositories;

import consolidacion.mercadopago.models.MpWalletMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface MpWalletMovementRepository
        extends JpaRepository<MpWalletMovement, Long>, JpaSpecificationExecutor<MpWalletMovement> {
    Optional<MpWalletMovement> findByMpMovementId(String mpMovementId);
}

