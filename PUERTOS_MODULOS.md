# 🔌 Puertos de los Módulos - MyCFO

## 📋 Configuración de Puertos

| Módulo | Puerto | URL Base | Descripción |
|--------|--------|----------|-------------|
| **Administración** | `8081` | `http://localhost:8081` | Gestión de usuarios, empresas, autenticación |
| **Consolidación** | `8082` | `http://localhost:8082` | Consolidación de datos financieros |
| **IA** | `8083` | `http://localhost:8083` | Servicios de inteligencia artificial |
| **Notificación** | `8084` | `http://localhost:8084` | Sistema de notificaciones |
| **Pronóstico** | `8085` | `http://localhost:8085` | Pronósticos financieros |
| **Registro** | `8086` | `http://localhost:8086` | Registro de movimientos y documentos |
| **Reporte** | `8087` | `http://localhost:8087` | Generación de reportes |
| **Frontend** | `3000` | `http://localhost:3000` | Aplicación React |

---

## 🎯 Endpoints del Módulo de Administración (Puerto 8081)

### **Autenticación:**
- `POST /api/auth/registro` - Registro de nuevo usuario
- `POST /api/auth/confirmar` - Confirmación de código de verificación
- `POST /api/auth/reenviar-codigo` - Reenvío de código de confirmación
- `GET /api/auth/verificar-perfil/{sub}` - Verificar si el perfil está completo

### **Usuarios:**
- `GET /api/usuarios/perfil` - Obtener perfil del usuario
- `PUT /api/usuarios/perfil` - Actualizar perfil del usuario
- `GET /api/usuarios/empresa/{empresaId}` - Obtener empleados de una empresa

### **Empresas:**
- `GET /api/empresas/{id}` - Obtener datos de una empresa
- `PUT /api/empresas/{id}` - Actualizar datos de una empresa

---

## ✅ Archivos Corregidos

Los siguientes archivos tenían referencias incorrectas al puerto `8083` que fueron corregidas a `8081`:

### **Frontend:**
1. ✅ `frontend/src/sign-up/SignUp.js`
   - Línea 108: `POST http://localhost:8081/api/auth/registro`

2. ✅ `frontend/src/sign-up/ConfirmAccount.js`
   - Línea 75: `POST http://localhost:8081/api/auth/confirmar`
   - Línea 103: `POST http://localhost:8081/api/auth/reenviar-codigo`

3. ✅ `frontend/src/sign-in/SignIn.js`
   - Línea 134: `GET http://localhost:8081/api/usuarios/perfil`

4. ✅ `frontend/src/administracion/perfil/Perfil.js`
   - Línea 21: `GET http://localhost:8081/api/usuarios/perfil`
   - Línea 56: `PUT http://localhost:8081/api/usuarios/perfil`

---

## 🔧 Docker Compose - Configuración de Puertos

```yaml
services:
  administracion:
    ports:
      - "8081:8081"
    environment:
      - SERVER_PORT=8081

  consolidacion:
    ports:
      - "8082:8082"
    environment:
      - SERVER_PORT=8082

  ia:
    ports:
      - "8083:8083"
    environment:
      - SERVER_PORT=8083

  notificacion:
    ports:
      - "8084:8084"
    environment:
      - SERVER_PORT=8084

  pronostico:
    ports:
      - "8085:8085"
    environment:
      - SERVER_PORT=8085

  registro:
    ports:
      - "8086:8086"
    environment:
      - SERVER_PORT=8086

  reporte:
    ports:
      - "8087:8087"
    environment:
      - SERVER_PORT=8087

  frontend:
    ports:
      - "3000:3000"
```

---

## 🚀 Verificación

Para verificar que los servicios están corriendo en los puertos correctos:

```bash
# Verificar administración (puerto 8081)
curl http://localhost:8081/actuator/health

# Verificar registro (puerto 8086)
curl http://localhost:8086/actuator/health

# Verificar frontend (puerto 3000)
curl http://localhost:3000
```

---

## ✅ Estado Actual

Todos los archivos del frontend ahora apuntan correctamente al módulo de administración en el puerto **8081**. ✅

🎉 ¡El error `ERR_CONNECTION_REFUSED` debería estar resuelto!

