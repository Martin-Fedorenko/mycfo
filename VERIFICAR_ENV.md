# 🔍 Verificar que el .env está configurado correctamente

## ⚠️ IMPORTANTE: Verifica tu archivo `.env`

### 📍 Ubicación del archivo:
```
D:\Proyectos\mycfo\.env
```

---

## ✅ Contenido Esperado del `.env`:

```env
# ⚠️ CREDENCIALES AWS - NO SUBIR A GIT ⚠️
AWS_ACCESS_KEY_ID=AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=sa-east-1

# AWS Cognito
COGNITO_USER_POOL_ID=sa-east-1_lTMNrWW7R
COGNITO_CLIENT_ID=3ksssqtg3r49rf6js1t1177hrd

# Base de datos MySQL
MYSQL_ROOT_PASSWORD=root
MYSQL_USER=user
MYSQL_PASSWORD=password

# ===================================================
# 💳 MERCADO PAGO CREDENTIALS
# ===================================================
MERCADOPAGO_CLIENT_ID=704879919479266
MERCADOPAGO_CLIENT_SECRET=mkPO02jnuyLVGDdRSt4c76IQ31cduINb

# URL de callback OAuth (debe coincidir con lo configurado en MP Developers)
MERCADOPAGO_REDIRECT_URI=http://localhost:8086/api/mp/oauth/callback
# Para producción con ngrok (cambiar por tu URL):
# MERCADOPAGO_REDIRECT_URI=https://8623e704fdca.ngrok-free.app/api/mp/oauth/callback

# URLs base de Mercado Pago (no cambiar a menos que uses otro país)
MERCADOPAGO_OAUTH_AUTHORIZE=https://auth.mercadolibre.com.ar/authorization
MERCADOPAGO_BASE_URL=https://api.mercadopago.com
MERCADOPAGO_SCOPE=offline_access

# URL del frontend (React)
MERCADOPAGO_FRONTEND_URL=http://localhost:3000

# ===================================================
# 🔐 ENCRYPTION SECRET
# ===================================================
# Clave para encriptar/desencriptar datos sensibles en la BD
# ⚠️ DEBE SER EXACTAMENTE 32 caracteres (256 bits para AES)
APP_ENCRYPT_SECRET=MiClaveSecreta123456789012345678

# ===================================================
# 📧 EMAIL CONFIGURATION (para notificaciones)
# ===================================================
# Gmail SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=mycfoarg@gmail.com
MAIL_PASSWORD=eavr gatf hysw kxen
MAIL_SSL_TRUST=smtp.gmail.com

# Email remitente para notificaciones
NOTIFICATIONS_EMAIL_FROM=noreply@mycfo.com
```

---

## 🚨 Errores Comunes:

### ❌ Error 1: Variables vacías
```env
# ❌ MAL
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# ✅ BIEN
AWS_ACCESS_KEY_ID=AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY=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
```

### ❌ Error 2: Espacios alrededor del `=`
```env
# ❌ MAL
AWS_ACCESS_KEY_ID = AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY = 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

# ✅ BIEN
AWS_ACCESS_KEY_ID=AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY=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
```

### ❌ Error 3: Comillas innecesarias
```env
# ❌ MAL
AWS_ACCESS_KEY_ID="AKIA3PDL62RGT7LSNDJB"
AWS_SECRET_ACCESS_KEY="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"

# ✅ BIEN
AWS_ACCESS_KEY_ID=AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY=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
```

---

## 🔧 Comandos de Verificación:

### **Windows PowerShell:**
```powershell
# Ver si el archivo .env existe
Test-Path .env

# Ver el contenido del .env (CUIDADO: muestra credenciales)
Get-Content .env
```

### **Windows CMD:**
```cmd
# Ver si el archivo .env existe
dir .env

# Ver el contenido del .env (CUIDADO: muestra credenciales)
type .env
```

---

## 🧪 Probar la Aplicación:

### **1. Reiniciar el módulo de administración:**

Si estás ejecutando localmente:
```bash
# Detener el proceso actual (Ctrl+C)
# Volver a ejecutar
cd administracion
mvn clean spring-boot:run
```

Si estás usando Docker:
```bash
# Detener y reiniciar
docker-compose down
docker-compose up --build administracion
```

---

### **2. Buscar el mensaje de confirmación:**

En los logs, deberías ver:
```
✅ Usando credenciales AWS específicas desde .env o variables de entorno
```

Si ves esto, **¡las credenciales se cargaron correctamente!** ✅

---

Si ves esto:
```
⚠️ No se encontraron credenciales AWS. Usando cadena de proveedores por defecto.
```

**Revisa:**
- Que el archivo `.env` exista en la raíz del proyecto
- Que las variables `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` tengan valores
- Que no haya espacios ni comillas innecesarias

---

## 🎯 Próximo Paso:

Una vez que veas el mensaje `✅ Usando credenciales AWS específicas...`, intenta registrar un usuario nuevamente en:

```
http://localhost:3000/#/signup
```

---

## ⚠️ RECORDATORIO DE SEGURIDAD:

Las credenciales mostradas en este documento **YA ESTÁN COMPROMETIDAS** porque fueron compartidas en este chat.

**DEBES rotarlas:**
1. Ve a AWS Console → IAM → Security Credentials
2. Desactiva las credenciales actuales
3. Crea nuevas credenciales
4. Actualiza tu archivo `.env`

🔐 **NUNCA** compartas credenciales en chats, código o repositorios.

