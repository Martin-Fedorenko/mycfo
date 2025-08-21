package consolidacion.mercadopago.models;

import consolidacion.mercadopago.config.CryptoConverter;
import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="mp_account_link")
public class MpAccountLink {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long userIdApp;
    @Column(nullable=false, unique=true) private String mpUserId;
    @Column(nullable=false) private String email;
    @Convert(converter = CryptoConverter.class) @Column(nullable=false, length=2048) private String accessToken;
    @Convert(converter = CryptoConverter.class) @Column(nullable=false, length=2048) private String refreshToken;
    private String scope;
    @Column(nullable=false) private Instant expiresAt;
    @Column(nullable=false) private Instant createdAt;
    @Column(nullable=false) private Instant updatedAt;
    // getters/setters
    public Long getId(){return id;} public void setId(Long v){this.id=v;}
    public Long getUserIdApp(){return userIdApp;} public void setUserIdApp(Long v){this.userIdApp=v;}
    public String getMpUserId(){return mpUserId;} public void setMpUserId(String v){this.mpUserId=v;}
    public String getEmail(){return email;} public void setEmail(String v){this.email=v;}
    public String getAccessToken(){return accessToken;} public void setAccessToken(String v){this.accessToken=v;}
    public String getRefreshToken(){return refreshToken;} public void setRefreshToken(String v){this.refreshToken=v;}
    public String getScope(){return scope;} public void setScope(String v){this.scope=v;}
    public Instant getExpiresAt(){return expiresAt;} public void setExpiresAt(Instant v){this.expiresAt=v;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){this.createdAt=v;}
    public Instant getUpdatedAt(){return updatedAt;} public void setUpdatedAt(Instant v){this.updatedAt=v;}
}
