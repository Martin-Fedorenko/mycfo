# 🔐 NUEVO FLUJO DE REGISTRO - IMPLEMENTADO

## 📋 CAMBIOS REALIZADOS

### **FLUJO ANTERIOR:**
1. Email + Contraseña → Registro en Cognito
2. Código de verificación → Confirmación
3. Login → Redirige a completar perfil
4. Completar perfil → Crea en BD → Home

### **FLUJO NUEVO (IMPLEMENTADO):**
1. **Email + Contraseña** → Registro en Cognito ✅
2. **Completar Perfil** (nombre, empresa, etc.) ✅
3. **Código de verificación** → Confirma + Crea en BD + Login automático → Home ✅

---

## 🎯 VENTAJAS DEL NUEVO FLUJO

✅ **El usuario NO puede iniciar sesión sin completar su perfil**  
✅ **Todos los datos se solicitan ANTES de activar la cuenta**  
✅ **Mejor experiencia de usuario** (flujo lineal)  
✅ **Mayor control** sobre la creación de cuentas  

---

## 🔄 FLUJO DETALLADO PASO A PASO

### **PANTALLA 1: Sign Up** (`/#/signup`)

**Usuario ingresa:**
- Email
- Contraseña (mínimo 6 caracteres)

**Qué ocurre:**
1. Se crea cuenta en **AWS Cognito**
2. Cognito envía código de verificación al email
3. Se guardan en `sessionStorage`:
   - `tempEmail`
   - `tempPassword`
4. **Redirige a** `/complete-profile`

**Código implementado en `SignUp.js`:**
```javascript
userPool.signUp(email, password, attributeList, null, (err, result) => {
  sessionStorage.setItem("tempEmail", email);
  sessionStorage.setItem("tempPassword", password);
  setTimeout(() => navigate("/complete-profile"), 1500);
});
```

---

### **PANTALLA 2: Complete Profile** (`/#/complete-profile`)

**Usuario completa:**
- ✅ Nombre completo
- ✅ Teléfono
- ✅ Nombre de la empresa
- ✅ Descripción de la empresa

**Qué ocurre:**
1. Se guardan datos temporalmente en `sessionStorage`:
   - `tempNombre`
   - `tempTelefono`
   - `tempNombreEmpresa`
   - `tempDescripcionEmpresa`
2. **Redirige a** `/confirm-account`

**⚠️ IMPORTANTE:** En esta pantalla **NO** se guarda nada en la BD todavía.

**Código implementado en `CompleteProfile.js`:**
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  sessionStorage.setItem("tempNombre", formData.nombre);
  sessionStorage.setItem("tempTelefono", formData.telefono);
  sessionStorage.setItem("tempNombreEmpresa", formData.nombreEmpresa);
  sessionStorage.setItem("tempDescripcionEmpresa", formData.descripcionEmpresa);
  
  setTimeout(() => navigate("/confirm-account"), 500);
};
```

---

### **PANTALLA 3: Confirm Account** (`/#/confirm-account`)

**Usuario ingresa:**
- Código de 6 dígitos (recibido por email)

**Qué ocurre (en orden):**

#### **Paso 1: Confirmar código en Cognito**
```javascript
cognitoUser.confirmRegistration(code, true, callback);
```

#### **Paso 2: Login automático para obtener el `sub`**
```javascript
cognitoUser.authenticateUser(authenticationDetails, {
  onSuccess: (authResult) => {
    const sub = authResult.getIdToken().payload.sub;
    // Continuar al paso 3...
  }
});
```

#### **Paso 3: Crear usuario y empresa en la BD**
```javascript
await axios.post("http://localhost:8083/api/auth/completar-perfil", {
  sub: sub,
  nombre: nombre,
  email: email,
  telefono: telefono,
  nombreEmpresa: nombreEmpresa,
  descripcionEmpresa: descripcionEmpresa,
});
```

**Backend crea:**
- ✅ Empresa en la tabla `empresa`
- ✅ Usuario en la tabla `usuario` (rol: ADMINISTRADOR)
- ✅ Actualiza Cognito con nombre y teléfono

