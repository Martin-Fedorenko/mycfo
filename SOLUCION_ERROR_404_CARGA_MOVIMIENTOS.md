# ✅ Solución: Error 404 al Cargar Movimientos

## 🔴 Problema

Al intentar cargar movimientos (Ingreso, Egreso, Deuda, Acreencia) desde el frontend, se recibía el error:

```
AxiosError: Request failed with status code 404
```

**Causa:** Los endpoints antiguos no existían en el backend:
- ❌ `/ingresos/formulario` → No existe
- ❌ `/egresos/formulario` → No existe  
- ❌ `/obligaciones/formulario` → No existe
- ❌ `/acreencias/formulario` → No existe

---

## ✅ Solución Implementada

### 1. Actualizar Endpoints en Frontend

**Archivo: `CargaVistaFinal.js`**

#### Antes (Endpoints que no existían):
```javascript
const endpointMap = {
  ingreso: {
    formulario: `${API_BASE}/ingresos/formulario`, // ❌ 404
  },
  egreso: {
    formulario: `${API_BASE}/egresos/formulario`, // ❌ 404
  },
  // ...
};
```

#### Ahora (Endpoint unificado):
```javascript
const ENDPOINT_UNIFICADO = `${API_BASE}/api/carga-datos`;

const endpointMap = {
  ingreso: {
    formulario: ENDPOINT_UNIFICADO, // ✅ Existe
  },
  egreso: {
    formulario: ENDPOINT_UNIFICADO, // ✅ Existe
  },
  deuda: {
    formulario: ENDPOINT_UNIFICADO, // ✅ Existe
  },
  acreencia: {
    formulario: ENDPOINT_UNIFICADO, // ✅ Existe
  },
  // ...
};
```

---

### 2. Actualizar Formato del Payload

**Archivo: `CargaFormulario.js`**

El endpoint unificado espera un formato específico:

```javascript
{
  "tipo": "movimiento",
  "metodo": "formulario",
  "datos": { /* datos del formulario */ },
  "tipoMovimiento": "Ingreso|Egreso|Deuda|Acreencia"
}
```

#### Código implementado:
```javascript
// Determinar tipo y tipoMovimiento
if (["ingreso", "egreso", "deuda", "acreencia"].includes(tipoDoc.toLowerCase())) {
  // Es un movimiento
  tipoMovimiento = tipoDoc.charAt(0).toUpperCase() + tipoDoc.slice(1);
  
  payload = {
    tipo: "movimiento",
    metodo: "formulario",
    datos: {
      ...formData,
      tipo: tipoMovimiento
    },
    tipoMovimiento: tipoMovimiento
  };
}
```

---

### 3. Actualizar Backend Controller

**Archivo: `CargaDatosController.java`**

Agregamos manejo del `tipoMovimiento`:

```java
case "movimiento":
    Movimiento movimiento = objectMapper.convertValue(datos, Movimiento.class);
    
    // Setear el tipo de movimiento si viene en el payload
    String tipoMovimientoStr = (String) payload.get("tipoMovimiento");
    if (tipoMovimientoStr != null) {
        movimiento.setTipo(TipoMovimiento.valueOf(tipoMovimientoStr));
    }
    
    Movimiento movimientoGuardado = movimientoService.guardarMovimiento(movimiento);
    resultado = movimientoGuardado;
    id = movimientoGuardado.getId();
    break;
```

---

## 🔄 Flujo Completo

### 1. Usuario completa formulario de Deuda

```
Frontend: Usuario llena formulario
         ↓
CargaFormulario.js: Valida campos
         ↓
Prepara payload:
{
  "tipo": "movimiento",
  "metodo": "formulario",
  "datos": {
    "montoTotal": 50000,
    "montoPagado": 10000,
    "fechaEmision": "2025-10-14",
    "fechaVencimiento": "2025-12-15",
    // ...
  },
  "tipoMovimiento": "Deuda"
}
         ↓
POST /api/carga-datos
         ↓
CargaDatosController.java: Recibe payload
         ↓
Convierte datos a Movimiento
         ↓
Setea tipo = TipoMovimiento.Deuda
         ↓
movimientoService.guardarMovimiento()
         ↓
Guarda en BD
         ↓
Retorna respuesta exitosa
```

