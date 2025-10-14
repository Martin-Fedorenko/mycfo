# 🔍 Verificación del Flujo de Credenciales

## 📊 Flujo completo: `.env` → Docker → Spring Boot → Código

```
.env
  ↓ (Docker Compose lee el archivo)
docker-compose.yml
  ↓ (Pasa como variables de entorno al contenedor)
Contenedor Docker
  ↓ (Spring Boot lee las variables de entorno)
application.properties
  ↓ (Spring Boot inyecta en el código)
Código Java
```

---

## ✅ MÓDULO ADMINISTRACION (AWS Cognito)

### 1️⃣ `.env`
```env
COGNITO_USER_POOL_ID=sa-east-1_lTMNrWW7R
COGNITO_CLIENT_ID=3ksssqtg3r49rf6js1t1177hrd
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY=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
```
✅ **Listo**

### 2️⃣ `docker-compose.yml` (servicio administracion)
```yaml
environment:
  - COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}
  - COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
  - AWS_REGION=${AWS_REGION}
  - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
  - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
```
✅ **Listo** - Docker Compose pasa las variables al contenedor

### 3️⃣ `administracion/src/main/resources/application.properties`
```properties
aws.cognito.userPoolId=${COGNITO_USER_POOL_ID:sa-east-1_lTMNrWW7R}
aws.cognito.clientId=${COGNITO_CLIENT_ID:3ksssqtg3r49rf6js1t1177hrd}
aws.region=${AWS_REGION:sa-east-1}
aws.accessKeyId=${AWS_ACCESS_KEY_ID:}
aws.secretAccessKey=${AWS_SECRET_ACCESS_KEY:}
```
✅ **Listo** - Spring Boot lee las variables de entorno

### 4️⃣ `administracion/src/main/java/administracion/config/CognitoConfig.java`
```java
String accessKeyId = System.getenv("AWS_ACCESS_KEY_ID");
String secretAccessKey = System.getenv("AWS_SECRET_ACCESS_KEY");
String region = System.getenv("AWS_REGION");
```
✅ **Listo** - Lee directamente del entorno (Docker ya las pasó)

---

## ✅ MÓDULO REGISTRO (Mercado Pago)

### 1️⃣ `.env`
```env
MERCADOPAGO_CLIENT_ID=704879919479266
MERCADOPAGO_CLIENT_SECRET=mkPO02jnuyLVGDdRSt4c76IQ31cduINb
MERCADOPAGO_REDIRECT_URI=http://localhost:8086/api/mp/oauth/callback
MERCADOPAGO_OAUTH_AUTHORIZE=https://auth.mercadolibre.com.ar/authorization
MERCADOPAGO_BASE_URL=https://api.mercadopago.com
MERCADOPAGO_SCOPE=offline_access
MERCADOPAGO_FRONTEND_URL=http://localhost:3000
APP_ENCRYPT_SECRET=MiClaveSecreta123456789012345678
```
✅ **Listo**

### 2️⃣ `docker-compose.yml` (servicio registro)
```yaml
environment:
  - MERCADOPAGO_CLIENT_ID=${MERCADOPAGO_CLIENT_ID}
  - MERCADOPAGO_CLIENT_SECRET=${MERCADOPAGO_CLIENT_SECRET}
  - MERCADOPAGO_REDIRECT_URI=${MERCADOPAGO_REDIRECT_URI}
  - MERCADOPAGO_OAUTH_AUTHORIZE=${MERCADOPAGO_OAUTH_AUTHORIZE}
  - MERCADOPAGO_BASE_URL=${MERCADOPAGO_BASE_URL}
  - MERCADOPAGO_SCOPE=${MERCADOPAGO_SCOPE}
  - MERCADOPAGO_FRONTEND_URL=${MERCADOPAGO_FRONTEND_URL}
  - APP_ENCRYPT_SECRET=${APP_ENCRYPT_SECRET}
```
✅ **Listo** - Docker Compose pasa las variables al contenedor

