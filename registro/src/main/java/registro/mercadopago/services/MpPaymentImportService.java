package registro.mercadopago.services;

import registro.mercadopago.dtos.PaymentDTO;
import java.util.List;

public interface MpPaymentImportService {
    int importPaymentById(Long userIdApp, Long paymentId);
    int importByMonth(Long userIdApp, int month, int year);
    int importByExternalReference(Long userIdApp, String externalRef);
    
    // Métodos de preview (sin guardar)
    List<PaymentDTO> previewPaymentById(Long userIdApp, Long paymentId);
    List<PaymentDTO> previewByMonth(Long userIdApp, int month, int year);
    List<PaymentDTO> previewByExternalReference(Long userIdApp, String externalRef);
    
    // Importar pagos seleccionados
    int importSelectedPayments(Long userIdApp, List<Long> paymentIds);
    
    // Actualizar categoría de un pago
    int updatePaymentCategory(Long userIdApp, Long paymentId, String newCategory);
}

