# 📝 Agregar estas líneas al archivo .env

Copia y pega esto al final de tu archivo `.env`:

```env
# ===================================================
# 💳 MERCADO PAGO CREDENTIALS
# ===================================================
MERCADOPAGO_CLIENT_ID=704879919479266
MERCADOPAGO_CLIENT_SECRET=mkPO02jnuyLVGDdRSt4c76IQ31cduINb

# URL de callback OAuth (debe coincidir con lo configurado en MP Developers)
# Para desarrollo local:
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
# ⚠️ GENERA UNA NUEVA CLAVE ALEATORIA PARA PRODUCCIÓN
APP_ENCRYPT_SECRET=MiClaveSecreta123456789012345678
```

---

## ⚠️ IMPORTANTE: Genera una clave de encriptación segura

La clave `APP_ENCRYPT_SECRET` debe ser **EXACTAMENTE 32 caracteres**.

### Genera una clave aleatoria segura:

#### PowerShell (Windows):
```powershell
# Generar clave aleatoria de 32 caracteres
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

#### Bash (Linux/Mac):
```bash
# Generar clave aleatoria de 32 caracteres
openssl rand -base64 32 | head -c 32
```

Luego reemplaza `MiClaveSecreta123456789012345678` con la clave generada.

---

## 📋 Resumen de cambios

### Credenciales que YA NO están hardcodeadas:
✅ **Mercado Pago Client ID**
✅ **Mercado Pago Client Secret**
✅ **Redirect URI** (configurable por entorno)
✅ **Frontend URL** (configurable por entorno)
✅ **Encryption Secret** (antes tenía default inseguro)

### Archivos modificados:
- ✅ `registro/src/main/resources/application.properties`
- ✅ `docker-compose.yml`

---

## 🚀 Para aplicar los cambios:

1. **Agrega las líneas al `.env`** (copia el bloque de arriba)

2. **Genera una clave de encriptación segura** y reemplázala en el `.env`

3. **Reinicia los servicios:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

---

## 🔄 Para producción con ngrok:

Si vas a usar ngrok, cambia la línea:
```env
MERCADOPAGO_REDIRECT_URI=https://TU-SUBDOMINIO.ngrok-free.app/api/mp/oauth/callback
```

Y **actualiza también en Mercado Pago Developers**:
https://www.mercadopago.com.ar/developers/panel/app

---

## ⚠️ SEGURIDAD

**Estas credenciales están EXPUESTAS en este documento**. Deberías:

1. **Rotar las credenciales de Mercado Pago:**
   - Ir a: https://www.mercadopago.com.ar/developers/panel/app
   - Regenerar el Client Secret

2. **Generar nueva clave de encriptación** (ver comandos arriba)

3. **Nunca subir el `.env` a Git** (ya está en `.gitignore` ✅)

