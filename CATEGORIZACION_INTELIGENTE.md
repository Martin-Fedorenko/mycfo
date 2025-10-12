# 🎯 Sistema de Categorización Inteligente de Movimientos

## 📋 Resumen

Se ha implementado un **sistema de categorización inteligente** que sugiere automáticamente categorías precisas para movimientos bancarios basándose en:

- **Descripción del movimiento**
- **Tipo de registro** (Ingreso/Egreso)
- **Patrones múltiples con prioridades**

## ✨ Características Principales

### 1. **Motor de Categorización Inteligente**

- **200+ patrones de búsqueda** organizados por categoría
- **Sistema de prioridades** (10 = muy específico, 5 = genérico)
- **Análisis contextual** según tipo de movimiento
- **Regex optimizado** para búsquedas rápidas

### 2. **Categorías Unificadas**

#### 📉 **EGRESOS** (12 categorías):

1. 🍕 **Alimentos y Bebidas** - Restaurantes, supermercados, delivery
2. 🚗 **Transporte** - Uber, SUBE, combustible, peajes
3. 🏠 **Vivienda** - Alquiler, expensas, reparaciones
4. 💡 **Servicios Básicos** - Luz, gas, agua, internet
5. 🎮 **Ocio y Entretenimiento** - Netflix, Spotify, cine, gimnasio
6. 👕 **Compras Personales** - Ropa, tecnología, accesorios
7. 💊 **Salud** - Farmacias, médicos, prepagas
8. 📚 **Educación** - Cursos, libros, universidades
9. 💼 **Impuestos y Tasas** - AFIP, ABL, ARBA
10. 🏦 **Servicios Financieros** - Comisiones, tarjetas
11. 📦 **Compras de Negocio** - Insumos, equipamiento
12. 💰 **Otros Egresos**

#### 📈 **INGRESOS** (6 categorías):

1. 💵 **Ventas de Productos**
2. 🛠️ **Prestación de Servicios**
3. 💳 **Cobranzas**
4. 🏦 **Transferencias Recibidas**
5. 📈 **Inversiones y Rendimientos**
6. 💰 **Otros Ingresos**

## 🔧 Implementación Técnica

### **Backend (Java/Spring Boot)**

#### Archivo Principal:

`registro/src/main/java/registro/movimientosexcel/services/CategorySuggestionService.java`

**Características:**

- Método principal: `sugerirCategoria(String descripcion, TipoRegistro tipo)`
- Sistema de patrones con regex optimizados
- Búsqueda por prioridad (devuelve la coincidencia más específica)
- Endpoints REST para obtener categorías

#### Integraciones:

1. **Importación de Excel (MYCFO y MercadoPago)**

   - Archivo: `ExcelImportService.java`
   - Se sugiere categoría en el preview antes de importar
   - Usuario puede modificar la categoría sugerida

2. **Importación vía API de Mercado Pago**

   - Archivo: `MpPaymentImportServiceImpl.java`
   - Categorización automática al importar pagos
   - Se usa descripción + tipo de movimiento

3. **Endpoint REST**
   ```
   GET /api/categorias?tipo={Ingreso|Egreso}
   ```
   - Devuelve las categorías según el tipo
   - Sin parámetro devuelve todas las categorías

### **Frontend (React/JavaScript)**

#### Archivo Central:

`frontend/src/shared-components/categorias.js`

**Funciones:**

- `obtenerCategorias(tipo)` - Obtiene categorías según tipo
- `TODAS_LAS_CATEGORIAS` - Constante con todas las categorías
- `CATEGORIAS_EGRESO` - Categorías de egresos
- `CATEGORIAS_INGRESO` - Categorías de ingresos

#### Formularios Actualizados:

1. **Carga Manual**: `registro/carga-manual/CargaManual.js`
2. **Formulario Registro**: `registro/carga-general/components/forms/FormRegistro.js`
3. **Formulario Factura**: `registro/carga-general/components/forms/FormFactura.js`
4. **Formulario Pagaré**: `registro/carga-general/components/forms/FormPagare.js`
5. **Filtros**: `registro/movimientos-cargados/components/Filtros.js`

## 📊 Ejemplos de Categorización

### Egresos:

| Descripción                | Categoría Sugerida     |
| -------------------------- | ---------------------- |
| "Uber - Viaje a casa"      | Transporte             |
| "SUBE - Recarga"           | Transporte             |
| "YPF - Nafta"              | Transporte             |
| "Pedidos Ya - Pizza"       | Alimentos y Bebidas    |
| "Netflix - Suscripción"    | Ocio y Entretenimiento |
| "Farmacity - Medicamentos" | Salud                  |
| "AFIP - Monotributo"       | Impuestos y Tasas      |

