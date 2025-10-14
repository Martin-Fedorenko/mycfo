# 🚀 Refactorización Completa: Registro → Movimiento

## Fecha: 13 de Octubre, 2025

---

## ✅ Cambios Completados

### 1. **Modelos Unificados**
- ✅ Creado `Movimiento.java` (antes `Registro.java`)
- ✅ Creado `TipoMovimiento.java` (antes `TipoRegistro.java`)
- ✅ Creado `EstadoMovimiento.java` (enum unificado)
- ✅ **Eliminadas** todas las clases hijas:
  - `Ingreso.java`
  - `Egreso.java`
  - `Deuda.java`
  - `Acreencia.java`
  - `EstadoDeuda.java`
  - `EstadoAcreencia.java`

### 2. **Repositorios**
- ✅ Creado `MovimientoRepository.java`
- ✅ **Eliminados** todos los repos específicos:
  - `IngresoRepository.java`
  - `EgresoRepository.java`
  - `DeudaRepository.java`
  - `AcreenciaRepository.java`
  - `RegistroRepository.java`

### 3. **Servicios**
- ✅ Creado `MovimientoService.java` (servicio unificado)
- ✅ Creado `MovimientoEventService.java` (antes `RegistroEventService`)
- ✅ Actualizado `MovimientoQueryService.java`
- ✅ Actualizado `ConciliacionService.java`
- ✅ **Eliminados** todos los servicios específicos:
  - `IngresoService.java`
  - `EgresoService.java`
  - `DeudaService.java`
  - `AcreenciaService.java`
  - `RegistroService.java`

### 4. **Controladores**
- ✅ Creado `MovimientoController.java` (controlador unificado)
- ✅ Actualizado `MovimientoQueryController.java`
- ✅ **Eliminados** todos los controladores específicos:
  - `IngresoController.java`
  - `EgresoController.java`
  - `DeudaController.java`
  - `AcreenciaController.java`
  - `RegistroController.java`

### 5. **DTOs Actualizados**
- ✅ `MovimientoDTO.java` - usa `TipoMovimiento`

---

## 🔄 Archivos Pendientes de Actualizar

### Backend (Java)
Estos archivos aún tienen referencias a `Registro` o `TipoRegistro` y necesitan actualizarse:

1. **Excel Import:**
   - `ExcelImportService.java`
   - `ExcelImportController.java`
   - `RegistroPreviewDTO.java`

2. **Mercado Pago:**
   - `MpPaymentImportServiceImpl.java`
   - `MpController.java`
   - `MpImportedPayment.java`
   - `MpDuplicateDetectionService.java`

3. **Duplicate Detection:**
   - `DuplicateDetectionService.java`

4. **Notificaciones:**
   - `NotificationsEventPublisher.java`

5. **Categorización:**
   - `CategorySuggestionService.java`

---

## 📝 Nuevos Endpoints

### Movimiento Controller (`/movimientos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/movimientos` | Crear movimiento |
| GET | `/movimientos` | Listar todos |
| GET | `/movimientos/organizacion/{id}` | Por organización |
| GET | `/movimientos/tipo/{tipo}` | Por tipo |
| GET | `/movimientos/tipo/{tipo}/organizacion/{id}` | Por tipo y org |
| GET | `/movimientos/{id}` | Obtener uno |
| PUT | `/movimientos/{id}` | Actualizar |
| DELETE | `/movimientos/{id}` | Eliminar |

### Notas:
- Los headers `X-Usuario-Sub` y `X-Organizacion-Id` se establecen automáticamente
- El estado se establece automáticamente según el tipo:
  - `Ingreso` → `COBRADO`
  - `Egreso` → `PAGADO`
  - `Deuda` / `Acreencia` → `PENDIENTE` (modificable)

---

## 🎯 Cambios en Frontend Necesarios

### 1. **Actualizar Endpoints en CargaFormulario.js**
Cambiar de:
```javascript
/ingresos, /egresos, /deudas, /acreencias
```

