package registro.mercadopago.controllers;

import registro.mercadopago.config.MpProperties;
import registro.mercadopago.dtos.*;
import registro.mercadopago.models.MpPayment;
import registro.mercadopago.models.MpWalletMovement;
import registro.mercadopago.repositories.MpPaymentRepository;
import registro.mercadopago.repositories.MpWalletMovementRepository;
import registro.mercadopago.services.MpAuthService;
import registro.mercadopago.services.MpBillingService;
import registro.mercadopago.services.MpPaymentImportService;
import registro.mercadopago.services.util.MpWalletMovementImportService;
import registro.cargarDatos.models.Registro;
import registro.cargarDatos.repositories.RegistroRepository;

import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
    private RegistroRepository registroRepo;

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
       Listado de PAGOS (desde Registro)
       ====================== */
    @GetMapping("/payments")
    public Page<PaymentDTO> payments(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10, sort = "fechaEmision", direction = Sort.Direction.DESC) Pageable pg
    ) {
        final Long userId = currentUserId();

        Specification<Registro> spec = (root, query, cb) -> {
            List<Predicate> ands = new ArrayList<>();
            ands.add(cb.equal(root.get("usuario"), UUID.fromString("00000000-0000-0000-0000-000000000001"))); // adaptar a tu auth real

            if (from != null) {
                ands.add(cb.greaterThanOrEqualTo(root.get("fechaEmision"), from));
            }
            if (to != null) {
                ands.add(cb.lessThan(root.get("fechaEmision"), to.plusDays(1)));
            }
            if (q != null && !q.isBlank()) {
                String ql = "%" + q.toLowerCase().trim() + "%";
                Predicate or = cb.or(
                        cb.like(cb.lower(root.get("descripcion")), ql),
                        cb.like(cb.lower(root.get("origen")), ql),
                        cb.like(cb.lower(root.get("destino")), ql)
                );
                ands.add(or);
            }
            return cb.and(ands.toArray(new Predicate[0]));
        };

        Pageable sorted = normalizeSortRegistros(pg); // <-- mapeo DTO->Entidad
        Page<Registro> page = registroRepo.findAll(spec, sorted);

        return page.map(r -> {
            PaymentDTO dto = new PaymentDTO();
            dto.setFecha(r.getFechaEmision());
            dto.setTotal(BigDecimal.valueOf(r.getMontoTotal()));
            dto.setDetalle(r.getDescripcion());
            dto.setComprador(r.getOrigen());
            dto.setEstado("IMPORTED"); // si querés un status estático
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

    // Mapea sort del DTO (fecha, total, comprador, detalle) a campos de la entidad Registro
    private Pageable normalizeSortRegistros(Pageable pg) {
        if (pg == null) return pg;
        Sort s = pg.getSort();
        if (!s.isSorted()) return pg;

        List<Sort.Order> mapped = new ArrayList<>();
        for (Sort.Order o : s) {
            String prop = o.getProperty();
            switch (prop) {
                case "fecha"     -> prop = "fechaEmision";
                case "total"     -> prop = "montoTotal";
                case "comprador" -> prop = "origen";
                case "detalle"   -> prop = "descripcion";
                // "estado" NO existe en Registro; si viene, podés ignorarlo o redirigirlo:
                case "estado"    -> prop = "fechaEmision";
                default -> {
                    // Si ya viene un nombre válido de entidad (p. ej. "fechaEmision"), lo dejamos tal cual
                }
            }
            mapped.add(new Sort.Order(o.getDirection(), prop));
        }
        return PageRequest.of(pg.getPageNumber(), pg.getPageSize(), Sort.by(mapped));
    }

    // Este helper queda por si en algún endpoint listás MpPayment directamente
    private Pageable normalizeSortPayments(Pageable pg) {
        Sort s = pg.getSort();
        if (!s.isSorted()) {
            s = Sort.by(Sort.Order.desc("dateApproved"));
        } else {
            List<Sort.Order> orders = new ArrayList<>();
            for (Sort.Order o : s) {
                String prop = o.getProperty();
                if ("fecha".equalsIgnoreCase(prop)) prop = "dateApproved"; // mapeo DTO -> entidad MpPayment
                orders.add(new Sort.Order(o.getDirection(), prop));
            }
            s = Sort.by(orders);
        }
        return PageRequest.of(pg.getPageNumber(), pg.getPageSize(), s);
    }
}
