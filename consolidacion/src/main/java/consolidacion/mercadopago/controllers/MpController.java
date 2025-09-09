package consolidacion.mercadopago.controllers;

import consolidacion.mercadopago.config.MpProperties;
import consolidacion.mercadopago.dtos.*;
import consolidacion.mercadopago.models.MpPayment;
import consolidacion.mercadopago.models.MpWalletMovement;
import consolidacion.mercadopago.repositories.MpPaymentRepository;
import consolidacion.mercadopago.repositories.MpWalletMovementRepository;
import consolidacion.mercadopago.services.MpAuthService;
import consolidacion.mercadopago.services.MpBillingService;
import consolidacion.mercadopago.services.MpPaymentImportService;
import consolidacion.mercadopago.services.util.MpWalletMovementImportService;

import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

/**
 * Controlador de integraciones con Mercado Pago:
 * - OAuth
 * - Importación y listado de Pagos (payments)
 * - Importación y listado de Movimientos de Billetera (wallet/account movements)
 * - Facturación y desvinculación
 */
@RestController
@RequestMapping("/api/mp")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MpController {

    private final MpAuthService auth;
    private final MpPaymentImportService importer;
    private final MpBillingService billing;
    private final MpPaymentRepository paymentRepo;

    // Wallet movements
    private final MpWalletMovementImportService walletImporter;
    private final MpWalletMovementRepository walletRepo;

    @Autowired
    private MpProperties mpProps;

    public MpController(
            MpAuthService auth,
            MpPaymentImportService importer,
            MpBillingService billing,
            MpPaymentRepository paymentRepo,
            MpWalletMovementImportService walletImporter,
            MpWalletMovementRepository walletRepo
    ) {
        this.auth = auth;
        this.importer = importer;
        this.billing = billing;
        this.paymentRepo = paymentRepo;
        this.walletImporter = walletImporter;
        this.walletRepo = walletRepo;
    }

    // En tu proyecto real obtendrás el userId del token/JWT.
    private Long currentUserId() { return 1L; }

    /* ======================
       OAuth
       ====================== */

    @GetMapping("/oauth/url")
    public Map<String, String> getOauthUrl() {
        String url = auth.buildAuthorizationUrl(null, currentUserId());
        System.out.println(">>> URL de autorización generada: " + url);
        return Map.of("url", url);
    }

    @GetMapping("/oauth/callback")
    public ResponseEntity<Void> callback(@RequestParam String code, @RequestParam String state) {
        String base = Optional.ofNullable(mpProps.getFrontendUrl()).orElse("http://localhost:3000");
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        try {
            auth.handleCallback(code, state, currentUserId());
            // HashRouter (React) requiere "#/"
            String target = base + "/#/mercado-pago?linked=1";
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
        } catch (Exception e) {
            e.printStackTrace();
            String reason = java.net.URLEncoder.encode(
                    Optional.ofNullable(e.getMessage()).orElse("callback_error"),
                    java.nio.charset.StandardCharsets.UTF_8
            );
            String err = base + "/#/mercado-pago?mp=error&reason=" + reason;
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(err)).build();
        }
    }

    /* ======================
       Estado
       ====================== */

    @GetMapping("/status")
    public ResponseEntity<OauthStatusDTO> status() {
        Long userId = currentUserId();
        return ResponseEntity.ok(auth.getStatus(userId));
    }

    /* ======================
       Importación de PAGOS
       ====================== */

    @PostMapping("/import")
    public Map<String, Object> importPagos(@RequestBody ImportRequest req) {
        final Long uid = currentUserId();
        int cant;

        if (req.getPaymentId() != null) {
            System.out.println("[/import] by paymentId=" + req.getPaymentId());
            cant = importer.importPaymentById(uid, req.getPaymentId());
        } else if (req.getExternalReference() != null && !req.getExternalReference().isBlank()) {
            System.out.println("[/import] by externalReference=" + req.getExternalReference());
            cant = importer.importByExternalReference(uid, req.getExternalReference().trim());
        } else if (req.getMonth() != null && req.getYear() != null) {
            System.out.println("[/import] by month/year " + req.getMonth() + "/" + req.getYear());
            cant = importer.importByMonth(uid, req.getMonth(), req.getYear());
        } else {
            throw new IllegalArgumentException("Debes indicar paymentId, externalReference o month/year");
        }

        return Map.of("importados", cant);
    }

    /* ======================
       Listado de PAGOS
       ====================== */

    @GetMapping("/payments")
    public Page<PaymentDTO> payments(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10, sort = "fecha", direction = Sort.Direction.DESC) Pageable pg
    ) {
        final Long userId = currentUserId();
        final ZoneId zone = ZoneId.systemDefault();

        Pageable pageable = normalizeSortPayments(pg);

        Specification<MpPayment> spec = (root, query, cb) -> {
            List<Predicate> ands = new ArrayList<>();
            ands.add(cb.equal(root.get("accountLink").get("userIdApp"), userId));

            if (accountId != null) {
                ands.add(cb.equal(root.get("accountLink").get("id"), accountId));
            }
            if (from != null) {
                Instant fromI = from.atStartOfDay(zone).toInstant();
                ands.add(cb.greaterThanOrEqualTo(root.get("dateApproved"), fromI));
            }
            if (to != null) {
                Instant toI = to.plusDays(1).atStartOfDay(zone).toInstant();
                ands.add(cb.lessThan(root.get("dateApproved"), toI));
            }
            if (q != null && !q.isBlank()) {
                String ql = "%" + q.toLowerCase().trim() + "%";
                Predicate or = cb.disjunction();
                or = cb.or(or, cb.like(cb.lower(root.get("description")), ql));
                or = cb.or(or, cb.like(cb.lower(root.get("payerEmail")), ql));
                or = cb.or(or, cb.like(cb.lower(root.get("orderId")), ql));
                try {
                    Long idNum = Long.valueOf(q.trim());
                    or = cb.or(or, cb.equal(root.get("mpPaymentId"), idNum));
                } catch (NumberFormatException ignored) {}
                ands.add(or);
            }
            return cb.and(ands.toArray(new Predicate[0]));
        };

        Page<MpPayment> page = paymentRepo.findAll(spec, pageable);

        return page.map(p -> {
            PaymentDTO dto = new PaymentDTO();
            dto.setMpPaymentId(p.getMpPaymentId());

            Instant when = p.getDateApproved() != null ? p.getDateApproved() : p.getDateCreated();
            if (when != null) dto.setFecha(when.atZone(zone).toLocalDate());

            dto.setTotal(p.getTransactionAmount());
            dto.setDetalle(p.getDescription());
            dto.setComprador(p.getPayerEmail());
            dto.setComprobante(p.getOrderId());
            dto.setEstado(p.getStatus());
            return dto;
        });
    }

    /* ======================
       Importación de MOVIMIENTOS (Billetera)
       ====================== */

    // Importar por rango (inclusive)
    @PostMapping("/wallet/import")
    public Map<String, Object> importWallet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        int n = walletImporter.importRange(currentUserId(), from, to);
        return Map.of("importados", n);
    }

    // Importar por “N° de movimiento” (string alfanumérico tipo B31HQ7A…)
    @PostMapping("/wallet/importById")
    public Map<String, Object> importWalletById(@RequestParam String movementId) {
        int n = walletImporter.importByMovementId(currentUserId(), movementId);
        return Map.of("importados", n);
    }

    // Listar movimientos paginados + filtros
    @GetMapping("/wallet/movements")
    public Page<WalletMovementDTO> listWallet(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "dateEvent", direction = Sort.Direction.DESC) Pageable pg
    ) {
        final Long userId = currentUserId();
        final ZoneId zone = ZoneId.systemDefault();

        Specification<MpWalletMovement> spec = (root, query, cb) -> {
            List<Predicate> ands = new ArrayList<>();
            ands.add(cb.equal(root.get("accountLink").get("userIdApp"), userId));

            if (from != null) {
                ands.add(cb.greaterThanOrEqualTo(root.get("dateEvent"), from.atStartOfDay(zone).toInstant()));
            }
            if (to != null) {
                ands.add(cb.lessThan(root.get("dateEvent"), to.plusDays(1).atStartOfDay(zone).toInstant()));
            }
            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase().trim() + "%";
                ands.add(cb.or(
                        cb.like(cb.lower(root.get("mpMovementId")), like),
                        cb.like(cb.lower(root.get("description")), like),
                        cb.like(cb.lower(root.get("kind")), like),
                        cb.like(cb.lower(root.get("status")), like)
                ));
            }
            return cb.and(ands.toArray(new Predicate[0]));
        };

        Page<MpWalletMovement> page = walletRepo.findAll(spec, pg);

        return page.map(m -> {
            WalletMovementDTO dto = new WalletMovementDTO();
            dto.setMovementId(m.getMpMovementId());
            dto.setFecha(m.getDateEvent() != null ? m.getDateEvent().atZone(zone).toLocalDate() : null);
            dto.setMonto(m.getAmount());
            dto.setMoneda(m.getCurrency());
            dto.setTipo(m.getKind());
            dto.setDescripcion(m.getDescription());
            dto.setEstado(m.getStatus());
            return dto;
        });
    }

    /* ======================
       Facturación
       ====================== */

    @PostMapping("/facturar")
    public FacturarResponse facturar(@RequestBody FacturarRequest req) {
        return billing.facturarPagos(currentUserId(), req.getPaymentIds());
    }

    /* ======================
       Desvincular
       ====================== */

    @PostMapping("/unlink")
    public ResponseEntity<Void> unlink() {
        auth.unlink(currentUserId()); // asegurate de implementarlo en el service
        return ResponseEntity.noContent().build();
    }

    /* ======================
       Helpers
       ====================== */

    private Pageable normalizeSortPayments(Pageable pg) {
        Sort s = pg.getSort();
        if (!s.isSorted()) {
            s = Sort.by(Sort.Order.desc("dateApproved"));
        } else {
            List<Sort.Order> orders = new ArrayList<>();
            for (Sort.Order o : s) {
                String prop = o.getProperty();
                if ("fecha".equalsIgnoreCase(prop)) prop = "dateApproved"; // mapeo DTO -> entidad
                orders.add(new Sort.Order(o.getDirection(), prop));
            }
            s = Sort.by(orders);
        }
        return PageRequest.of(pg.getPageNumber(), pg.getPageSize(), s);
    }
}
