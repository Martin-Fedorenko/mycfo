package consolidacion.mercadopago.services;
public interface MpPaymentImportService {
    int importPaymentById(Long userIdApp, Long paymentId);
    int importByMonth(Long userIdApp, int month, int year);
    int importByExternalReference(Long userIdApp, String externalRef);
}

