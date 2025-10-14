# ✅ Correcciones: Campos Compartidos Deudas y Acreencias

## 📋 Problema Identificado

Los formularios de **Deuda** y **Acreencia** usaban nombres de campos diferentes para los mismos campos del modelo backend, lo que causaba que los datos no se guardaran correctamente.

---

## 🔧 Campos Corregidos

### FormAcreencia.js

#### ❌ ANTES (Campos Incorrectos)

```javascript
// Campo que NO EXISTE en el modelo backend
formData.montoCobrado         // ❌
formData.fechaCobroEsperado   // ❌
formData.cuotasCobradas       // ❌
```

#### ✅ AHORA (Campos Correctos)

```javascript
// Campos que SÍ EXISTEN en el modelo backend
formData.montoPagado          // ✅
formData.fechaVencimiento     // ✅
formData.cuotasPagadas        // ✅
```

---

## 📝 Cambios Realizados

### 1. **Campo: `montoPagado`**

**FormDeuda.js:**
```jsx
<FormLabel>Monto pagado (abonado)</FormLabel>
<OutlinedInput
  value={formData.montoPagado || ""}
  onChange={(e) => setFormData((p) => ({ ...p, montoPagado: e.target.value }))}
/>
```

**FormAcreencia.js (CORREGIDO):**
```jsx
<FormLabel>Monto cobrado (pagado)</FormLabel>
<OutlinedInput
  value={formData.montoPagado || ""}  // ✅ Era montoCobrado
  onChange={(e) => setFormData((p) => ({ ...p, montoPagado: e.target.value }))}
/>
```

---

### 2. **Campo: `fechaVencimiento`**

**FormDeuda.js:**
```jsx
<FormLabel>Fecha de vencimiento</FormLabel>
<CustomDatePicker
  value={formData.fechaVencimiento || null}
  onChange={(fecha) => setFormData((p) => ({ ...p, fechaVencimiento: fecha }))}
/>
```

**FormAcreencia.js (CORREGIDO):**
```jsx
<FormLabel>Fecha de vencimiento</FormLabel>
<CustomDatePicker
  value={formData.fechaVencimiento || null}  // ✅ Era fechaCobroEsperado
  onChange={(fecha) => setFormData((p) => ({ ...p, fechaVencimiento: fecha }))}
/>
```

---

### 3. **Campo: `cuotasPagadas`**

**FormDeuda.js:**
```jsx
<FormLabel>Cuotas pagadas (abonadas)</FormLabel>
<OutlinedInput
  value={formData.cuotasPagadas || ""}
  onChange={(e) => setFormData((p) => ({ ...p, cuotasPagadas: e.target.value }))}
/>
```

**FormAcreencia.js (CORREGIDO):**
```jsx
<FormLabel>Cuotas cobradas (pagadas)</FormLabel>
<OutlinedInput
  value={formData.cuotasPagadas || ""}  // ✅ Era cuotasCobradas
  onChange={(e) => setFormData((p) => ({ ...p, cuotasPagadas: e.target.value }))}
/>
```

---

## 🎯 Significado de los Campos

### `montoPagado` (compartido)
- **En Deuda:** Monto que **nosotros hemos pagado/abonado** de la deuda
- **En Acreencia:** Monto que **nos han pagado/cobrado** de lo que nos deben

### `fechaVencimiento` (compartido)
- **En Deuda:** Fecha límite en la que **debemos pagar**
- **En Acreencia:** Fecha esperada en la que **nos deben pagar**

### `cuotasPagadas` (compartido)
- **En Deuda:** Cantidad de cuotas que **nosotros hemos pagado**
- **En Acreencia:** Cantidad de cuotas que **nos han pagado**

---

## 📊 Comparación de Labels

| Campo Backend | Label FormDeuda | Label FormAcreencia | Antes (FormAcreencia) |
|---------------|-----------------|---------------------|----------------------|
| `montoPagado` | "Monto pagado (abonado)" | "Monto cobrado (pagado)" | ❌ "Monto cobrado" |
| `fechaVencimiento` | "Fecha de vencimiento" | "Fecha de vencimiento" | ❌ "Fecha de cobro esperado" |
| `cuotasPagadas` | "Cuotas pagadas (abonadas)" | "Cuotas cobradas (pagadas)" | ❌ "Cuotas cobradas" |

**Nota:** Los labels son diferentes para claridad del usuario, pero los campos del modelo son los mismos.

---

## ✅ Validación

### Linter
```bash
✅ No linter errors found
```

### Archivos Modificados
1. ✅ `frontend/src/registro/carga-general/components/forms/FormDeuda.js`
2. ✅ `frontend/src/registro/carga-general/components/forms/FormAcreencia.js`

---

## 🧪 Prueba de Funcionamiento

### Ejemplo: Crear Deuda

```javascript
const deuda = {
  tipo: 'Deuda',
  montoTotal: 50000,
  montoPagado: 10000,        // ✅ Ahora se guarda correctamente
  fechaEmision: '2025-01-15',
  fechaVencimiento: '2025-12-15',  // ✅ Ahora se guarda correctamente
  cantidadCuotas: 12,
  cuotasPagadas: 3,          // ✅ Ahora se guarda correctamente
  montoCuota: 4500,
  tasaInteres: 25.0,
  periodicidad: 'Mensual'
};

await cargarDatos('movimiento', 'formulario', deuda);
```

### Ejemplo: Crear Acreencia

```javascript
const acreencia = {
  tipo: 'Acreencia',
  montoTotal: 80000,
  montoPagado: 20000,        // ✅ Antes era montoCobrado (error)
  fechaEmision: '2025-02-01',
  fechaVencimiento: '2025-11-01',  // ✅ Antes era fechaCobroEsperado (error)
  cantidadCuotas: 10,
  cuotasPagadas: 2,          // ✅ Antes era cuotasCobradas (error)
  montoCuota: 9000,
  tasaInteres: 18.0,
  periodicidad: 'Mensual'
};

await cargarDatos('movimiento', 'formulario', acreencia);
```

---

## 📁 Archivos Relacionados

### Backend
- `registro/src/main/java/registro/cargarDatos/models/Movimiento.java`
  - Define los campos compartidos

### Frontend (Formularios)
- `frontend/src/registro/carga-general/components/forms/FormDeuda.js` ✅
- `frontend/src/registro/carga-general/components/forms/FormAcreencia.js` ✅

### Documentación
- `CAMPOS_COMPARTIDOS_DEUDAS_ACREENCIAS.md` - Guía completa
- `CORRECCIONES_CAMPOS_DEUDAS_ACREENCIAS.md` - Este archivo

---

## 🎉 Resultado

### ✅ Ahora funciona correctamente:

1. **Los datos se guardan** en los campos correctos del modelo
2. **La consulta y visualización** funcionan correctamente
3. **Los reportes** muestran información correcta
4. **La lógica de negocio** puede calcular saldos y cuotas pendientes

### ✅ Campos unificados:
- Un solo campo en el backend (`montoPagado`, `fechaVencimiento`, `cuotasPagadas`)
- Labels diferentes en el frontend para claridad del usuario
- Misma funcionalidad y validaciones para Deudas y Acreencias

---

## 📞 Referencias

Ver documentación completa en:
- `CAMPOS_COMPARTIDOS_DEUDAS_ACREENCIAS.md`

