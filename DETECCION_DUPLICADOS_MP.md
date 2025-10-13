# 🔍 Detección de Duplicados en Mercado Pago

## 📋 **Resumen**

Se implementó un **sistema de detección de duplicados** para las importaciones de Mercado Pago, similar al que ya existía para Excel. Ahora, al importar pagos de Mercado Pago, el sistema detecta automáticamente si ya fueron importados anteriormente, evitando duplicación de datos.

---

## 🎯 **Problema que Resolvemos**

### **ANTES:**

Si importabas el mismo mes de Mercado Pago varias veces (por ejemplo, importaste octubre el día 15 y luego el día 31), **todos los pagos se duplicaban** en la base de datos:

```
1ra importación (15/octubre):  Pago Uber $500 ✅
2da importación (31/octubre):  Pago Uber $500 ✅ ❌ DUPLICADO
```

**Consecuencias:**

- ❌ **Datos duplicados** en BD
- ❌ **Reportes incorrectos** (suma el doble)
- ❌ **Usuario no sabía qué pagos ya importó**

---

### **AHORA:**

Al importar, el sistema **detecta automáticamente** los duplicados y los marca visualmente:

```
1ra importación (15/octubre):  Pago Uber $500 ✅ [Nuevo]
2da importación (31/octubre):  Pago Uber $500 🔴 [Registrado] ← Se marca como duplicado
```

**Usuario puede ver:**

- ✅ Qué pagos son **nuevos** (verde)
- 🔴 Qué pagos ya fueron **registrados** (rojo)
- ✅ **Elegir manualmente** si reimportar o no

---

## 🔧 **Implementación Técnica**

### **Backend (Java/Spring Boot)**

#### **1. Nuevo Servicio: `MpDuplicateDetectionService.java`**

**Ubicación:** `registro/src/main/java/registro/mercadopago/services/MpDuplicateDetectionService.java`

**Responsabilidad:**

- Detecta pagos duplicados antes de importarlos
- Usa dos estrategias de detección:
  1. **Por ID de Mercado Pago** (más confiable)
  2. **Por datos del movimiento** (fecha + monto + descripción + origen)

**Lógica:**

```java
@Service
public class MpDuplicateDetectionService {

    // Estrategia 1: Verificar por MP Payment ID
    Set<String> mpIdsExistentes = mpImportedPaymentRepository
        .findByMpPaymentIdIn(mpPaymentIds);

    // Estrategia 2: Verificar por datos del movimiento
    List<Registro> duplicadosEnBD = buscarDuplicadosEnBD(pagosParaVerificar);

    // Marcar duplicados
    if (esDuplicadoPorId || esDuplicadoPorDatos) {
        pago.setEsDuplicado(true);
        pago.setMotivoDuplicado("Este pago ya fue importado previamente");
    }
}
```

**Optimización:**

- Consulta eficiente: Busca por **conjunto de fechas** primero, luego filtra
- Evita N+1 queries

---

#### **2. Actualización de `PaymentDTO.java`**

Agregamos campos para marcar duplicados:

```java
// Campos para detección de duplicados
private Boolean esDuplicado = false;
private String motivoDuplicado;
```

---

#### **3. Actualización de `MpImportedPaymentRepository.java`**

Agregamos método para buscar por múltiples IDs:

```java
// Buscar por múltiples IDs de Mercado Pago (para detección de duplicados)
List<MpImportedPayment> findByMpPaymentIdIn(Collection<String> mpPaymentIds);
```

---

#### **4. Integración en `MpPaymentImportServiceImpl.java`**

Se agregó detección en **todos los métodos de preview**:

```java
@Override
public List<PaymentDTO> previewByMonth(Long userIdApp, int month, int year) {
    // ... obtener pagos de MP API ...

    // Detectar duplicados antes de devolver
    return duplicateDetectionService.detectarDuplicadosEnBD(previewData);
}

@Override
public List<PaymentDTO> previewByExternalReference(...) {
    // ... obtener pagos ...

    // Detectar duplicados
    return duplicateDetectionService.detectarDuplicadosEnBD(previewData);
}

@Override
public List<PaymentDTO> previewPaymentById(...) {
    // ... obtener pago ...

    // Detectar duplicados
    return duplicateDetectionService.detectarDuplicadosEnBD(previewData);
}
```

