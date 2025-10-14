# 🔧 Solución: Error de Credenciales AWS

## ❌ Error Original:

```
Unable to load credentials from any of the providers in the chain...
Access key must be specified either via environment variable (AWS_ACCESS_KEY_ID) 
or system property (aws.accessKeyId).
```

---

## 🎯 Causa del Problema:

El código de `CognitoConfig.java` estaba intentando leer las credenciales de AWS usando `System.getenv()`, que solo funciona si las variables de entorno están configuradas en el **sistema operativo**.

Cuando ejecutas la aplicación **localmente** (sin Docker):
- `spring-dotenv` carga el archivo `.env` en las **propiedades de Spring** (`@Value`, `Environment`)
- **NO** establece las variables de entorno del sistema (`System.getenv()`)
- Por eso fallaba al intentar obtener `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`

---

## ✅ Solución Implementada:

### **1. Modificación de `CognitoConfig.java`**

**Antes:**
```java
String accessKeyId = System.getenv("AWS_ACCESS_KEY_ID");
String secretAccessKey = System.getenv("AWS_SECRET_ACCESS_KEY");
String region = System.getenv("AWS_REGION") != null ? System.getenv("AWS_REGION") : "sa-east-1";
```

**Después:**
```java
@Value("${AWS_ACCESS_KEY_ID:#{null}}")
private String accessKeyId;

@Value("${AWS_SECRET_ACCESS_KEY:#{null}}")
private String secretAccessKey;

@Value("${AWS_REGION:sa-east-1}")
private String region;
```

---

## 🔄 Cómo Funciona Ahora:

### **Ejecución Local (sin Docker):**
```
1. Spring Boot inicia
         ↓
2. spring-dotenv lee .env
         ↓
3. Carga AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
         ↓
4. @Value inyecta los valores en CognitoConfig
         ↓
5. ✅ Cognito se configura correctamente
```

### **Ejecución con Docker:**
```
1. Docker Compose carga .env
         ↓
2. Pasa las variables al contenedor (environment:)
         ↓
3. Spring Boot lee las variables de entorno
         ↓
4. @Value inyecta los valores en CognitoConfig
         ↓
5. ✅ Cognito se configura correctamente
```

---

## 📋 Checklist de Verificación:

Antes de ejecutar, asegúrate de que:

### ✅ **1. Archivo `.env` existe en la raíz del proyecto**
```
D:\Proyectos\mycfo\.env
```

### ✅ **2. El `.env` contiene las credenciales correctas:**
```env
# AWS Credenciales
AWS_ACCESS_KEY_ID=AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=sa-east-1

# AWS Cognito
COGNITO_USER_POOL_ID=sa-east-1_lTMNrWW7R
COGNITO_CLIENT_ID=3ksssqtg3r49rf6js1t1177hrd
```

### ✅ **3. El `pom.xml` raíz tiene `spring-dotenv`:**
```xml
<dependency>
    <groupId>me.paulschwarz</groupId>
    <artifactId>spring-dotenv</artifactId>
    <version>4.0.0</version>
</dependency>
```

### ✅ **4. El `docker-compose.yml` pasa las variables:**
```yaml
services:
  administracion:
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=${AWS_REGION}
      - COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}
      - COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
```

---

## 🚀 Para Ejecutar:

### **Opción 1: Localmente (sin Docker)**
```bash
# 1. Verificar que el .env existe
ls .env

# 2. Ejecutar el módulo de administración
cd administracion
mvn spring-boot:run
```

**Salida esperada:**
```
✅ Usando credenciales AWS específicas desde .env o variables de entorno
```

---

### **Opción 2: Con Docker**
```bash
# 1. Detener contenedores existentes
docker-compose down

# 2. Reconstruir y levantar
docker-compose up --build administracion
```

**Salida esperada:**
```
✅ Usando credenciales AWS específicas desde .env o variables de entorno
```

---

## 🔍 Verificación:

Si ves este mensaje en los logs:
```
✅ Usando credenciales AWS específicas desde .env o variables de entorno
```

**¡Todo está bien!** Las credenciales se cargaron correctamente.

---

Si ves este mensaje:
```
⚠️ No se encontraron credenciales AWS. Usando cadena de proveedores por defecto.
```

**Hay un problema:**
- El archivo `.env` no existe
- El archivo `.env` no tiene las variables `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`
- Las variables están vacías

---

## ⚠️ IMPORTANTE - Seguridad:

Las credenciales que aparecen en este documento (`AKIA3PDL62RGT7LSNDJB`) **ya fueron comprometidas** al compartirlas en este chat.

**Debes rotarlas inmediatamente:**

1. Ir a AWS Console → IAM → Security Credentials
2. Desactivar las credenciales actuales
3. Crear nuevas credenciales
4. Actualizar el archivo `.env` con las nuevas credenciales
5. **NUNCA** compartir credenciales en chats, código o repositorios públicos

---

## ✅ Resumen de Cambios:

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `CognitoConfig.java` | Usar `@Value` en lugar de `System.getenv()` | ✅ Completado |
| `docker-compose.yml` | Corregir puerto a 8081 | ✅ Completado |
| `pom.xml` (raíz) | Incluir `spring-dotenv` | ✅ Ya estaba |

---

## 🎉 ¡Listo!

Ahora las credenciales de AWS se cargarán correctamente tanto en desarrollo local como en Docker. 🚀

