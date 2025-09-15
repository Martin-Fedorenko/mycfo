package consolidacion.mercadopago.services;
import consolidacion.mercadopago.dtos.FacturarResponse;
import java.util.List;

public interface MpBillingService {
    FacturarResponse facturarPagos(Long userIdApp, List<Long> mpPaymentIds);
}
