# 🎯 Nuevo Flujo de Registro Completo

## ✅ Implementación completada

Se ha actualizado completamente el flujo de registro según los nuevos requerimientos.

---

## 📋 Nuevo Flujo

### **Paso 1: Registro** (`/#/signup`)

El usuario completa un formulario con:
- ✅ **Email** (obligatorio)
- ✅ **Password** (obligatorio)
- ✅ **Nombre** (obligatorio)
- ✅ **Apellido** (obligatorio)
- ✅ **Nombre de Empresa** (obligatorio)

**Proceso:**
1. Se valida que el email no exista en BD ni en Cognito
2. **PRIMERO:** Se crea el usuario en Cognito con todos los atributos (email, nombre, apellido, empresa)
3. **SEGUNDO:** Se busca o crea la empresa en BD (si ya existe con ese nombre, no crea una nueva)
4. **TERCERO:** Se crea el usuario en BD vinculado a la empresa
5. Cognito envía automáticamente el código de verificación por email
6. Se guarda el email en `sessionStorage` y se redirige a `/confirm-account`

---

### **Paso 2: Confirmar Código** (`/#/confirm-account`)

El usuario ingresa el código de 6 dígitos que recibió por email.

**Funcionalidades:**
- ✅ Input para el código de verificación
- ✅ Botón "Confirmar cuenta"
- ✅ **Botón "Reenviar código"** (nuevo)
- ✅ Mensajes de error/éxito claros
- ✅ Redirección automática al login tras confirmación exitosa

---

## 🔄 Diagrama de Flujo

```
Usuario llena formulario de registro
         ↓
Validar email no duplicado
         ↓
¿Email existe? → ❌ Error
         ↓
Crear usuario en Cognito
         ↓
¿Empresa existe? 
  ├─ SÍ → Obtener empresa existente
  └─ NO → Crear nueva empresa
         ↓
Crear usuario en BD → Vincular a empresa
         ↓
Cognito envía código por email
         ↓
Redirigir a /confirm-account
         ↓
Usuario ingresa código
         ↓
¿Código correcto?
  ├─ NO → Mostrar error + opción de reenviar
  └─ SÍ → Confirmar en Cognito
         ↓
✅ Redirigir a /signin
```

---

## 📝 Archivos modificados:

### **Backend:**

#### 1️⃣ **`RegistroDTO.java`**
```java
@Data
public class RegistroDTO {
    private String email;
    private String password;
    private String nombre;        // ← NUEVO
    private String apellido;      // ← NUEVO
    private String nombreEmpresa; // ← NUEVO
}
```

#### 2️⃣ **`CognitoService.java`**
✅ Modificado `registrarUsuario()` para aceptar nombre, apellido y empresa
✅ Agregado `reenviarCodigoConfirmacion(String email)`

```java
public String registrarUsuario(String email, String password, String nombre, String apellido, String nombreEmpresa) {
    // Crea usuario en Cognito con todos los atributos
    SignUpRequest signUpRequest = SignUpRequest.builder()
            .clientId(CLIENT_ID)
            .username(email)
            .password(password)
            .userAttributes(
                    AttributeType.builder().name("email").value(email).build(),
                    AttributeType.builder().name("name").value(nombre).build(),
                    AttributeType.builder().name("family_name").value(apellido).build(),
                    AttributeType.builder().name("custom:empresa").value(nombreEmpresa).build()
            )
            .build();
    // ...
}

public void reenviarCodigoConfirmacion(String email) {
    // Reenvía el código de confirmación al email
    // ...
}
```

#### 3️⃣ **`AuthController.java`**
✅ Modificado `POST /api/auth/registro` - Ahora crea TODO en un solo paso
✅ Agregado `POST /api/auth/reenviar-codigo` - Para reenviar código

```java
@PostMapping("/registro")
@Transactional
public ResponseEntity<Map<String, String>> registrar(@RequestBody RegistroDTO dto) {
    // 1. Validar email no duplicado
    // 2. Crear en Cognito con todos los datos
    // 3. Buscar o crear empresa
    // 4. Crear usuario en BD
    // 5. Retornar éxito
}

@PostMapping("/reenviar-codigo")
public ResponseEntity<Map<String, String>> reenviarCodigo(@RequestBody Map<String, String> body) {
    // Reenvía el código de confirmación
}
```

#### 4️⃣ **`EmpresaRepository.java`**
✅ Agregado `findByNombreIgnoreCase(String nombre)`

```java
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByNombreIgnoreCase(String nombre);
}
```

---

### **Frontend:**

#### 5️⃣ **`SignUp.js`**
✅ Formulario completo con todos los campos
✅ Usa `axios` para llamar al backend (no más Cognito directo)
✅ Redirige a `/confirm-account` tras registro exitoso

**Campos del formulario:**
```jsx
- Nombre (TextField)
- Apellido (TextField)
- Nombre de Empresa (TextField)
- Email (TextField tipo email)
- Password (TextField tipo password)
```

#### 6️⃣ **`ConfirmAccount.js`** (Reescrito completamente)
✅ Input para código de 6 dígitos
✅ Botón "Confirmar cuenta"
✅ **Botón "Reenviar código"** (NUEVO)
✅ Usa `axios` para confirmar con el backend
✅ No hace login automático, solo redirige a `/signin`

---

## 🎯 Endpoints del Backend:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/registro` | Registra usuario completo (Cognito + BD) |
| `POST` | `/api/auth/confirmar` | Confirma el código de verificación |
| `POST` | `/api/auth/reenviar-codigo` | Reenvía el código de confirmación |

---

## 🔐 Características de Seguridad:

✅ **Email único:** Valida en BD y Cognito antes de crear
✅ **Transaccional:** Si falla algo, no queda inconsistencia
✅ **Empresa reutilizable:** Si la empresa ya existe, la reutiliza (no duplica)
✅ **Primer usuario = Admin:** El primero de una empresa es administrador
✅ **Código reenviable:** El usuario puede pedir un nuevo código si no lo recibe

---

## 📊 Flujo de Datos:

### **Cognito almacena:**
- Email
- Password (hasheado)
- Name (nombre)
- Family Name (apellido)
- Custom:empresa (nombre de empresa)
- Sub (ID único del usuario)

### **Base de Datos almacena:**
- Usuario:
  - Sub (FK a Cognito)
  - Nombre completo (nombre + apellido)
  - Email
  - Rol (ADMINISTRADOR para el primero)
  - Empresa (FK a Empresa)
  
- Empresa:
  - ID
  - Nombre
  - Descripción

---

## ✅ Ventajas del nuevo flujo:

✅ **Más simple:** Solo 2 pasos (registro → confirmación → login)
✅ **Menos pantallas:** Eliminada la pantalla intermedia de "Complete Profile"
✅ **Datos completos desde el inicio:** Todo se carga en Cognito y BD al registrar
✅ **Empresas compartibles:** Varios usuarios pueden tener la misma empresa
✅ **UX mejorada:** Botón para reenviar código si no llega
✅ **Código limpio:** Menos lógica en el frontend, más en el backend

---

## 🚀 Para probar:

1. Ir a `http://localhost:3000/#/signup`
2. Llenar todos los campos
3. Click en "Sign up"
4. Esperar el código por email
5. Ingresar el código en `http://localhost:3000/#/confirm-account`
6. Si no llega, click en "Reenviar código"
7. Confirmar y serás redirigido al login

---

## 🎉 ¡Flujo completo implementado!

Ahora el registro es más intuitivo, rápido y robusto. 🚀

