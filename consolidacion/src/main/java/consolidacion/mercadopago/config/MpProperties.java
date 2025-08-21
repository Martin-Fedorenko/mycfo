package consolidacion.mercadopago.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "mercadopago")
public class MpProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String baseUrl = "https://api.mercadopago.com";
    private String oauthAuthorize = "https://auth.mercadopago.com/authorization";
    private String scope = "read"; // mínimo
    // getters/setters
    public String getClientId(){return clientId;}
    public void setClientId(String v){this.clientId=v;}
    public String getClientSecret(){return clientSecret;}
    public void setClientSecret(String v){this.clientSecret=v;}
    public String getRedirectUri(){return redirectUri;}
    public void setRedirectUri(String v){this.redirectUri=v;}
    public String getBaseUrl(){return baseUrl;}
    public void setBaseUrl(String v){this.baseUrl=v;}
    public String getOauthAuthorize(){return oauthAuthorize;}
    public void setOauthAuthorize(String v){this.oauthAuthorize=v;}
    public String getScope(){return scope;}
    public void setScope(String v){this.scope=v;}
}
