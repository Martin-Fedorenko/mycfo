package consolidacion.mercadopago.services.impl;

import consolidacion.mercadopago.config.MpProperties;
import consolidacion.mercadopago.dtos.OauthStatusDTO;
import consolidacion.mercadopago.models.MpAccountLink;
import consolidacion.mercadopago.repositories.MpAccountLinkRepository;
import consolidacion.mercadopago.services.MpAuthService;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class MpAuthServiceImpl implements MpAuthService {
    private final MpProperties props;
    private final MpAccountLinkRepository repo;
    private final RestTemplate rest = new RestTemplate();

    public MpAuthServiceImpl(MpProperties props, MpAccountLinkRepository repo) {
        this.props = props;
        this.repo = repo;
    }

    @Override
    public String buildAuthorizationUrl(String ignored, Long userIdApp) {
        // NO usar HttpSession para state  -> OK
        String signedState = buildSignedState(userIdApp);

        if (props.getClientId() == null || props.getClientId().isBlank()
                || props.getRedirectUri() == null || props.getRedirectUri().isBlank()
                || props.getOauthAuthorize() == null || props.getOauthAuthorize().isBlank()) {
            throw new IllegalStateException(
                    "Mercado Pago no está configurado: verificá clientId, clientSecret, redirectUri y oauthAuthorize."
            );
        }

        String q = "client_id=" + enc(props.getClientId())
                + "&response_type=code"
                + "&redirect_uri=" + enc(props.getRedirectUri())
                + "&state=" + enc(signedState);
        // Si querés sumar scopes específicos, descomentar:
        // q += "&scope=" + enc(props.getScope());

        return props.getOauthAuthorize() + "?" + q;
    }

    @Override
    public OauthStatusDTO getStatus(Long userIdApp) {
        Optional<MpAccountLink> link = repo.findByUserIdApp(userIdApp);
        if (link.isEmpty()) return new OauthStatusDTO(false, null, null, null);

        MpAccountLink l = link.get();

        // Si falta identidad mínima, la enriquecemos con /users/me
        if (isBlank(l.getEmail()) || isBlank(l.getMpUserId())) {
            try {
                enrichAccountIdentity(l);
            } catch (Exception ignored) {
                // si falla identidad, devolvemos lo que tengamos
            }
        }

        return new OauthStatusDTO(true, l.getEmail(), l.getMpUserId(), l.getExpiresAt());
    }

    @Override
    public void handleCallback(String code, String state, Long userIdApp) {
        // 1) Validar state firmado (sin sesión)
        if (!verifySignedState(state, userIdApp, 5 * 60_000L)) {
            throw new IllegalArgumentException("invalid state");
        }

        // 2) Intercambiar code -> tokens reales contra MP
        TokenResponse token = exchangeCodeForToken(code);

        // 3) Persistir (usa tus campos actuales del entity)
        MpAccountLink link = repo.findByUserIdApp(userIdApp).orElse(new MpAccountLink());
        link.setUserIdApp(userIdApp);
        link.setAccessToken(token.getAccessToken());     // si tenés cifrado, aplicar aquí
        link.setRefreshToken(token.getRefreshToken());   // idem
        link.setScope(props.getScope());
        link.setLiveMode(Boolean.TRUE.equals(token.getLiveMode()));

        // expires_at = ahora + expires_in - pequeña guarda
        long sec = token.getExpiresIn() != null ? token.getExpiresIn() : 3600L;
        link.setExpiresAt(Instant.now().plusSeconds(Math.max(0, sec - 60)));

        if (link.getCreatedAt() == null) link.setCreatedAt(Instant.now());
        link.setUpdatedAt(Instant.now());

        // 4) Enriquecer identidad (id/nickname/email/site) con /users/me
        enrichAccountIdentity(link);

        repo.save(link);
    }

    /* =========================
       Métodos privados — helpers
       ========================= */

    private TokenResponse exchangeCodeForToken(String code) {
        if (isBlank(code)) throw new IllegalArgumentException("code vacío");

        String url = ensureSuffix(props.getApiBase(), "") + "/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "grant_type=authorization_code"
                + "&client_id=" + enc(props.getClientId())
                + "&client_secret=" + enc(props.getClientSecret())
                + "&code=" + enc(code)
                + "&redirect_uri=" + enc(props.getRedirectUri()); // ¡debe coincidir EXACTO!

        HttpEntity<String> req = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<TokenResponse> res =
                    rest.exchange(url, HttpMethod.POST, req, TokenResponse.class);

            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
                throw new IllegalStateException("MP /oauth/token respondió " + res.getStatusCode());
            }
            return res.getBody();

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            // Logueamos el cuerpo que devolvió MP (suele decir "redirect_uri mismatch")
            String resp = e.getResponseBodyAsString();
            System.err.println("ERROR intercambiando code->token en MP: " + e.getStatusCode());
            System.err.println("Body: " + resp);
            throw new IllegalStateException("Fallo intercambio code->token: " + e.getStatusCode() + " - " + resp, e);
        }
    }


    private void enrichAccountIdentity(MpAccountLink link) {
        if (isBlank(link.getAccessToken())) return;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(link.getAccessToken());
        HttpEntity<Void> req = new HttpEntity<>(headers);

        String url = ensureSuffix(props.getApiBase(), "") + "/users/me";
        ResponseEntity<Map> res = rest.exchange(url, HttpMethod.GET, req, Map.class);
        if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) return;

        Map<?, ?> body = res.getBody();

        // Campos típicos en /users/me (pueden variar levemente)
        Object id        = body.get("id");
        Object nickname  = body.get("nickname");
        Object email     = body.get("email");
        Object siteId    = body.get("site_id");
        Object liveMode  = body.get("live_mode");

        if (id != null)       link.setMpUserId(String.valueOf(id));     // tu modelo usa String
        if (nickname != null) link.setNickname(String.valueOf(nickname));
        if (email != null)    link.setEmail(String.valueOf(email));
        if (siteId != null)   link.setSiteId(String.valueOf(siteId));
        if (liveMode != null) link.setLiveMode(Boolean.valueOf(String.valueOf(liveMode)));

        link.setUpdatedAt(Instant.now());
    }

    private String enc(String s) {
        if (s == null || s.isBlank()) {
            throw new IllegalStateException("Valor requerido para OAuth es nulo o vacío");
        }
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private boolean isBlank(String s) { return s == null || s.isBlank(); }

    private String ensureSuffix(String base, String suffix) {
        if (base == null) return suffix;
        return base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }

    // ==== STATE firmado HMAC-SHA256 ====

    private String sign(String data, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    private String b64(String s){
        return java.util.Base64.getUrlEncoder().withoutPadding()
                .encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    private String buildSignedState(Long userId) {
        long ts = System.currentTimeMillis();
        String payload = userId + ":" + ts;
        String sig = sign(payload, props.getClientSecret()); // o STATE_SIGNING_SECRET dedicado
        return b64(payload + ":" + sig);
    }

    public void unlink(Long userIdApp) {
        repo.findByUserIdApp(userIdApp).ifPresent(repo::delete);
    }


    private boolean verifySignedState(String stateB64, Long expectedUserId, long maxAgeMs) {
        try {
            String decoded = new String(java.util.Base64.getUrlDecoder().decode(stateB64), StandardCharsets.UTF_8);
            // formato: userId:ts:sig
            String[] parts = decoded.split(":");
            if (parts.length != 3) return false;
            Long userId = Long.parseLong(parts[0]);
            long ts = Long.parseLong(parts[1]);
            String sig = parts[2];

            if (System.currentTimeMillis() - ts > maxAgeMs) return false;
            if (!userId.equals(expectedUserId)) return false;

            String expectedSig = sign(parts[0] + ":" + parts[1], props.getClientSecret());
            return Objects.equals(sig, expectedSig);
        } catch (Exception e) {
            return false;
        }
    }

    /* =========================
       DTO local para token
       ========================= */
    public static class TokenResponse {
        // nombres según respuesta de MP
        private String access_token;
        private String refresh_token;
        private Long   expires_in;
        private Boolean live_mode;

        public String getAccessToken() { return access_token; }
        public String getRefreshToken() { return refresh_token; }
        public Long getExpiresIn() { return expires_in; }
        public Boolean getLiveMode() { return live_mode; }

        public void setAccess_token(String s) { this.access_token = s; }
        public void setRefresh_token(String s) { this.refresh_token = s; }
        public void setExpires_in(Long s) { this.expires_in = s; }
        public void setLive_mode(Boolean b) { this.live_mode = b; }
    }
}

