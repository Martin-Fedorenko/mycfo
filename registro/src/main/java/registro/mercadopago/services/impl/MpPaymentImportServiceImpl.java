package registro.mercadopago.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import registro.cargarDatos.models.*;
import registro.cargarDatos.repositories.RegistroRepository;
import registro.mercadopago.config.MpProperties;
import registro.mercadopago.models.MpAccountLink;
import registro.mercadopago.repositories.MpAccountLinkRepository;
import registro.mercadopago.services.MpPaymentImportService;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class MpPaymentImportServiceImpl implements MpPaymentImportService {

    private final RegistroRepository registroRepo;
    private final MpAccountLinkRepository linkRepo;
    private final MpProperties props;

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper om = new ObjectMapper();

    public MpPaymentImportServiceImpl(
            RegistroRepository registroRepo,
            MpAccountLinkRepository linkRepo,
            MpProperties props
    ) {
        this.registroRepo = registroRepo;
        this.linkRepo = linkRepo;
        this.props = props;
    }

    /* =========================
       Métodos públicos
       ========================= */

    @Override
    public int importPaymentById(Long userIdApp, Long paymentId) {
        MpAccountLink link = requireLink(userIdApp);
        Map<String, Object> body = get("/v1/payments/" + paymentId, link.getAccessToken());
        if (body == null || body.isEmpty()) return 0;
        upsertRegistro(body, link);
        return 1;
    }

    @Override
    public int importByMonth(Long userIdApp, int month, int year) {
        MpAccountLink link = requireLink(userIdApp);

        ZoneId zone = ZoneId.systemDefault();
        LocalDate first = LocalDate.of(year, month, 1);
        LocalDate last = first.withDayOfMonth(first.lengthOfMonth());

        Instant from = first.atStartOfDay(zone).toInstant();
        Instant to = last.plusDays(1).atStartOfDay(zone).toInstant(); // exclusivo

        int imported = 0;
        int offset = 0;
        final int limit = 50;
        final int maxPages = 20; // tope de 1000 items

        for (int page = 0; page < maxPages; page++, offset += limit) {
            List<Map<String, Object>> results = searchPaymentsPageNoDates(link.getAccessToken(), offset, limit);
            if (results.isEmpty()) break;

            boolean reachedOlder = false;
            for (Map<String, Object> p : results) {
                Instant approved = parseInstant(p.get("date_approved"));
                if (approved == null) approved = parseInstant(p.get("date_created"));

                if (approved == null || approved.isBefore(from)) {
                    reachedOlder = true;
                    continue;
                }
                if (approved.isBefore(to)) {
                    upsertRegistro(p, link);
                    imported++;
                }
            }
            if (reachedOlder) break;
        }
        return imported;
    }

    @Override
    public int importByExternalReference(Long userIdApp, String externalRef) {
        MpAccountLink link = requireLink(userIdApp);
        int imported = 0;

        // A) Intento directo por payments/search
        String url = props.getApiBase()
                + "/v1/payments/search?external_reference=" + enc(externalRef)
                + "&sort=date_approved&criteria=desc&limit=50";
        try {
            HttpEntity<Void> req = new HttpEntity<>(authHeaders(link.getAccessToken()));
            ResponseEntity<Map> res = rest.exchange(url, HttpMethod.GET, req, Map.class);
            Object rs = (res.getBody() != null) ? res.getBody().get("results") : null;
            if (rs instanceof List<?> list) {
                for (Object o : list) {
                    if (o instanceof Map<?, ?> m) {
                        upsertRegistro((Map<String, Object>) m, link);
                        imported++;
                    }
                }
            }
            if (imported > 0) return imported;
        } catch (HttpStatusCodeException e) {
            System.err.println("payments/search by external_reference -> " + e.getStatusCode());
            System.err.println("URL: " + url);
            System.err.println("Body: " + e.getResponseBodyAsString());
        }

        // B) merchant_orders/search
        imported += importViaMerchantOrders(link, externalRef);

        // C) búsqueda laxa
        imported += importByLooseQuery(link, externalRef);

        return imported;
    }

    /* =========================
       Métodos privados
       ========================= */

    @SuppressWarnings("unchecked")
    private int importViaMerchantOrders(MpAccountLink link, String externalRef) {
        String url = props.getApiBase()
                + "/merchant_orders/search?external_reference=" + enc(externalRef)
                + "&limit=10";
        int imported = 0;

        try {
            HttpEntity<Void> req = new HttpEntity<>(authHeaders(link.getAccessToken()));
            ResponseEntity<Map> res = rest.exchange(url, HttpMethod.GET, req, Map.class);
            Object rs = (res.getBody() != null) ? res.getBody().get("elements") : null;
            if (rs instanceof List<?> list) {
                for (Object ord : list) {
                    if (ord instanceof Map<?, ?> mo) {
                        Object pays = mo.get("payments");
                        if (pays instanceof List<?> pl) {
                            for (Object p : pl) {
                                if (p instanceof Map<?, ?> pm) {
                                    Long pid = asLong(((Map<String, Object>) pm).get("id"));
                                    if (pid != null) {
                                        Map<String, Object> full = get("/v1/payments/" + pid, link.getAccessToken());
                                        if (full != null && !full.isEmpty()) {
                                            upsertRegistro(full, link);
                                            imported++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (HttpStatusCodeException e) {
            System.err.println("merchant_orders/search -> " + e.getStatusCode());
            System.err.println("URL: " + url);
            System.err.println("Body: " + e.getResponseBodyAsString());
        }
        return imported;
    }

    @SuppressWarnings("unchecked")
    private int importByLooseQuery(MpAccountLink link, String query) {
        String url = props.getApiBase()
                + "/v1/payments/search?q=" + enc(query) + "&limit=50";
        int imported = 0;
        try {
            HttpEntity<Void> req = new HttpEntity<>(authHeaders(link.getAccessToken()));
            ResponseEntity<Map> res = rest.exchange(url, HttpMethod.GET, req, Map.class);
            Object rs = (res.getBody() != null) ? res.getBody().get("results") : null;
            if (rs instanceof List<?> list) {
                for (Object o : list) {
                    if (o instanceof Map<?, ?> m) {
                        upsertRegistro((Map<String, Object>) m, link);
                        imported++;
                    }
                }
            }
        } catch (HttpStatusCodeException e) {
            System.err.println("payments/search?q= -> " + e.getStatusCode());
            System.err.println("URL: " + url);
            System.err.println("Body: " + e.getResponseBodyAsString());
        }
        return imported;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> searchPaymentsPageNoDates(String accessToken, int offset, int limit) {
        HttpEntity<Void> req = new HttpEntity<>(authHeaders(accessToken));
        String url = props.getApiBase() + "/v1/payments/search"
                + "?sort=date_approved&criteria=desc"
                + "&offset=" + offset + "&limit=" + limit;
        try {
            ResponseEntity<Map> res = rest.exchange(url, HttpMethod.GET, req, Map.class);
            Object rs = (res.getBody() != null) ? res.getBody().get("results") : null;
            return (rs instanceof List) ? (List<Map<String, Object>>) rs : List.of();
        } catch (HttpStatusCodeException e) {
            System.err.println("payments/search (no dates) -> " + e.getStatusCode());
            System.err.println("URL: " + url);
            System.err.println("Body: " + e.getResponseBodyAsString());
            return List.of();
        }
    }

    private MpAccountLink requireLink(Long userIdApp) {
        return linkRepo.findByUserIdApp(userIdApp)
                .orElseThrow(() -> new IllegalStateException("No hay cuenta vinculada de Mercado Pago para el usuario"));
    }

    private HttpHeaders authHeaders(String accessToken) {
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(accessToken);
        h.setAccept(List.of(MediaType.APPLICATION_JSON));
        return h;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> get(String path, String accessToken) {
        String url = props.getApiBase() + path;
        HttpEntity<Void> req = new HttpEntity<>(authHeaders(accessToken));
        try {
            ResponseEntity<Map> res = rest.exchange(url, HttpMethod.GET, req, Map.class);
            return (Map<String, Object>) res.getBody();
        } catch (HttpStatusCodeException e) {
            System.err.println("GET " + url + " -> " + e.getStatusCode());
            System.err.println("Body: " + e.getResponseBodyAsString());
            throw e;
        }
    }

    private void upsertRegistro(Map<String, Object> body, MpAccountLink link) {
        // === 1) Parseos base ===
        // id de MP (no lo usamos ahora, pero sirve por si logueás)
        String mpId = asString(body.get("id"));

        // fechas: fechaEmision = date_created (LocalDate)
        Instant dateCreated = parseInstant(body.get("date_created"));   // p.ej. "2025-07-05T14:12:33.000-03:00"
        LocalDate fechaEmision = (dateCreated != null)
                ? dateCreated.atZone(ZoneId.systemDefault()).toLocalDate()
                : LocalDate.now();

        // historial
        // fechaCreacion = date_created ; fechaActualizacion = imported_at (si viene), si no = hoy
        Instant importedAt = parseInstant(body.get("imported_at")); // puede no estar en el payload
        LocalDate fechaCreacion = (dateCreated != null)
                ? dateCreated.atZone(ZoneId.systemDefault()).toLocalDate()
                : LocalDate.now();
        LocalDate fechaActualizacion = (importedAt != null)
                ? importedAt.atZone(ZoneId.systemDefault()).toLocalDate()
                : LocalDate.now();

        // monto/moneda
        BigDecimal transactionAmount = asBigDecimal(body.get("transaction_amount"));
        String currencyId = asString(body.get("currency_id"));

        // otros campos MP
        String description = asString(body.get("description"));
        String payerEmail = getPayerEmail(body); // como ya lo tenías
        String paymentMethodId = asString(body.get("payment_method_id")); // OJO con el nombre real en el JSON
        String status = asString(body.get("status")); // approved, refunded, cancelled, etc.

        // === 2) Armar Registro según tu mapeo ===
        Registro r = new Registro();

        // id: autogenerado por JPA

        // tipo (tu entidad): no existe 1:1 en MP; regla simple:
        // - refunded / cancelled / charged_back -> EGRESO
        // - el resto -> INGRESO
        if (status != null && (
                status.equalsIgnoreCase("refunded") ||
                        status.equalsIgnoreCase("cancelled") ||
                        status.equalsIgnoreCase("charged_back") ||
                        status.equalsIgnoreCase("chargeback")
        )) {
            r.setTipo(TipoRegistro.Egreso);
        } else {
            r.setTipo(TipoRegistro.Ingreso);
        }

        // montoTotal = transactionAmount
        r.setMontoTotal(transactionAmount != null ? transactionAmount.doubleValue() : 0d);

        // fechaEmision = date_created
        r.setFechaEmision(fechaEmision);

        // categoria = NULL (por ahora)
        r.setCategoria(null);

        // origen = payer_email
        r.setOrigen(payerEmail);

        // destino = NULL (por ahora)
        r.setDestino(null);

        // descripcion = description
        r.setDescripcion(description);

        // historial
        r.setFechaCreacion(fechaCreacion);
        r.setFechaActualizacion(fechaActualizacion);

        // usuario = NULL (por ahora, según pediste)
        r.setUsuario(null);

        // medioPago = payment_method_id  (es ENUM: puede fallar si el literal no existe)
        // Si tu enum es, por ejemplo, { EFECTIVO, TRANSFERENCIA, MERCADO_PAGO, ... }
        // y el payment_method_id de MP viene como "account_money", "credit_card", etc.,
        // podés:
        //   a) Dejarlo null (como pediste)
        //   b) O mapear algunos casos conocidos:
        r.setMedioPago(null); // opción (a)
        // // opción (b) ejemplo:
        // try {
        //     r.setMedioPago(TipoMedioPago.valueOf(paymentMethodId.trim().toUpperCase()));
        // } catch (Exception ignore) {
        //     r.setMedioPago(null);
        // }

        // moneda = currency_id (ENUM)
        // Si tu enum tiene ARS/USD/EUR, esto suele funcionar:
        if (currencyId != null) {
            try {
                r.setMoneda(TipoMoneda.valueOf(currencyId.trim().toUpperCase()));
            } catch (Exception ignore) {
                r.setMoneda(null); // según pediste, dejamos null si no matchea
            }
        } else {
            r.setMoneda(null);
        }

        // documentoComercial = NULL (a futuro)
        r.setDocumentoComercial(null);

        // === 3) Guardar ===
        registroRepo.save(r);
    }



    private String getPayerEmail(Map<String, Object> body) {
        Map<String, Object> payer = asMap(body.get("payer"));
        return payer != null ? asString(payer.get("email")) : null;
    }

    /* =========================
       Utils
       ========================= */

    private BigDecimal asBigDecimal(Object o) {
        if (o == null) return null;
        try {
            return (o instanceof BigDecimal b) ? b : new BigDecimal(String.valueOf(o));
        } catch (Exception e) {
            return null;
        }
    }

    private String asString(Object o) {
        return (o == null) ? null : String.valueOf(o);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : null;
    }

    private Instant parseInstant(Object o) {
        if (o == null) return null;
        try {
            return OffsetDateTime.parse(String.valueOf(o)).toInstant();
        } catch (Exception e) {
            try {
                return Instant.parse(String.valueOf(o));
            } catch (Exception ignored) {
                return null;
            }
        }
    }

    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(String.valueOf(o));
        } catch (Exception e) {
            return null;
        }
    }

    private String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
