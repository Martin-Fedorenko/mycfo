# 🎯 Cómo funciona el sistema de configuración

## ✅ Configuración actual:

Todos los `application.properties` ahora usan esta sintaxis:

```properties
propiedad=${VARIABLE:valor_por_defecto}
```

---

## 🔄 Flujo de carga de configuración:

### **1️⃣ Con Docker Compose** (producción/testing):

```
docker-compose.yml lee .env
         ↓
Pasa variables como environment al contenedor
         ↓
Spring Boot las lee con ${VARIABLE:default}
         ↓
✅ Usa el valor del docker-compose
```

### **2️⃣ Sin Docker (desarrollo local):**

```
spring-dotenv lee .env de la raíz
         ↓
Inyecta variables como environment
         ↓
Spring Boot las lee con ${VARIABLE:default}
         ↓
✅ Usa el valor del .env
```

### **3️⃣ Si no existe .env ni docker-compose:**

```
Spring Boot busca ${VARIABLE}
         ↓
No encuentra variable de entorno
         ↓
Usa el valor por defecto después de ":"
         ↓
✅ Usa el fallback hardcodeado
```

---

## 🎯 Resultado:

| Escenario | Prioridad | Fuente |
|-----------|-----------|--------|
| **Docker Compose** | 1️⃣ | Variables del `docker-compose.yml` |
| **Local con .env** | 2️⃣ | Variables del `.env` (vía spring-dotenv) |
| **Fallback** | 3️⃣ | Valores por defecto en `application.properties` |

---

## 📝 Ejemplo concreto:

```properties
# En application.properties:
aws.region=${AWS_REGION:sa-east-1}
```

### Caso 1: Con Docker
```yaml
# docker-compose.yml tiene:
environment:
  - AWS_REGION=us-east-1
```
**Resultado:** `aws.region = us-east-1` ✅

### Caso 2: Local con .env
```env
# .env tiene:
AWS_REGION=sa-east-1
```
**Resultado:** `aws.region = sa-east-1` ✅

### Caso 3: Sin nada
```
# No hay .env ni docker-compose
```
**Resultado:** `aws.region = sa-east-1` (usa el default) ✅

---

## ⚠️ IMPORTANTE: Tu .env tiene errores

Revisa el archivo `TU_ENV_TIENE_ERRORES.md` para corregir los errores de sintaxis.

### Formato correcto del .env:

```env
# ✅ BIEN - Todas las variables tienen = y valor
AWS_ACCESS_KEY_ID=AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=sa-east-1
COGNITO_USER_POOL_ID=sa-east-1_lTMNrWW7R
COGNITO_CLIENT_ID=3ksssqtg3r49rf6js1t1177hrd
MYSQL_ROOT_PASSWORD=root
MYSQL_USER=user
MYSQL_PASSWORD=password
MERCADOPAGO_CLIENT_ID=704879919479266
MERCADOPAGO_CLIENT_SECRET=mkPO02jnuyLVGDdRSt4c76IQ31cduINb
MERCADOPAGO_REDIRECT_URI=http://localhost:8086/api/mp/oauth/callback
MERCADOPAGO_OAUTH_AUTHORIZE=https://auth.mercadolibre.com.ar/authorization
MERCADOPAGO_BASE_URL=https://api.mercadopago.com
MERCADOPAGO_SCOPE=offline_access
MERCADOPAGO_FRONTEND_URL=http://localhost:3000
APP_ENCRYPT_SECRET=MiClaveSecreta123456789012345678
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=mycfoarg@gmail.com
MAIL_PASSWORD=eavr gatf hysw kxen
NOTIFICATIONS_EMAIL_FROM=noreply@mycfo.com
```

---

## 🚀 Para usar:

1. **Copia el contenido correcto** del `CONTENIDO_COMPLETO_ENV.txt` a tu `.env`

2. **Asegúrate que NO tenga errores de sintaxis:**
   - Todas las líneas tienen `=`
   - Todas las variables tienen valor
   - Sin espacios alrededor del `=`

3. **Recarga Maven y reinicia la app**

4. **Funciona igual con Docker o sin Docker** 🎉

---

## 📚 Ventajas de este sistema:

✅ **Mismo código funciona en desarrollo y producción**
✅ **Fácil override de variables por entorno**
✅ **Siempre hay un fallback funcional**
✅ **No necesitas configurar nada en el IDE**
✅ **El .env está en .gitignore (seguro)**

