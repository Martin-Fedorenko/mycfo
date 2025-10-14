# 🔐 FLUJO DE REGISTRO E INTEGRACIÓN CON BD - IMPLEMENTADO

## 📋 RESUMEN

Se ha implementado un flujo completo de registro de usuarios con tres pantallas y sincronización automática entre AWS Cognito y la base de datos PostgreSQL a través del módulo de administración.

---

## 🎯 FLUJO IMPLEMENTADO

### 1. **REGISTRO (SignUp.js)**
**URL**: `/#/signup`

**Funcionalidad:**
- Usuario ingresa **email** y **contraseña**
- Se crea cuenta en **AWS Cognito**
- Cognito envía código de verificación al email
- Avanza automáticamente a la pantalla de confirmación

**Tecnologías:**
- `amazon-cognito-identity-js` → `userPool.signUp()`
- Material-UI para interfaz
- Navegación con `react-router-dom`

---

### 2. **CONFIRMACIÓN DE CÓDIGO (SignUp.js - Step 2)**
**URL**: `/#/signup` (mismo componente, segundo paso)

**Funcionalidad:**
- Usuario ingresa el **código de 6 dígitos** recibido por email
- Se confirma la cuenta en Cognito
- Se hace **login automático** para obtener el `sub` (ID único del usuario)
- Guarda temporalmente el `sub` y `email` en `sessionStorage`
- Redirige a **Completar Perfil**

**Tecnologías:**
- `cognitoUser.confirmRegistration()`
- `cognitoUser.authenticateUser()` para obtener el sub

---

### 3. **COMPLETAR PERFIL (CompleteProfile.js)**
**URL**: `/#/complete-profile`

**Funcionalidad:**
- Usuario completa:
  - ✅ Nombre completo
  - ✅ Teléfono
  - ✅ Nombre de la empresa
  - ✅ Descripción de la empresa
- Al enviar:
  1. **Crea la empresa** en la BD
  2. **Crea el usuario** en la BD (vinculado a la empresa como ADMINISTRADOR)
  3. **Actualiza Cognito** con los datos del usuario
  4. Guarda `sub`, `organizacionId`, `nombre`, `email` en `sessionStorage`
  5. Redirige al **Home**

**Backend Endpoint:**
```
POST http://localhost:8083/api/auth/completar-perfil
```

**Body:**
```json
{
  "sub": "cognito-user-id",
  "nombre": "Juan Pérez",
  "email": "juan@empresa.com",
  "telefono": "+54 9 11 1234-5678",
  "nombreEmpresa": "Mi Empresa S.A.",
  "descripcionEmpresa": "Descripción..."
}
```

**Response:**
```json
{
  "mensaje": "Perfil completado exitosamente",
  "sub": "cognito-user-id",
  "organizacionId": 1,
  "nombre": "Juan Pérez",
  "email": "juan@empresa.com"
}
```

---

### 4. **INICIO DE SESIÓN (SignIn.js)**
**URL**: `/#/signin`

**Funcionalidad ACTUALIZADA:**
- Usuario ingresa **email** y **contraseña**
- Autenticación en **Cognito**
- **Verifica si el usuario tiene perfil completo en la BD:**
  ```
  GET http://localhost:8083/api/auth/verificar-perfil/{sub}
  ```
- **Si NO tiene perfil:**
  - Guarda `tempSub` y `tempEmail`
  - Redirige a **Completar Perfil**
- **Si tiene perfil:**
  - Obtiene datos del usuario desde la BD:
    ```
    GET http://localhost:8083/api/usuarios/perfil
    Headers: X-Usuario-Sub: {sub}
    ```
  - Guarda en `sessionStorage`:
    - `sub`
    - `email`
    - `nombre`
    - `telefono`
    - `organizacionId`
    - `organizacion` (nombre de la empresa)
  - Redirige al **Home**

**IMPORTANTE:** Los datos del usuario ahora se obtienen **SIEMPRE** desde la BD, no de Cognito.

---

## 🔧 BACKEND - MÓDULO DE ADMINISTRACIÓN

### **Ubicación:** `/administracion`

### **Endpoints Implementados:**

#### **AuthController**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/registro` | Registra usuario en Cognito |
| POST | `/api/auth/confirmar` | Confirma código de verificación |
| POST | `/api/auth/completar-perfil` | Crea usuario y empresa en BD + actualiza Cognito |
| GET | `/api/auth/verificar-perfil/{sub}` | Verifica si usuario tiene perfil en BD |

