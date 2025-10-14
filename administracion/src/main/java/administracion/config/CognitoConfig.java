package administracion.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;

@Configuration
public class CognitoConfig {

    @Value("${AWS_ACCESS_KEY_ID:#{null}}")
    private String accessKeyId;

    @Value("${AWS_SECRET_ACCESS_KEY:#{null}}")
    private String secretAccessKey;

    @Value("${AWS_REGION:sa-east-1}")
    private String region;

    @Bean
    public CognitoIdentityProviderClient cognitoClient() {
        // Verificar si las credenciales están disponibles
        if (accessKeyId != null && !accessKeyId.isEmpty() && 
            secretAccessKey != null && !secretAccessKey.isEmpty()) {
            
            System.out.println("✅ Usando credenciales AWS específicas desde .env o variables de entorno");
            
            // Usar credenciales específicas
            AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
            return CognitoIdentityProviderClient.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                    .build();
        } else {
            System.out.println("⚠️ No se encontraron credenciales AWS. Usando cadena de proveedores por defecto.");
            
            // Usar credenciales por defecto (perfil, IAM role, etc.)
            return CognitoIdentityProviderClient.builder()
                    .region(Region.of(region))
                    .build();
        }
    }
}

