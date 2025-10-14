# 🔧 Cómo funciona `spring-dotenv`

## ✅ Ya está configurado

Agregué la dependencia `spring-dotenv` al `pom.xml` raíz, por lo que **TODOS los módulos** ahora pueden leer el archivo `.env` automáticamente.

---

## 📍 Ubicación del archivo `.env`

El archivo `.env` debe estar en la **raíz del proyecto**:

```
D:\Proyectos\mycfo\
├── .env                    ← AQUÍ
├── docker-compose.yml
├── pom.xml
├── administracion/
├── registro/
└── ...
```

---

## 🔄 Cómo funciona

1. **Cuando corres la aplicación** (desde IDE o `mvn spring-boot:run`):
   - `spring-dotenv` busca el archivo `.env` en la raíz del proyecto
   - Lee todas las variables y las inyecta como **variables de entorno**
   - Spring Boot las lee normalmente con `${VARIABLE}`

2. **NO necesitas cambiar nada en tu código**

3. **Funciona tanto en local como en Docker**
   - En local: Lee el `.env` de la raíz
   - En Docker: Docker Compose ya pasa las variables

---

## 🧪 Para probar:

1. **Asegúrate que el `.env` existe en la raíz** (`D:\Proyectos\mycfo\.env`)

2. **Recarga Maven** en tu IDE:
   - **IntelliJ:** Click derecho en `pom.xml` → `Maven` → `Reload project`
   - **VS Code:** `Ctrl+Shift+P` → `Java: Clean Java Language Server Workspace`
   - **Eclipse:** Click derecho en proyecto → `Maven` → `Update Project`

3. **Reinicia la aplicación**

4. **Ya debería funcionar** ✅

---

## 📝 Formato del `.env`

Tu archivo `.env` debe verse así (sin comillas, sin espacios):

```env
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
```

❌ **NO uses:**
```env
# MAL - con comillas
AWS_REGION="sa-east-1"

# MAL - con espacios
AWS_REGION = sa-east-1
```

✅ **Usa:**
```env
# BIEN
AWS_REGION=sa-east-1
```

---

## 🐛 Si no funciona:

1. **Verifica que el `.env` está en la raíz del proyecto**
   ```
   D:\Proyectos\mycfo\.env
   ```

2. **Verifica que no tenga errores de sintaxis** (sin comillas, sin espacios)

3. **Recarga Maven y reinicia la aplicación**

4. **Verifica en los logs de Spring Boot** que las variables se cargaron:
   ```
   DEBUG me.paulschwarz.spring.dotenv - Loading .env file from: D:\Proyectos\mycfo\.env
   ```

---

## 🎉 Ventajas

✅ **Mismo `.env` para desarrollo local y Docker**
✅ **No necesitas configurar variables en tu IDE**
✅ **No contaminas tu sistema con variables globales**
✅ **El `.env` está en `.gitignore`** (seguro)

---

## 📚 Más info

Documentación oficial: https://github.com/paulschwarz/spring-dotenv

