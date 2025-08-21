package consolidacion.mercadopago.dtos;

import java.time.Instant;

public class OauthStatusDTO {
    private boolean linked;
    private String accountEmail;
    private String mpUserId;
    private Instant expiresAt;
    public OauthStatusDTO() {}
    public OauthStatusDTO(boolean linked, String email, String user, Instant exp) {
        this.linked = linked; this.accountEmail = email; this.mpUserId = user; this.expiresAt = exp;
    }
    // getters/setters
    public boolean isLinked(){return linked;} public void setLinked(boolean v){this.linked=v;}
    public String getAccountEmail(){return accountEmail;} public void setAccountEmail(String v){this.accountEmail=v;}
    public String getMpUserId(){return mpUserId;} public void setMpUserId(String v){this.mpUserId=v;}
    public Instant getExpiresAt(){return expiresAt;} public void setExpiresAt(Instant v){this.expiresAt=v;}
}