---

### **Frontend (React/JavaScript)**

#### **1. Actualización de `MpPreviewDialog.js`**

**Agregamos:**

- Contador de duplicados vs válidos
- Alertas informativas con colores

```javascript
// Contar duplicados y válidos
const duplicadosCount = previewData.filter((p) => p.esDuplicado).length;
const validosCount = previewData.length - duplicadosCount;

// Mostrar alertas
{
  duplicadosCount > 0 && (
    <Alert severity="warning">
      Se encontraron <strong>{duplicadosCount}</strong> pago(s) duplicado(s).
      Estos pagos ya fueron importados anteriormente.
    </Alert>
  );
}

<Alert severity="info">
  <strong>{validosCount}</strong> pago(s) nuevo(s) disponible(s) para importar.
</Alert>;
```

---

#### **2. Actualización de `MpPaymentsTable.js`**

**Agregamos:**

- Nueva columna "Estado"
- Chips visuales para identificar duplicados

```javascript
<TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>

// En el cuerpo de la tabla:
<TableCell>
  {r.esDuplicado ? (
    <Tooltip title={r.motivoDuplicado || "Este pago ya fue importado"}>
      <Chip
        label="Registrado"
        size="small"
        color="error"        // ← Rojo
        variant="outlined"
      />
    </Tooltip>
  ) : (
    <Chip
      label="Nuevo"
      size="small"
      color="success"         // ← Verde
      variant="outlined"
    />
  )}
</TableCell>
```

---

## 🎨 **Experiencia de Usuario**

### **Flujo Completo:**

**1. Usuario abre diálogo "Importar"**

- Selecciona mes y año (ej: Octubre 2025)

**2. Click en "Ver Vista Previa"**

- Sistema busca pagos en API de Mercado Pago
- Sistema detecta duplicados comparando con BD
- Sistema muestra preview con pagos marcados

**3. Vista Previa muestra:**

```
┌─────────────────────────────────────────────────┐
│ ⚠️  Se encontraron 3 pago(s) duplicado(s).     │
│     Estos pagos ya fueron importados.          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ℹ️  7 pago(s) nuevo(s) disponible(s) para      │
│     importar.                                   │
└─────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ Tipo │ Monto  │ Fecha    │ Descripción │ Estado    │
├──────┼────────┼──────────┼─────────────┼───────────┤
│ ✅   │ $500   │ 01/10    │ Uber        │ 🟢 Nuevo  │
│ ✅   │ $1200  │ 02/10    │ Superm.     │ 🔴 Regist.│ ← Duplicado
│ ✅   │ $350   │ 03/10    │ SUBE        │ 🟢 Nuevo  │
│ ✅   │ $2500  │ 05/10    │ Netflix     │ 🔴 Regist.│ ← Duplicado
│ ✅   │ $800   │ 10/10    │ Farmacia    │ 🟢 Nuevo  │
└───────────────────────────────────────────────────────┘
```

**4. Usuario puede:**

- ✅ Ver qué pagos son nuevos (verde) vs registrados (rojo)
- ✅ Hacer hover en "Registrado" para ver el motivo
- ✅ Deseleccionar duplicados (o dejarlos si quiere reimportar)
- ✅ Seleccionar solo los nuevos
- ✅ Importar solo los seleccionados

---

## 📊 **Comparación Visual**

### **ANTES (Sin detección de duplicados):**

```
┌──────────────────────────────────────┐
│ Todos los pagos aparecen iguales    │
│ ❌ No hay forma de saber cuáles      │
│    ya fueron importados              │
│ ❌ Usuario importa duplicados         │
│    sin darse cuenta                  │
└──────────────────────────────────────┘
```

### **AHORA (Con detección de duplicados):**

```
┌──────────────────────────────────────┐
│ 🟢 Nuevo       ← Puede importar      │
│ 🔴 Registrado  ← Ya fue importado    │
│ 🟢 Nuevo                              │
│ 🔴 Registrado                         │
│ 🟢 Nuevo                              │
└──────────────────────────────────────┘

✅ Usuario ve claramente qué importar
✅ Evita duplicados accidentales
✅ Puede elegir conscientemente
```

