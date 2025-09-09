package consolidacion.mercadopago.services;
import consolidacion.mercadopago.dtos.OauthStatusDTO;

public interface MpAuthService {
    String buildAuthorizationUrl(String state, Long userIdApp);
    OauthStatusDTO getStatus(Long userIdApp);
    void handleCallback(String code, String state, Long userIdApp);
    void unlink(Long userIdApp);
}