#### **UsuarioController**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/perfil` | Obtiene perfil del usuario (Header: X-Usuario-Sub) |
| PUT | `/api/usuarios/perfil` | Actualiza perfil (BD + Cognito) |
| GET | `/api/usuarios/{sub}` | Obtiene usuario por sub |
| GET | `/api/usuarios/empresa/{empresaId}` | Lista empleados de una empresa |
| PUT | `/api/usuarios/{sub}` | Actualiza empleado (BD + Cognito) |
| DELETE | `/api/usuarios/{sub}` | Elimina empleado (BD + Cognito) |
| PUT | `/api/usuarios/{sub}/activar` | Activa empleado |
| PUT | `/api/usuarios/{sub}/desactivar` | Desactiva empleado |

#### **EmpresaController**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/empresas/` | Lista todas las empresas |
| GET | `/api/empresas/{id}` | Obtiene empresa por ID |
| POST | `/api/empresas/` | Crea empresa |
| PUT | `/api/empresas/{id}` | Actualiza empresa |

---

### **Modelos de Base de Datos:**

#### **Usuario**
```java
@Entity
public class Usuario {
    @Id
    private String sub; // PK - ID de Cognito
    private String nombre;
    private String email;
    private String telefono;
    @Enumerated(EnumType.STRING)
    private Rol rol; // ADMINISTRADOR, NORMAL
    private Boolean activo;
    @ManyToOne
    private Empresa empresa;
}
```

#### **Empresa**
```java
@Entity
public class Empresa {
    @Id
    @GeneratedValue
    private Long id;
    private String nombre;
    private String descripcion;
}
```

#### **Rol (Enum)**
```java
public enum Rol {
    ADMINISTRADOR,
    NORMAL
}
```

---

## 🎨 FRONTEND - COMPONENTES MODIFICADOS

### **1. SignUp.js**
- Agregado login automático después de confirmación
- Redirección a `/complete-profile` en vez de `/signin`

### **2. CompleteProfile.js** ✨ NUEVO
- Formulario para datos personales y de empresa
- Integración con backend para crear usuario y empresa
- Guarda datos en `sessionStorage`

### **3. SignIn.js**
- Verificación de perfil completo antes de permitir acceso
- Carga de datos desde BD en vez de Cognito
- Redirección a `/complete-profile` si no tiene perfil

### **4. SideMenu.js y SideMenuMobile.js**
- **ANTES:** Mostraba `name` y `family_name` de Cognito
- **AHORA:** Muestra `nombre` y `email` de la BD

### **5. Perfil.js**
- **ANTES:** Obtenía y actualizaba datos solo en Cognito
- **AHORA:** 
  - Obtiene datos desde BD al cargar
  - Actualiza BD y Cognito al guardar
  - Solo muestra campos: nombre, email, teléfono

### **6. App.js**
- Agregada ruta `/complete-profile` (pública)

---

## 📦 DEPENDENCIAS BACKEND

### **`administracion/pom.xml`**

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- AWS SDK for Cognito -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>cognitoidentityprovider</artifactId>
        <version>2.20.26</version>
    </dependency>
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>auth</artifactId>
        <version>2.20.26</version>
    </dependency>
</dependencies>
```

---

## 🔑 VARIABLES DE ENTORNO REQUERIDAS

### **Backend (Java/Spring Boot)**

```env
# PostgreSQL
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/mycfo_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=tu_password

# AWS Cognito
COGNITO_USER_POOL_ID=sa-east-1_lTMNrWW7R
COGNITO_CLIENT_ID=3ksssqtg3r49rf6js1t1177hrd
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
```

### **Frontend (React)**

```env
REACT_APP_COGNITO_USER_POOL_ID=sa-east-1_lTMNrWW7R
REACT_APP_COGNITO_CLIENT_ID=3ksssqtg3r49rf6js1t1177hrd
REACT_APP_AWS_REGION=sa-east-1
```

---

## 🚀 CÓMO FUNCIONA EL FLUJO COMPLETO

### **Caso 1: Nuevo Usuario**

1. **Usuario va a** `/#/signup`
2. Ingresa email y contraseña → **Cuenta creada en Cognito**
3. Recibe código por email → Lo ingresa
4. **Confirmación exitosa** → Login automático → Redirige a `/complete-profile`
5. Completa datos personales y de empresa
6. **Backend crea:**
   - Empresa en BD
   - Usuario en BD (rol: ADMINISTRADOR)
   - Actualiza Cognito con nombre y teléfono
