# 🐳 Cómo usar Docker Compose

## ✅ Configuración

Todo está listo para usar Docker Compose con variables de entorno seguras.

### 📁 Archivos importantes:

| Archivo | Propósito | ¿Se sube a Git? |
|---------|-----------|-----------------|
| `.env` | **Tus credenciales reales** (AWS, Cognito, DB) | ❌ NO |
| `.env.example` | Plantilla para otros desarrolladores | ✅ SÍ |
| `docker-compose.yml` | Configuración de servicios | ✅ SÍ |

---

## 🚀 Cómo usar

### 1. Primera vez (ya está hecho):
El archivo `.env` ya tiene tus credenciales configuradas.

### 2. Levantar todos los servicios:
```bash
docker-compose up --build
```

### 3. Levantar solo un servicio:
```bash
docker-compose up administracion --build
```

### 4. Detener los servicios:
```bash
docker-compose down
```

---

## 👥 Para otros desarrolladores

Si alguien más clona el proyecto:

1. **Copiar el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Editar el `.env` con sus propias credenciales:**
   - AWS Access Key ID
   - AWS Secret Access Key
   - Cognito User Pool ID
   - Cognito Client ID

3. **Levantar los servicios:**
   ```bash
   docker-compose up --build
   ```

---

## 🔐 Seguridad

- ✅ El `.env` está en `.gitignore` → **NUNCA se sube a Git**
- ✅ El `docker-compose.yml` **SÍ se sube a Git** (no tiene credenciales)
- ✅ El `.env.example` sirve como plantilla

---

## ⚠️ IMPORTANTE: Credenciales que debes rotar

### 1. AWS Credentials
**Tus credenciales AWS están comprometidas** (las compartiste anteriormente).

Pasos para rotarlas:
1. Ir a: https://console.aws.amazon.com/iam/
2. Eliminar: `AKIA3PDL62RGT7LSNDJB`
3. Crear nuevas credenciales
4. Actualizar en el `.env`

### 2. Mercado Pago
**Tus credenciales de Mercado Pago están expuestas**.

Pasos para rotarlas:
1. Ir a: https://www.mercadopago.com.ar/developers/panel/app
2. Regenerar el **Client Secret**
3. Actualizar en el `.env`:
   ```env
   MERCADOPAGO_CLIENT_ID=tu_nuevo_client_id
   MERCADOPAGO_CLIENT_SECRET=tu_nuevo_client_secret
   ```

### 3. Encryption Secret
**Genera una clave aleatoria segura de 32 caracteres**.

PowerShell (Windows):
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Bash (Linux/Mac):
```bash
openssl rand -base64 32 | head -c 32
```

Actualizar en el `.env`:
```env
APP_ENCRYPT_SECRET=TuClaveAleatoriaDe32Caracteres
```

### 4. Reiniciar servicios
```bash
docker-compose down
docker-compose up --build
```

---

## 📊 Servicios disponibles

| Servicio | Puerto | URL |
|----------|--------|-----|
| Administración | 8083 | http://localhost:8083 |
| Consolidación | 8082 | http://localhost:8082 |
| IA | 8083 | http://localhost:8083 |
| Notificación | 8084 | http://localhost:8084 |
| Pronóstico | 8085 | http://localhost:8085 |
| Registro | 8086 | http://localhost:8086 |
| Reporte | 8087 | http://localhost:8087 |
| MySQL | 3306 | localhost:3306 |

---

## 🎉 ¡Ya está todo listo!

Solo ejecuta:
```bash
docker-compose up --build
```

Y todos los servicios levantarán con las credenciales del archivo `.env`. 🚀