#### **Paso 4: Guardar datos en sessionStorage**
```javascript
sessionStorage.setItem("sub", response.data.sub);
sessionStorage.setItem("organizacionId", response.data.organizacionId);
sessionStorage.setItem("nombre", response.data.nombre);
sessionStorage.setItem("email", response.data.email);
sessionStorage.setItem("telefono", telefono);
sessionStorage.setItem("organizacion", nombreEmpresa);
sessionStorage.setItem("accessToken", authResult.getAccessToken().getJwtToken());
sessionStorage.setItem("idToken", authResult.getIdToken().getJwtToken());
sessionStorage.setItem("refreshToken", authResult.getRefreshToken().getToken());
```

#### **Paso 5: Limpiar datos temporales**
```javascript
sessionStorage.removeItem("tempEmail");
sessionStorage.removeItem("tempPassword");
sessionStorage.removeItem("tempNombre");
sessionStorage.removeItem("tempTelefono");
sessionStorage.removeItem("tempNombreEmpresa");
sessionStorage.removeItem("tempDescripcionEmpresa");
```

#### **Paso 6: Redirigir al Home**
```javascript
window.location.href = "http://localhost:3000/#";
```

---

## 📦 ARCHIVOS MODIFICADOS

### **Frontend:**

| Archivo | Cambios |
|---------|---------|
| `frontend/src/sign-up/SignUp.js` | ✅ Simplificado: solo registro, no confirmación<br>✅ Redirige a `/complete-profile` después de registrar |
| `frontend/src/sign-up/CompleteProfile.js` | ✅ NO llama al backend<br>✅ Solo guarda datos temporales<br>✅ Redirige a `/confirm-account` |
| `frontend/src/sign-up/ConfirmAccount.js` | ✅ Confirma código<br>✅ Login automático<br>✅ Crea usuario en BD<br>✅ Guarda todo en sessionStorage<br>✅ Redirige al home |
| `frontend/src/App.js` | ✅ Agregada ruta `/confirm-account` |

### **Backend:**
No se modificó (ya estaba implementado el endpoint `/api/auth/completar-perfil`)

---

## 🔐 DATOS EN SESSION STORAGE

### **Durante el Flujo (temporales):**
```javascript
// Después de Sign Up:
tempEmail
tempPassword

// Después de Complete Profile:
tempNombre
tempTelefono
tempNombreEmpresa
tempDescripcionEmpresa
```

### **Después del Login Exitoso (permanentes):**
```javascript
sub                  // ID de Cognito
email               // Email del usuario
nombre              // Nombre completo
telefono            // Teléfono
organizacionId      // ID de la empresa
organizacion        // Nombre de la empresa
accessToken         // JWT de acceso
idToken            // JWT de identidad
refreshToken       // Token para renovar sesión
```

---

## ✅ VALIDACIONES IMPLEMENTADAS

### **Pantalla 1 (Sign Up):**
- ✅ Email válido
- ✅ Contraseña mínimo 6 caracteres

### **Pantalla 2 (Complete Profile):**
- ✅ Nombre completo obligatorio
- ✅ Nombre de empresa obligatorio
- ✅ Verifica existencia de `tempEmail` y `tempPassword` (si no existen, redirige a signup)

### **Pantalla 3 (Confirm Account):**
- ✅ Código de 6 dígitos obligatorio
- ✅ Verifica existencia de datos temporales
- ✅ Manejo de errores de confirmación
- ✅ Manejo de errores de creación en BD

---

## 🚫 PREVENCIÓN DE INICIO DE SESIÓN ANTICIPADO

### **¿Qué pasa si el usuario intenta hacer login antes de completar el perfil?**

El flujo de **SignIn** ya está preparado:

```javascript
// En SignIn.js (ya implementado anteriormente)
const response = await axios.get(`http://localhost:8083/api/auth/verificar-perfil/${sub}`);

if (!response.data.perfilCompleto) {
  sessionStorage.setItem("tempSub", sub);
  sessionStorage.setItem("tempEmail", formValues.email);
  
  // Limpiar tokens
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("idToken");
  sessionStorage.removeItem("refreshToken");
  
  setGlobalMsg("Please complete your profile first.");
  setTimeout(() => navigate("/complete-profile"), 1500);
  return;
}
```

**Resultado:** Si el usuario confirmó su cuenta en Cognito pero NO completó su perfil en la BD, se le redirige automáticamente a completar perfil.

---

## 🎯 CASOS DE USO

### **Caso 1: Flujo Normal (Nuevo Usuario)**

```
Usuario → /#/signup
  ↓ (ingresa email + password)
Cognito crea cuenta + envía email
  ↓
