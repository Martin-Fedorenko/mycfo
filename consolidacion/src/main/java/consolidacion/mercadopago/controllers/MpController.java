package consolidacion.mercadopago.controllers;

import consolidacion.mercadopago.dtos.*;
import consolidacion.mercadopago.services.MpAuthService;
import consolidacion.mercadopago.services.MpBillingService;
import consolidacion.mercadopago.services.MpPaymentImportService;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/mp")
@CrossOrigin(origins = "*")

public class MpController {

    private final MpAuthService auth;
    private final MpPaymentImportService importer;
    private final MpBillingService billing;

    public MpController(MpAuthService auth, MpPaymentImportService importer, MpBillingService billing) {
        this.auth = auth; this.importer = importer; this.billing = billing;
    }

    // En tu proyecto real obtendrás el userId del token; aquí uso 1L para no bloquearte
    private Long currentUserId() { return 1L; }

    @GetMapping("/oauth/url")
    public Map<String,String> getOauthUrl() {
        String state = UUID.randomUUID().toString();
        String url = auth.buildAuthorizationUrl(state, currentUserId());
        return Map.of("url", url);
    }

    @GetMapping("/oauth/callback")
    public org.springframework.http.ResponseEntity<Void> callback(@RequestParam String code, @RequestParam String state) {
        auth.handleCallback(code, state, currentUserId());
        return org.springframework.http.ResponseEntity.status(302)
                .location(URI.create("/mercado-pago?linked=1"))
                .build();
    }

    @GetMapping("/status")
    public OauthStatusDTO status() {
        return auth.getStatus(currentUserId());
    }

    @PostMapping("/import")
    public Map<String,Object> importPagos(@RequestBody ImportRequest req) {
        int cant = (req.getPaymentId()!=null)
                ? importer.importPaymentById(currentUserId(), req.getPaymentId())
                : importer.importByMonth(currentUserId(), req.getMonth(), req.getYear());
        return Map.of("importados", cant);
    }

    @GetMapping("/payments")
    public Page<PaymentDTO> payments(
            @RequestParam(required=false) Long accountId,
            @RequestParam(required=false) @DateTimeFormat(iso= DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required=false) @DateTimeFormat(iso= DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required=false) String q,
            @PageableDefault(size=10, sort="fecha", direction=Sort.Direction.DESC) Pageable pg
    ) {
        // TODO: mapear desde entidad; por ahora devolvemos una página vacía que el front soporta
        return new PageImpl<>(Collections.emptyList(), pg, 0);
    }

    @PostMapping("/facturar")
    public FacturarResponse facturar(@RequestBody FacturarRequest req) {
        return billing.facturarPagos(currentUserId(), req.getPaymentIds());
    }
}