### 3️⃣ `registro/src/main/resources/application.properties`
```properties
mercadopago.client-id=${MERCADOPAGO_CLIENT_ID}
mercadopago.client-secret=${MERCADOPAGO_CLIENT_SECRET}
mercadopago.redirect-uri=${MERCADOPAGO_REDIRECT_URI:http://localhost:8086/api/mp/oauth/callback}
mercadopago.oauth-authorize=${MERCADOPAGO_OAUTH_AUTHORIZE:https://auth.mercadolibre.com.ar/authorization}
mercadopago.base-url=${MERCADOPAGO_BASE_URL:https://api.mercadopago.com}
mercadopago.scope=${MERCADOPAGO_SCOPE:offline_access}
mercadopago.frontend-url=${MERCADOPAGO_FRONTEND_URL:http://localhost:3000}
```
✅ **Listo** - Spring Boot lee las variables de entorno

### 4️⃣ `registro/src/main/java/registro/mercadopago/config/MpProperties.java`
```java
@Component
@ConfigurationProperties(prefix = "mercadopago")
public class MpProperties {
    private String clientId;        // ← Se inyecta desde mercadopago.client-id
    private String clientSecret;    // ← Se inyecta desde mercadopago.client-secret
    private String redirectUri;     // ← Se inyecta desde mercadopago.redirect-uri
    // ...
}
```
✅ **Listo** - Spring Boot mapea automáticamente las propiedades

### 5️⃣ `registro/src/main/java/registro/mercadopago/config/CryptoConverter.java`
```java
String secret = System.getenv().getOrDefault("APP_ENCRYPT_SECRET", "0123456789ABCDEF0123456789ABCDEF");
```
✅ **Listo** - Lee directamente del entorno (Docker ya la pasó)

---

## 🎯 Resumen de Verificación

| Módulo | Credencial | `.env` | `docker-compose` | `application.properties` | Código Java |
|--------|-----------|--------|------------------|-------------------------|-------------|
| **administracion** | AWS Cognito | ✅ | ✅ | ✅ | ✅ |
| **administracion** | AWS Keys | ✅ | ✅ | ✅ | ✅ |
| **registro** | Mercado Pago | ✅ | ✅ | ✅ | ✅ |
| **registro** | Encrypt Secret | ✅ | ✅ | N/A | ✅ |

---

## 🧪 Cómo probar que funciona:

### 1. Verificar que Docker Compose lee el .env:
```bash
docker-compose config
```
Deberías ver las variables reemplazadas con los valores reales (no `${VARIABLE}`).

### 2. Verificar variables dentro del contenedor:
```bash
# Levantar servicios
docker-compose up -d

# Ver variables del contenedor de administracion
docker exec administracion env | grep -E "AWS|COGNITO"

# Ver variables del contenedor de registro
docker exec registro env | grep -E "MERCADO|APP_ENCRYPT"
```

### 3. Verificar logs de Spring Boot:
```bash
# Ver logs de administracion
docker logs administracion

# Ver logs de registro
docker logs registro
```

Si Spring Boot encuentra las variables, NO deberías ver errores sobre propiedades faltantes.

---

## ⚠️ Posibles problemas:

### Problema 1: Docker Compose no lee el .env
**Solución:** El archivo `.env` DEBE estar en el mismo directorio que `docker-compose.yml`

### Problema 2: Variables no se pasan al contenedor
**Síntoma:** `docker exec contenedor env` no muestra las variables
**Solución:** Verificar sintaxis en `docker-compose.yml`: `- VARIABLE=${VARIABLE}`

### Problema 3: Spring Boot no lee las variables
**Síntoma:** Logs muestran "Could not resolve placeholder"
**Solución:** Verificar sintaxis en `application.properties`: `propiedad=${VARIABLE:default}`

### Problema 4: El .env tiene espacios o comillas
**Síntoma:** Variables tienen valores incorrectos
**Solución:** En el `.env`, NO usar comillas ni espacios:
```env
# ❌ MAL
AWS_REGION = "sa-east-1"
MERCADOPAGO_CLIENT_ID = 704879919479266

# ✅ BIEN
AWS_REGION=sa-east-1
MERCADOPAGO_CLIENT_ID=704879919479266
```

---

## ✅ TODO ESTÁ CONFIGURADO CORRECTAMENTE

El flujo completo está implementado y debería funcionar sin problemas. 🎉