---

## 🛡️ **Ventajas**

### **1. Datos Limpios**

- ✅ No más pagos duplicados en BD
- ✅ Reportes precisos (no suma duplicados)

### **2. Transparencia**

- ✅ Usuario ve qué ya importó
- ✅ Puede tomar decisiones informadas

### **3. Flexibilidad**

- ✅ Usuario puede reimportar si lo desea
- ✅ Puede deseleccionar duplicados fácilmente

### **4. Consistencia**

- ✅ Misma experiencia que Excel
- ✅ Misma lógica de detección

---

## 🔍 **Criterios de Duplicado**

Un pago se considera **duplicado** si cumple alguna de estas condiciones:

### **Criterio 1: ID de Mercado Pago (más confiable)**

```
mpPaymentId ya existe en tabla mp_imported_payments
```

### **Criterio 2: Datos del movimiento (fallback)**

```
Mismo:
  - Fecha de emisión
  - Monto total
  - Descripción
  - Origen (email del payer)
```

**Nota:** La comparación de descripción y origen es **case-insensitive** y **trimmed** para mayor flexibilidad.

---

## 📝 **Casos de Uso**

### **Caso 1: Reimportar mismo mes**

**Escenario:** Usuario importó octubre el día 15, y el día 31 quiere volver a importar octubre completo.

**Resultado:**

- Pagos del 1-15: Se marcan como 🔴 Registrados
- Pagos del 16-31: Se marcan como 🟢 Nuevos
- Usuario puede deseleccionar los registrados e importar solo los nuevos

---

### **Caso 2: Pago modificado en Mercado Pago**

**Escenario:** Usuario importó un pago, pero en MP se actualizó (ej: cambió la descripción).

**Resultado:**

- Si el `mpPaymentId` es el mismo → Se marca como 🔴 Registrado
- Usuario ve que ya está importado y no lo vuelve a importar

---

### **Caso 3: Pago idéntico de diferentes fuentes**

**Escenario:** Dos pagos diferentes de MP tienen fecha, monto y descripción idénticos.

**Resultado:**

- El sistema detecta el segundo como duplicado por **Criterio 2**
- Usuario puede verificar manualmente si realmente es duplicado

---

## 🚀 **Mejoras Futuras (Opcionales)**

### **1. Filtro de duplicados en preview**

- Botón "Mostrar solo nuevos"
- Botón "Mostrar solo duplicados"
- Filtros como en Excel

### **2. Deselección automática**

- Opción para deseleccionar duplicados automáticamente
- Usuario solo revisa y confirma

### **3. Detección más inteligente**

- Considerar montos aproximados (ej: $99.99 vs $100.00)
- Fechas aproximadas (±1 día)

---

## 📚 **Referencias**

- **Servicio Backend**: `registro/src/main/java/registro/mercadopago/services/MpDuplicateDetectionService.java`
- **DTO**: `registro/src/main/java/registro/mercadopago/dtos/PaymentDTO.java`
- **Preview Dialog**: `frontend/src/consolidacion/mercado-pago/components/MpPreviewDialog.js`
- **Tabla**: `frontend/src/consolidacion/mercado-pago/components/MpPaymentsTable.js`

---

## 🎯 **Resumen para el Equipo**

> "Implementamos detección automática de duplicados para importaciones de Mercado Pago, igual que en Excel. Ahora cuando importás pagos, el sistema:
>
> 1. **Detecta automáticamente** qué pagos ya fueron importados
> 2. **Marca visualmente** los duplicados (rojo) vs nuevos (verde)
> 3. **Muestra alertas** con contadores de duplicados
> 4. **Permite elegir** qué importar (puedes deseleccionar duplicados)
>
> **Ventaja**: No más datos duplicados en BD, reportes más precisos, y el usuario tiene control total sobre qué importar."

---

**Última actualización**: 2025-10-11  
**Relacionado con**: `CATEGORIZACION_INTELIGENTE.md`, `VALIDACION_CATEGORIAS.md`