### Ingresos:

| Descripción                | Categoría Sugerida         |
| -------------------------- | -------------------------- |
| "Venta producto X"         | Ventas de Productos        |
| "Honorarios profesionales" | Prestación de Servicios    |
| "Cobro factura 123"        | Cobranzas                  |
| "Transferencia cliente"    | Transferencias Recibidas   |
| "Rendimiento plazo fijo"   | Inversiones y Rendimientos |

## 🎯 Ventajas del Sistema

### 1. **Precisión Mejorada**

- Antes: Categoría fija "Ocio" para todo Mercado Pago
- Ahora: Categoría específica según descripción (Uber → Transporte, Netflix → Ocio, etc.)

### 2. **Consistencia**

- Categorías unificadas en toda la aplicación
- Mismas categorías en Excel, Mercado Pago, y carga manual
- Frontend y backend sincronizados

### 3. **Flexibilidad**

- Usuario puede modificar la categoría sugerida
- Sistema de prioridades permite agregar nuevos patrones fácilmente
- Extensible para agregar más categorías

### 4. **Experiencia de Usuario**

- Sugerencias automáticas inteligentes
- Reduce trabajo manual de categorización
- Mejora la calidad de los reportes

## 🚀 Cómo Funciona

### 1. **Flujo de Importación de Excel**

```
Usuario sube Excel
    ↓
Sistema analiza cada fila
    ↓
Para cada movimiento:
  - Determina tipo (Ingreso/Egreso)
  - Analiza descripción
  - Busca patrones coincidentes
  - Sugiere categoría más específica
    ↓
Usuario ve preview con categorías sugeridas
    ↓
Usuario puede modificar categorías
    ↓
Usuario confirma e importa
```

### 2. **Flujo de Mercado Pago**

```
Usuario importa mes de Mercado Pago
    ↓
Sistema obtiene pagos de API
    ↓
Para cada pago:
  - Clasifica Ingreso/Egreso (payer vs collector)
  - Analiza descripción
  - Sugiere categoría
  - Guarda en BD con categoría sugerida
    ↓
Usuario puede modificar categoría desde tabla
```

## 🔮 Mejoras Futuras (Fase 2)

### 1. **Aprendizaje Basado en Histórico**

- Analizar categorías asignadas manualmente por el usuario
- Aprender preferencias del usuario
- Mejorar sugerencias basadas en historial

### 2. **Análisis de Monto**

- Rangos de monto típicos por categoría
- Detección de anomalías (ej: "Uber" pero monto muy alto)

### 3. **Análisis de Frecuencia**

- Pagos recurrentes (Netflix, gym, etc.)
- Auto-categorización de suscripciones

### 4. **Machine Learning**

- Modelo entrenado con datos históricos
- Clasificación probabilística
- Mejora continua con feedback del usuario

## 📝 Notas Técnicas

### **Consideraciones de Rendimiento**

- Patrones compilados una sola vez al inicializar el servicio
- Búsqueda optimizada con regex
- Complejidad: O(n) donde n = cantidad de categorías

### **Mantenibilidad**

- Patrones centralizados en `CategorySuggestionService`
- Fácil agregar nuevas categorías o patrones
- Separación clara entre lógica de negocio y presentación

### **Extensibilidad**

- Método `sugerirCategoria()` puede recibir contexto adicional en el futuro
- Sistema de prioridades permite refinamiento sin romper funcionamiento existente
- Categorías exportables desde backend vía API REST

## ✅ Testing

### **Casos de Prueba Recomendados**

1. **Excel MYCFO**: Subir archivo con descripciones variadas
2. **Excel Mercado Pago**: Importar reporte financiero
3. **Mercado Pago API**: Importar mes con Uber, SUBE, Netflix, etc.
4. **Modificación manual**: Cambiar categoría y verificar persistencia
5. **Filtros**: Verificar que las nuevas categorías aparecen en filtros

### **Validaciones**

- [x] Categorías sugeridas correctamente según tipo
- [x] Usuario puede modificar categoría sugerida
- [x] Categorías persistidas correctamente en BD
- [x] Frontend muestra categorías unificadas
- [x] Preview de Excel muestra categorías sugeridas
- [x] Mercado Pago API usa categorías inteligentes

## 📚 Referencias

- **Archivo Backend Principal**: `registro/src/main/java/registro/movimientosexcel/services/CategorySuggestionService.java`
- **Archivo Frontend Principal**: `frontend/src/shared-components/categorias.js`
- **Endpoint REST**: `GET /api/categorias?tipo={Ingreso|Egreso}`

---

**Última actualización**: 2025-10-11
**Versión**: 1.0
