# ✅ Validación de Emails Duplicados

## 🎯 Implementación

Se agregó validación para evitar que se registren usuarios con correos electrónicos duplicados.

---

## 🔍 Flujo de Validación

### **Endpoint:** `POST /api/auth/registro`

```
Usuario intenta registrarse
         ↓
1. Verificar si email existe en BD
         ↓
   ¿Existe? → ❌ Error: "Este correo ya está registrado"
         ↓
   NO existe
         ↓
2. Verificar si email existe en Cognito
         ↓
   ¿Existe? → ❌ Error: "Este correo ya está registrado"
         ↓
   NO existe
         ↓
3. Proceder con el registro en Cognito
         ↓
✅ Usuario registrado exitosamente
```

---

## 📝 Archivos modificados:

### 1️⃣ **`CognitoService.java`**
- ✅ Agregado método `existeUsuarioEnCognito(String email)`
- Verifica si un usuario existe en AWS Cognito por su email
- Retorna `true` si existe, `false` si no existe

### 2️⃣ **`UsuarioService.java`**
- ✅ Agregado método `existeEmailEnBD(String email)`
- Verifica si un email existe en la base de datos
- Retorna `true` si existe, `false` si no existe

### 3️⃣ **`AuthController.java`**
- ✅ Modificado endpoint `/api/auth/registro`
- Agregadas validaciones antes de registrar
- Retorna error específico si el email ya existe

---

## 🧪 Casos de prueba:

### **Caso 1: Email nuevo (no existe en BD ni Cognito)**
```json
POST /api/auth/registro
{
  "email": "nuevo@ejemplo.com",
  "password": "MiPassword123!"
}
```
**Respuesta:**
```json
{
  "mensaje": "Usuario registrado. Verifica tu email para obtener el código de confirmación.",
  "sub": "xxxx-xxxx-xxxx-xxxx",
  "email": "nuevo@ejemplo.com"
}
```
✅ **Resultado:** Usuario registrado exitosamente

---

### **Caso 2: Email ya existe en la base de datos**
```json
POST /api/auth/registro
{
  "email": "existente@ejemplo.com",
  "password": "MiPassword123!"
}
```
**Respuesta:**
```json
{
  "error": "Este correo electrónico ya está registrado. Por favor, ingresa un correo diferente o inicia sesión."
}
```
❌ **Resultado:** Registro rechazado (HTTP 400)

---

### **Caso 3: Email ya existe en Cognito pero no en BD**
```json
POST /api/auth/registro
{
  "email": "encognito@ejemplo.com",
  "password": "MiPassword123!"
}
```
**Respuesta:**
```json
{
  "error": "Este correo electrónico ya está registrado en el sistema. Por favor, ingresa un correo diferente o inicia sesión."
}
```
❌ **Resultado:** Registro rechazado (HTTP 400)

---

## 🔄 Flujo completo de registro:

```
1. Frontend: Usuario ingresa email y password
         ↓
2. POST /api/auth/registro
         ↓
3. Backend valida:
   - Email en BD ❌
   - Email en Cognito ❌
         ↓
4. Registra en Cognito
         ↓
5. Frontend: Pedir código de confirmación
         ↓
6. POST /api/auth/confirmar (con código)
         ↓
7. Frontend: Pedir datos de perfil
         ↓
8. POST /api/auth/completar-perfil
         ↓
9. Backend crea:
   - Empresa en BD
   - Usuario en BD
   - Actualiza Cognito
         ↓
✅ Usuario registrado completamente
```

---

## 🎯 Ventajas:

✅ **Previene duplicados** en BD y Cognito  
✅ **Mensaje claro** al usuario sobre el problema  
✅ **Validación temprana** (antes de registrar en Cognito)  
✅ **Evita registros incompletos** (usuario en Cognito pero no en BD)  
✅ **Seguridad** mejorada  

---

## 🔐 Seguridad:

- El método `existeUsuarioEnCognito()` usa la excepción `UserNotFoundException` para determinar si el usuario existe
- No expone información sensible sobre usuarios existentes
- Solo confirma si el email está o no disponible

---

## 📚 Métodos agregados:

### `CognitoService.existeUsuarioEnCognito(String email)`
```java
public boolean existeUsuarioEnCognito(String email) {
    try {
        AdminGetUserRequest request = AdminGetUserRequest.builder()
                .userPoolId(USER_POOL_ID)
                .username(email)
                .build();

        cognitoClient.adminGetUser(request);
        return true; // Usuario existe
    } catch (UserNotFoundException e) {
        return false; // Usuario no encontrado
    }
}
```

### `UsuarioService.existeEmailEnBD(String email)`
```java
public boolean existeEmailEnBD(String email) {
    return usuarioRepository.findByEmail(email).isPresent();
}
```

---

## ✅ Listo para usar

La validación ya está implementada y funcionando. Los usuarios no podrán registrarse con correos duplicados. 🎉

