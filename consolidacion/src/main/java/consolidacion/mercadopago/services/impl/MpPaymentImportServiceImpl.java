package consolidacion.mercadopago.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import consolidacion.mercadopago.config.MpProperties;
import consolidacion.mercadopago.models.MpAccountLink;
import consolidacion.mercadopago.models.MpPayment;
import consolidacion.mercadopago.repositories.MpAccountLinkRepository;
import consolidacion.mercadopago.repositories.MpPaymentRepository;
import consolidacion.mercadopago.services.MpPaymentImportService;
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

    private final MpPaymentRepository repo;
    private final MpAccountLinkRepository linkRepo;
    private final MpProperties props;

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper om = new ObjectMapper();

    public MpPaymentImportServiceImpl(
            MpPaymentRepository repo,
            MpAccountLinkRepository linkRepo,
            MpProperties props
    ) {
        this.repo = repo;
        this.linkRepo = linkRepo;
        this.props = props;
    }

    @Override
    public int importPaymentById(Long userIdApp, Long paymentId) {
        MpAccountLink link = requireLink(userIdApp);
        Map<String, Object> body = get("/v1/payments/" + paymentId, link.getAccessToken());
        if (body == null || body.isEmpty()) return 0;
        upsertPayment(body, link);
        return 1;
    }

    @Override
    public int importByMonth(Long userIdApp, int month, int year) {
        MpAccountLink link = requireLink(userIdApp);

        ZoneId zone = ZoneId.systemDefault();
        LocalDate first = LocalDate.of(year, month, 1);
        LocalDate last  = first.withDayOfMonth(first.lengthOfMonth());

        Instant from = first.atStartOfDay(zone).toInstant();
        Instant to   = last.plusDays(1).atStartOfDay(zone).toInstant(); // exclusivo

        int imported = 0;
        int offset = 0;
        final int limit = 50;
        final int maxPages = 20; // tope de 1000 items para no barrer infinito

        for (int page = 0; page < maxPages; page++, offset += limit) {
            List<Map<String,Object>> results = searchPaymentsPageNoDates(link.getAccessToken(), offset, limit);
            if (results.isEmpty()) break;

            boolean reachedOlder = false;
            for (Map<String,Object> p : results) {
                Instant approved = parseInstant(p.get("date_approved"));
                if (approved == null) approved = parseInstant(p.get("date_created"));

                if (approved == null || approved.isBefore(from)) {
                    // ya pasamos el rango: marcamos y cortamos fuera
                    reachedOlder = true;
                    continue;
                }
                if (approved.isBefore(to)) {
                    upsertPayment(p, link);
                    imported++;
                }
            }
            if (reachedOlder) break; // no seguimos paginando
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
                    if (o instanceof Map<?,?> m) {
                        upsertPayment((Map<String,Object>) m, link);
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

        // B) Fallback: merchant_orders/search por external_reference → obtener payment IDs → /v1/payments/{id}
        imported += importViaMerchantOrders(link, externalRef);

        // C) Fallback adicional (algunas integraciones guardan ese código en 'order.id' o en 'description'):
        imported += importByLooseQuery(link, externalRef);

        return imported;
    }

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
                    if (ord instanceof Map<?,?> mo) {
                        Object pays = mo.get("payments");
                        if (pays instanceof List<?> pl) {
                            for (Object p : pl) {
                                if (p instanceof Map<?,?> pm) {
                                    Long pid = asLong(((Map<String,Object>) pm).get("id"));
                                    if (pid != null) {
                                        Map<String,Object> full = get("/v1/payments/" + pid, link.getAccessToken());
                                        if (full != null && !full.isEmpty()) {
                                            upsertPayment(full, link);
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

    /** C) Búsqueda laxa por 'q' (algunas cuentas lo indexan en description/external_reference) */
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
                    if (o instanceof Map<?,?> m) {
                        upsertPayment((Map<String,Object>) m, link);
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



    /* =========================
       Helpers
       ========================= */

    @SuppressWarnings("unchecked")
    private List<Map<String,Object>> searchPaymentsPageNoDates(String accessToken, int offset, int limit) {
        HttpEntity<Void> req = new HttpEntity<>(authHeaders(accessToken));
        String url = props.getApiBase() + "/v1/payments/search"
                + "?sort=date_approved&criteria=desc"
                + "&offset=" + offset + "&limit=" + limit;
        try {
            ResponseEntity<Map> res = rest.exchange(url, HttpMethod.GET, req, Map.class);
            Object rs = (res.getBody() != null) ? res.getBody().get("results") : null;
            return (rs instanceof List) ? (List<Map<String,Object>>) rs : List.of();
        } catch (HttpStatusCodeException e) {
            System.err.println("payments/search (no dates) -> " + e.getStatusCode());
            System.err.println("URL: " + url);
            System.err.println("Body: " + e.getResponseBodyAsString());
            return List.of(); // devolvemos vacío para no romper
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


    /**
     * Busca una página de pagos usando /v1/payments/search.
     * Prueba dos variantes de query (algunos entornos aceptan distinto formato de rango).
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> searchPaymentsPage(
            String accessToken, Instant fromInclusive, Instant toExclusive, int offset, int limit, DateTimeFormatter ignored
    ) {
        // Cerramos al último ms del día anterior (inclusive)
        Instant toInclusive = toExclusive.minusMillis(1);

        // Distintas combinaciones de formatos y zonas:
        record Fmt(String name, DateTimeFormatter fmt, ZoneId zone, boolean useSpace) {}

        List<Fmt> formats = List.of(
                // Con milisegundos
                new Fmt("UTC +00:00 ms", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(ZoneOffset.UTC), ZoneOffset.UTC, false),
                new Fmt("UTC Z(ms sin :)", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ").withZone(ZoneOffset.UTC), ZoneOffset.UTC, false),
                new Fmt("Local ms",      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(ZoneId.systemDefault()), ZoneId.systemDefault(), false),
                new Fmt("Local Z(ms sin :)", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ").withZone(ZoneId.systemDefault()), ZoneId.systemDefault(), false),

                // Sin milisegundos
                new Fmt("UTC +00:00", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX").withZone(ZoneOffset.UTC), ZoneOffset.UTC, false),
                new Fmt("UTC Z(sin :)", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ").withZone(ZoneOffset.UTC), ZoneOffset.UTC, false),
                new Fmt("Local",      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX").withZone(ZoneId.systemDefault()), ZoneId.systemDefault(), false),
                new Fmt("Local Z(sin :)", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ").withZone(ZoneId.systemDefault()), ZoneId.systemDefault(), false),

                // Con espacio en vez de 'T' (algunas integraciones legacy)
                new Fmt("UTC +00:00 (espacio)", DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssXXX").withZone(ZoneOffset.UTC), ZoneOffset.UTC, true),
                new Fmt("UTC Z (espacio)",      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ").withZone(ZoneOffset.UTC), ZoneOffset.UTC, true),
                new Fmt("Local (espacio)",      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssXXX").withZone(ZoneId.systemDefault()), ZoneId.systemDefault(), true),
                new Fmt("Local Z (espacio)",    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ").withZone(ZoneId.systemDefault()), ZoneId.systemDefault(), true)
        );

        // Header con Bearer
        HttpHeaders hdrs = authHeaders(accessToken);
        HttpEntity<Void> req = new HttpEntity<>(hdrs);

        // Base común
        String base = props.getApiBase() + "/v1/payments/search"
                + "?sort=date_approved"
                + "&criteria=desc"
                + "&range=date_approved";
        // Si tu cuenta lo requiere, podés sumar:
        // + "&status=approved"

        List<String> tried = new ArrayList<>();

        for (Fmt f : formats) {
            String begin = f.fmt.format(fromInclusive.atZone(f.zone));
            String end   = f.fmt.format(toInclusive.atZone(f.zone));

            // Si el formato usa ' ' en vez de 'T', no hay que tocar nada: el encoder se ocupa (%20)
            String url = base
                    + "&begin_date=" + enc(begin)
                    + "&end_date="   + enc(end)
                    + "&offset=" + offset
                    + "&limit="  + limit;

            try {
                ResponseEntity<Map> res = rest.exchange(url, HttpMethod.GET, req, Map.class);
                Map<String, Object> body = res.getBody();
                Object rs = body != null ? body.get("results") : null;
                if (rs instanceof List) return (List<Map<String, Object>>) rs;
                return List.of();
            } catch (org.springframework.web.client.HttpStatusCodeException e) {
                // Guardamos intento y seguimos:
                tried.add(f.name + " -> " + e.getStatusCode()
                        + " (URL: " + url + ") body=" + e.getResponseBodyAsString());
                if (e.getStatusCode().value() != 400) {
                    // Si no es 400, probablemente sea 401/403; re-lanzamos
                    throw e;
                }
            }
        }

        // Último fallback: algunas cuentas piden access_token como query param.
        String beginQ = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ")
                .withZone(ZoneOffset.UTC).format(fromInclusive.atZone(ZoneOffset.UTC));
        String endQ   = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ")
                .withZone(ZoneOffset.UTC).format(toInclusive.atZone(ZoneOffset.UTC));

        String urlQp = base
                + "&begin_date=" + enc(beginQ)
                + "&end_date="   + enc(endQ)
                + "&offset=" + offset
                + "&limit="  + limit
                + "&access_token=" + enc(accessToken);

        try {
            ResponseEntity<Map> res = rest.exchange(urlQp, HttpMethod.GET, new HttpEntity<>(new HttpHeaders()), Map.class);
            Map<String, Object> body = res.getBody();
            Object rs = body != null ? body.get("results") : null;
            if (rs instanceof List) return (List<Map<String, Object>>) rs;
            return List.of();
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            tried.add("QueryParam token -> " + e.getStatusCode()
                    + " (URL: " + urlQp + ") body=" + e.getResponseBodyAsString());
            System.err.println("payments/search -> todos los formatos devolvieron 400/err. Intentos:");
            tried.forEach(System.err::println);
            return List.of();
        }
    }


    private void upsertPayment(Map<String, Object> body, MpAccountLink link) {
        Long mpId = asLong(body.get("id"));
        if (mpId == null) return;

        MpPayment p = repo.findByMpPaymentId(mpId).orElseGet(MpPayment::new);
        boolean isNew = (p.getId() == null);

        p.setMpPaymentId(mpId);
        p.setAccountLink(link);

        p.setStatus(asString(body.get("status")));
        p.setStatusDetail(asString(body.get("status_detail")));

        // fechas
        Instant created  = parseInstant(body.get("date_created"));
        Instant approved = parseInstant(body.get("date_approved"));
        p.setDateCreated(created);
        p.setDateApproved(approved);

        // montos / moneda
        BigDecimal amount = asBigDecimal(body.get("transaction_amount"));
        p.setTransactionAmount(amount);
        p.setCurrencyId(asString(body.get("currency_id")));

        // descripción / método
        p.setDescription(asString(body.get("description")));
        p.setPaymentMethodId(asString(body.get("payment_method_id")));

        // payer email
        Map<String, Object> payer = asMap(body.get("payer"));
        if (payer != null) p.setPayerEmail(asString(payer.get("email")));

        // order / external_reference
        Map<String, Object> order = asMap(body.get("order"));
        if (order != null && order.get("id") != null) {
            p.setOrderId(String.valueOf(order.get("id")));
        } else if (body.get("external_reference") != null) {
            p.setOrderId(String.valueOf(body.get("external_reference")));
        }

        // JSON crudo
        try { p.setRawJson(om.writeValueAsString(body)); } catch (Exception ignored) {}

        Instant now = Instant.now();
        if (isNew) p.setImportedAt(now);
        p.setUpdatedAt(now);

        repo.save(p);
    }

    /* -------- util de parsing -------- */

    private String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(String.valueOf(o)); } catch (Exception e) { return null; }
    }

    private BigDecimal asBigDecimal(Object o) {
        if (o == null) return null;
        try { return (o instanceof BigDecimal b) ? b : new BigDecimal(String.valueOf(o)); }
        catch (Exception e) { return null; }
    }

    private String asString(Object o) {
        return (o == null) ? null : String.valueOf(o);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        if (o instanceof Map) return (Map<String, Object>) o;
        return null;
    }

    private Instant parseInstant(Object o) {
        if (o == null) return null;
        try {
            // MP suele devolver con offset (ej. 2025-09-08T22:11:00.000-03:00)
            return OffsetDateTime.parse(String.valueOf(o)).toInstant();
        } catch (Exception ignored) {
            try { return Instant.parse(String.valueOf(o)); }
            catch (Exception e) { return null; }
        }
    }
}
