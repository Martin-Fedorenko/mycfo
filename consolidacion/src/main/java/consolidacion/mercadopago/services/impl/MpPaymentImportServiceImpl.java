package consolidacion.mercadopago.services.impl;

import consolidacion.mercadopago.repositories.MpPaymentRepository;
import consolidacion.mercadopago.services.MpPaymentImportService;
import org.springframework.stereotype.Service;

@Service
public class MpPaymentImportServiceImpl implements MpPaymentImportService {
    private final MpPaymentRepository repo;
    public MpPaymentImportServiceImpl(MpPaymentRepository repo){ this.repo = repo; }

    @Override public int importPaymentById(Long userIdApp, Long paymentId) {
        // TODO: llamar a /v1/payments/{id}, mapear y persistir (idempotente)
        return 0;
    }
    @Override public int importByMonth(Long userIdApp, int month, int year) {
        // TODO: llamar a /v1/payments/search paginando por date_approved
        return 0;
    }
}