---

## 🧪 Prueba Manual

### Crear una Deuda

**Frontend:**
1. Ir a `/carga`
2. Seleccionar "Deuda"
3. Seleccionar "Formulario"
4. Llenar campos:
   - Monto total: 50000
   - Moneda: ARS
   - Monto pagado: 10000
   - Fecha emisión: Hoy
   - Fecha vencimiento: 30 días
   - Cantidad cuotas: 12
   - Cuotas pagadas: 3
5. Click "Enviar deuda"

**Resultado esperado:**
```
✅ Enviado con éxito!
```

**En el backend se guarda:**
```java
Movimiento {
  tipo: TipoMovimiento.Deuda,
  montoTotal: 50000.0,
  montoPagado: 10000.0,
  fechaEmision: "2025-10-14",
  fechaVencimiento: "2025-11-13",
  cantidadCuotas: 12,
  cuotasPagadas: 3,
  // ...
}
```

---

## 📊 Mapeo de Tipos

| Frontend (URL) | tipoDoc | tipoMovimiento | Backend tipo |
|---------------|---------|----------------|--------------|
| `/carga/ingreso/formulario` | "ingreso" | "Ingreso" | `TipoMovimiento.Ingreso` |
| `/carga/egreso/formulario` | "egreso" | "Egreso" | `TipoMovimiento.Egreso` |
| `/carga/deuda/formulario` | "deuda" | "Deuda" | `TipoMovimiento.Deuda` |
| `/carga/acreencia/formulario` | "acreencia" | "Acreencia" | `TipoMovimiento.Acreencia` |

---

## ✅ Archivos Modificados

### Backend
1. ✅ `CargaDatosController.java`
   - Agregado manejo de `tipoMovimiento`
   - Limpiados imports no usados
   - Suprimido warning de cast

### Frontend
2. ✅ `CargaVistaFinal.js`
   - Actualizado a usar endpoint unificado `/api/carga-datos`
   - Agregado soporte para `deuda`

3. ✅ `CargaFormulario.js`
   - Actualizado formato del payload
   - Agregada lógica para determinar `tipoMovimiento`
   - Headers de usuario y organización

---

## 🔍 Debugging

### Ver el payload en consola del navegador:

```javascript
// En CargaFormulario.js (línea antes del axios.post)
console.log('📤 Payload enviado:', payload);
console.log('🎯 Headers:', headers);
console.log('📍 Endpoint:', endpoint);
```

### Ver el request en backend:

```java
// En CargaDatosController.java (dentro del método cargarDatos)
System.out.println("📥 Payload recibido: " + payload);
System.out.println("🎯 Tipo: " + tipo);
System.out.println("📋 TipoMovimiento: " + payload.get("tipoMovimiento"));
```

---

## 📋 Checklist de Verificación

- [x] Endpoint unificado `/api/carga-datos` existe en backend
- [x] Frontend usa el endpoint unificado
- [x] Payload tiene formato correcto: `{tipo, metodo, datos, tipoMovimiento}`
- [x] Backend extrae y setea `tipoMovimiento` correctamente
- [x] Enum `TipoMovimiento` tiene valores: Ingreso, Egreso, Deuda, Acreencia
- [x] Headers `X-Usuario-Sub` y `X-Organizacion-Id` se envían
- [x] Sin errores de linting

---

## 🎯 Resultado

✅ **Problema resuelto:**
- Los movimientos se cargan correctamente
- El endpoint unificado funciona para todos los tipos
- Los datos se guardan con el tipo correcto
- Sin errores 404

✅ **Funcionalidad completa:**
- Cargar Ingresos ✅
- Cargar Egresos ✅
- Cargar Deudas ✅
- Cargar Acreencias ✅
- Cargar Facturas ✅

---

## 📞 Referencias

- Backend: `registro/src/main/java/registro/cargarDatos/controllers/CargaDatosController.java`
- Frontend: `frontend/src/registro/carga-general/CargaVistaFinal.js`
- Frontend: `frontend/src/registro/carga-general/components/CargaFormulario.js`
- Enum: `registro/src/main/java/registro/cargarDatos/models/TipoMovimiento.java`