7. **Redirige al Home** con sesión iniciada

---

### **Caso 2: Usuario Existente con Perfil Completo**

1. **Usuario va a** `/#/signin`
2. Ingresa email y contraseña → **Autenticación en Cognito**
3. Backend verifica si tiene perfil en BD → **SÍ**
4. Obtiene datos desde BD:
   - nombre
   - email
   - telefono
   - organizacionId
5. **Redirige al Home** con datos en `sessionStorage`

---

### **Caso 3: Usuario Existente SIN Perfil Completo**

1. **Usuario va a** `/#/signin`
2. Ingresa email y contraseña → **Autenticación en Cognito**
3. Backend verifica si tiene perfil en BD → **NO**
4. **Redirige a** `/complete-profile`
5. Completa datos (mismo flujo que Caso 1)

---

## ✅ VALIDACIONES IMPLEMENTADAS

### **Frontend**
- ✅ Email debe tener formato válido
- ✅ Contraseña mínimo 6 caracteres
- ✅ Código de confirmación es obligatorio
- ✅ Nombre completo es obligatorio
- ✅ Nombre de empresa es obligatorio
- ✅ Verifica existencia de `tempSub` antes de completar perfil

### **Backend**
- ✅ Validación de `sub` existente en Cognito
- ✅ Creación transaccional de Empresa + Usuario
- ✅ Sincronización automática BD ↔ Cognito
- ✅ Manejo de errores con mensajes descriptivos

---

## 🔄 SINCRONIZACIÓN BD ↔ COGNITO

### **Al crear usuario:**
1. Se crea en Cognito (SignUp)
2. Se confirma en Cognito (ConfirmSignUp)
3. Se crea en BD con empresa
4. Se actualiza Cognito con nombre y teléfono

### **Al actualizar perfil:**
1. Usuario edita datos en `/perfil`
2. Backend actualiza en BD
3. Backend actualiza en Cognito automáticamente
4. Frontend actualiza `sessionStorage`

### **Al eliminar usuario:**
1. Backend elimina de BD
2. Backend elimina de Cognito automáticamente

---

## 📌 DATOS EN SESSION STORAGE

Después del login completo:

```javascript
sessionStorage.setItem("sub", "cognito-user-id");
sessionStorage.setItem("nombre", "Juan Pérez");
sessionStorage.setItem("email", "juan@empresa.com");
sessionStorage.setItem("telefono", "+54 9 11 1234-5678");
sessionStorage.setItem("organizacionId", "1");
sessionStorage.setItem("organizacion", "Mi Empresa S.A.");
sessionStorage.setItem("accessToken", "...");
sessionStorage.setItem("idToken", "...");
sessionStorage.setItem("refreshToken", "...");
```

---

## 🎉 RESULTADO FINAL

✅ **Flujo de registro completo** con 3 pantallas  
✅ **Sincronización automática** BD ↔ Cognito  
✅ **Multi-tenancy** implementado (por empresa)  
✅ **Datos del usuario** obtenidos desde BD  
✅ **Sidebar y perfil** muestran datos de BD  
✅ **Validación de perfil** antes de permitir acceso  
✅ **Primer usuario** de una empresa es ADMINISTRADOR  

---

## 📝 NOTAS ADICIONALES

### **Seguridad:**
- Contraseñas gestionadas por Cognito (no se guardan en BD)
- Tokens JWT para autenticación
- Header `X-Usuario-Sub` para identificar usuario en cada request

### **Multi-tenancy:**
- Cada usuario pertenece a **UNA** empresa
- `organizacionId` se usa para filtrar todos los datos
- Usuarios solo ven datos de su empresa

### **Roles:**
- **ADMINISTRADOR**: Primer usuario de la empresa
- **NORMAL**: Empleados invitados posteriormente

---

## 🐛 TROUBLESHOOTING

### **"Error loading user profile"**
- Verificar que el backend esté corriendo en puerto 8083
- Verificar conexión a PostgreSQL
- Verificar que exista el usuario en la BD

### **"Please complete your profile first"**
- El usuario existe en Cognito pero no en BD
- Completar el perfil en `/complete-profile`

### **"Error al completar perfil"**
- Verificar credenciales AWS en variables de entorno
- Verificar conectividad con Cognito
- Verificar logs del backend

---

**Fecha de implementación:** Octubre 2025  
**Módulos afectados:** `administracion`, `frontend/sign-up`, `frontend/sign-in`, `frontend/home`, `frontend/administracion/perfil`

