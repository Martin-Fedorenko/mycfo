package consolidacion.mercadopago.services.impl;

import consolidacion.mercadopago.config.MpProperties;
import consolidacion.mercadopago.dtos.OauthStatusDTO;
import consolidacion.mercadopago.models.MpAccountLink;
import consolidacion.mercadopago.repositories.MpAccountLinkRepository;
import consolidacion.mercadopago.services.MpAuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class MpAuthServiceImpl implements MpAuthService {
    private final MpProperties props; private final MpAccountLinkRepository repo; private final HttpSession session;
    public MpAuthServiceImpl(MpProperties props, MpAccountLinkRepository repo, HttpSession session) {
        this.props = props; this.repo = repo; this.session = session;
    }

    @Override
    public String buildAuthorizationUrl(String state, Long userIdApp) {
        // Guardamos el state en sesión para validar CSRF luego
        session.setAttribute("mp_oauth_state", state);
        String q = "client_id="+enc(props.getClientId())
                +"&response_type=code"
                +"&platform_id=mp"
                +"&redirect_uri="+enc(props.getRedirectUri())
                +"&state="+enc(state)
                +"&scope="+enc(props.getScope());
        return props.getOauthAuthorize()+"?"+q;
    }

    @Override
    public OauthStatusDTO getStatus(Long userIdApp) {
        Optional<MpAccountLink> link = repo.findByUserIdApp(userIdApp);
        if (link.isEmpty()) return new OauthStatusDTO(false, null, null, null);
        MpAccountLink l = link.get();
        return new OauthStatusDTO(true, l.getEmail(), l.getMpUserId(), l.getExpiresAt());
    }

    @Override
    public void handleCallback(String code, String state, Long userIdApp) {
        // Validación básica de state
        Object st = session.getAttribute("mp_oauth_state");
        if (st == null || !st.toString().equals(state)) throw new IllegalArgumentException("invalid state");

        // *** Aquí debería llamarse a /oauth/token de MP para intercambiar code por tokens ***
        // Para no bloquearte ahora, guardamos un link "dummy" que deja el front en estado Vinculado.
        MpAccountLink link = repo.findByUserIdApp(userIdApp).orElse(new MpAccountLink());
        link.setUserIdApp(userIdApp);
        link.setMpUserId("mp-user-"+UUID.randomUUID());
        link.setEmail("cuenta@ejemplo.com");
        link.setAccessToken("DUMMY_ACCESS_TOKEN");
        link.setRefreshToken("DUMMY_REFRESH_TOKEN");
        link.setScope(props.getScope());
        link.setExpiresAt(Instant.now().plusSeconds(60*60)); // 1h
        link.setCreatedAt(Instant.now());
        link.setUpdatedAt(Instant.now());
        repo.save(link);
    }

    private String enc(String s){ return URLEncoder.encode(s, StandardCharsets.UTF_8); }
}