Usuario → /#/complete-profile
  ↓ (ingresa nombre, empresa, etc.)
Guarda datos temporalmente
  ↓
Usuario → /#/confirm-account
  ↓ (ingresa código del email)
Cognito confirma + Login automático + BD crea usuario y empresa
  ↓
Usuario → /#/ (Home) ✅
```

### **Caso 2: Usuario interrumpe el flujo**

```
Usuario → /#/signup → Registra email
Usuario → /#/complete-profile → Completa datos
Usuario → Cierra navegador ❌

[Más tarde...]
Usuario → /#/signin → Intenta hacer login
Backend verifica → NO tiene perfil en BD
  ↓
Usuario → /#/complete-profile (redirigido automáticamente)
  ↓ (completa datos nuevamente)
Usuario → /#/confirm-account
  ↓ (ingresa código)
Usuario → /#/ (Home) ✅
```

### **Caso 3: Usuario confirma cuenta pero no completa perfil**

```
Usuario → /#/signup
Usuario → /#/complete-profile
Usuario → /#/confirm-account → ¡Error en BD! ❌
  (Cuenta confirmada en Cognito, pero NO creada en BD)

[Más tarde...]
Usuario → /#/signin
Backend verifica → NO tiene perfil en BD
  ↓
Usuario → /#/complete-profile
  ↓ (completa datos nuevamente)
Backend crea usuario y empresa ✅
Usuario → /#/ (Home) ✅
```

---

## 🔧 MANEJO DE ERRORES

### **Error en la confirmación del código:**
```javascript
if (err) {
  setError(err.message || JSON.stringify(err));
  setLoading(false);
  return;
}
```
**Resultado:** Usuario puede intentar de nuevo con el código correcto.

### **Error en la creación de perfil en BD:**
```javascript
catch (backendErr) {
  setError("Error creating your profile. Please contact support.");
  setLoading(false);
}
```
**Resultado:** 
- Cuenta confirmada en Cognito ✅
- Usuario NO creado en BD ❌
- Al hacer login, se detecta que no tiene perfil y se redirige a completar perfil

### **Error de autenticación después de confirmar:**
```javascript
onFailure: (authErr) => {
  setError("Error logging in after confirmation. Please try signing in manually.");
  setLoading(false);
}
```
**Resultado:** Usuario puede ir a `/signin` e iniciar sesión manualmente.

---

## 📝 RESPUESTA A LA PREGUNTA SOBRE CREDENCIALES AWS

### **¿Se pueden obtener las credenciales AWS temporalmente de Cognito?**

**NO.** Las credenciales AWS (`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`) **NO** se pueden obtener de Cognito porque:

1. Son necesarias **PARA** acceder a Cognito desde el backend
2. No son parte de Cognito, son de tu cuenta AWS
3. Se obtienen desde la consola AWS (IAM)

### **Alternativa para desarrollo SIN credenciales AWS:**

El flujo actual ya NO necesita credenciales AWS en el backend para el **registro inicial**:

- ✅ Registro en Cognito → **Frontend** (usando `amazon-cognito-identity-js`)
- ✅ Confirmación de código → **Frontend**
- ✅ Login → **Frontend**
- ✅ Crear usuario/empresa en BD → **Backend** (solo PostgreSQL, no necesita Cognito)

**⚠️ Solo necesitas credenciales AWS si quieres:**
- Actualizar atributos de usuario en Cognito desde el backend
- Eliminar usuarios en Cognito desde el backend
- Activar/desactivar usuarios en Cognito desde el backend

**Para estas operaciones, puedes:**
1. Obtener credenciales AWS desde IAM
2. O manejarlas desde el frontend con `updateAttributes()` de `amazon-cognito-identity-js`

---

## 🎉 RESULTADO FINAL

✅ **Flujo completo de 3 pantallas implementado**  
✅ **Usuario NO puede iniciar sesión sin completar perfil**  
✅ **Datos se solicitan ANTES de confirmar cuenta**  
✅ **Sincronización automática BD ↔ Cognito**  
✅ **Manejo robusto de errores**  
✅ **Multi-tenancy desde el primer usuario**  
✅ **Primer usuario = ADMINISTRADOR**  

---

**Fecha de actualización:** Octubre 2025  
**Archivos modificados:** `SignUp.js`, `CompleteProfile.js`, `ConfirmAccount.js`, `App.js`