A:
```javascript
/movimientos (con campo "tipo": "Ingreso"/"Egreso"/"Deuda"/"Acreencia")
```

### 2. **Actualizar Endpoints en CargaGeneral.js**
```javascript
const endpointMap = {
  Ingreso: "/movimientos",
  Egreso: "/movimientos",
  Deuda: "/movimientos",
  Acreencia: "/movimientos"
};
```

### 3. **Actualizar TablaRegistrosV2.js**
```javascript
// Cambiar endpoint
const response = await axios.get(`${API_BASE}/movimientos`, { params });
```

### 4. **Actualizar todas las referencias a `TipoRegistro`**
Cambiar a `TipoMovimiento` en:
- Formularios
- DTOs
- Tipos TypeScript/PropTypes

---

## 🔧 Estados del Movimiento

### Enum `EstadoMovimiento`
```java
COBRADO    // Ingresos y Acreencias cobradas
PAGADO     // Egresos y Deudas pagadas
PENDIENTE  // Deudas y Acreencias pendientes
VENCIDO    // Deudas y Acreencias vencidas
PARCIAL    // Pagos/cobros parciales
CANCELADO  // Movimientos cancelados
```

---

## 📊 Estructura de la Tabla `registro`

### Tabla Unificada
- **Nombre físico:** `registro` (mantiene compatibilidad con BD existente)
- **Clase Java:** `Movimiento`
- **Todos los campos en una sola tabla**
- Los campos específicos son `null` para tipos que no los usan

### Campos Específicos por Tipo:

**Para Deudas/Acreencias:**
- `fechaVencimiento`
- `montoPagado` / `montoCobrado`
- `cantidadCuotas`
- `cuotasPagadas` / `cuotasCobradas`
- `tasaInteres`
- `montoCuota`
- `periodicidad`

**Para Ingresos/Egresos:**
- Todos estos campos quedan en `null`

---

## 🧪 Testing Recomendado

1. ✅ Crear movimiento tipo Ingreso → verificar estado COBRADO
2. ✅ Crear movimiento tipo Egreso → verificar estado PAGADO
3. ✅ Crear movimiento tipo Deuda → verificar estado PENDIENTE
4. ✅ Crear movimiento tipo Acreencia → verificar estado PENDIENTE
5. ✅ Listar movimientos por organización
6. ✅ Listar movimientos por tipo
7. ✅ Actualizar un movimiento
8. ✅ Eliminar un movimiento
9. ✅ Filtrar movimientos con MovimientoQueryController

---

## ⚠️ Importante

### Migración de Datos
Si ya tienes datos en BD con las tablas antiguas (`ingreso`, `egreso`, `deuda`, `acreencia`):

**Opción 1:** Consolidar en `registro`
```sql
-- Migrar ingresos
INSERT INTO registro (tipo, montoTotal, fechaEmision, ...)
SELECT 'Ingreso', montoTotal, fechaEmision, ...
FROM ingreso;

-- Repetir para egreso, deuda, acreencia
```

**Opción 2:** Mantener compatibilidad temporal
- Mantener las tablas antiguas
- Crear un script de migración gradual

---

## 🚀 Próximos Pasos

1. **Backend:**
   - [ ] Actualizar archivos de Excel Import
   - [ ] Actualizar archivos de Mercado Pago
   - [ ] Actualizar Duplicate Detection
   - [ ] Actualizar Notifications

2. **Frontend:**
   - [ ] Actualizar todos los endpoints
   - [ ] Cambiar TipoRegistro por TipoMovimiento
   - [ ] Probar flujo completo de creación
   - [ ] Probar tabla de movimientos
   - [ ] Probar conciliación

3. **Base de Datos:**
   - [ ] Decidir estrategia de migración
   - [ ] Ejecutar scripts de migración
   - [ ] Validar integridad de datos

---

**Documentado por:** AI Assistant  
**Fecha:** 13 de Octubre, 2025

