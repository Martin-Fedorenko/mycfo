# Sistema de Carga de Datos Unificado

## Descripción General

Se ha implementado un sistema unificado para la carga de datos que permite cargar **facturas, recibos, pagarés y movimientos** mediante diferentes métodos: **formulario, Excel, voz y audio**.

## Arquitectura

### Backend

#### Endpoint Principal Unificado
```
POST /api/carga-datos
```

Este endpoint maneja todos los tipos de documentos y movimientos mediante formulario, voz o transcripción.

**Payload:**
```json
{
  "tipo": "factura|recibo|pagare|movimiento",
  "metodo": "formulario|voz|audio",
  "datos": {
    // Datos del documento/movimiento
  },
  "tipoMovimiento": "Ingreso|Egreso|Deuda|Acreencia" // Opcional
}
```

**Headers requeridos:**
- `X-Usuario-Sub`: ID del usuario
- `X-Organizacion-Id`: ID de la organización

#### Endpoints de Excel

**Preview de Excel:**
```
POST /api/carga-datos/excel/preview
```
- Parámetros: `file`, `tipo`, `tipoOrigen`
- Retorna: Vista previa de los datos a importar

**Importar Excel:**
```
POST /api/carga-datos/excel
```
- Parámetros: `file`, `tipo`, `tipoOrigen`
- Retorna: Resumen de la carga

#### Endpoint de Voz
```
POST /api/carga-datos/voz
```
- Para procesar transcripciones de voz ya procesadas
- Mismo payload que el endpoint principal

#### Endpoint de Audio
```
POST /api/carga-datos/audio
```
- Para procesar archivos de audio
- Parámetros: `file`, `tipo`
- **Estado:** En desarrollo (retorna HTTP 501 Not Implemented)

### Frontend

#### API Service

Se ha creado un servicio unificado en:
```
frontend/src/consolidacion/carga-movimientos/api/cargaDatosApi.js
```

**Funciones disponibles:**

1. **cargarDatos(tipo, metodo, datos, tipoMovimiento)**
   - Carga datos mediante formulario o voz
   - Tipos: "factura", "recibo", "pagare", "movimiento"
   - Métodos: "formulario", "voz"

2. **previewExcel(file, tipo, tipoOrigen)**
   - Obtiene preview de archivo Excel
   - Tipos de origen: "mycfo", "mercado-pago", "santander"

3. **importarExcel(file, tipo, tipoOrigen)**
   - Importa archivo Excel directamente

4. **procesarVoz(tipo, datos, tipoMovimiento)**
   - Procesa transcripción de voz

5. **procesarAudio(audioFile, tipo)**
   - Procesa archivo de audio (en desarrollo)

#### Rutas

Las rutas del frontend se mantienen con el flujo existente:
- `/carga` - Selección de tipo de documento/movimiento
- `/carga/:tipo` - Selección de método (formulario, excel, voz, audio)
- `/carga/:tipo/:modo` - Vista final de carga

## Tipos de Documentos Soportados

### 1. Facturas
- Endpoint: `/api/carga-datos` con `tipo: "factura"`
- Campos: vendedor, comprador, items, estado de pago, etc.

### 2. Recibos
- Endpoint: `/api/carga-datos` con `tipo: "recibo"`
- Campos: número, fecha, monto, etc.

### 3. Pagarés
- Endpoint: `/api/carga-datos` con `tipo: "pagare"`
- Campos: número, fecha de vencimiento, monto, etc.

### 4. Movimientos
- Endpoint: `/api/carga-datos` con `tipo: "movimiento"`
- Campos: fecha, monto, descripción, tipo de movimiento, etc.
- Tipos de movimiento: Ingreso, Egreso, Deuda, Acreencia

## Métodos de Carga

### 1. Formulario
- Método tradicional mediante interfaz web
- `metodo: "formulario"`

### 2. Excel
- Carga masiva mediante archivo Excel
- Soporta múltiples orígenes: MyCFO, Mercado Pago, Santander
- Incluye preview antes de importar

### 3. Voz
- Transcripción de comandos de voz
- `metodo: "voz"`
- La transcripción debe procesarse antes de enviar al endpoint

### 4. Audio
- Procesamiento de archivos de audio
- `metodo: "audio"`
- **Estado actual:** En desarrollo

## Ejemplo de Uso

### Cargar Factura por Formulario

```javascript
import { cargarDatos } from './api/cargaDatosApi';

const datosFactura = {
  tipoFactura: 'B',
  numeroFactura: '0001-00000123',
  fecha: '2025-10-14',
  vendedorNombre: 'Mi Empresa SRL',
  compradorNombre: 'Cliente SA',
  total: 15000,
  // ... otros campos
};

const resultado = await cargarDatos(
  'factura',
  'formulario',
  datosFactura
);
```

### Cargar Movimiento por Voz

```javascript
import { procesarVoz } from './api/cargaDatosApi';

const datosTranscripcion = {
  fecha: '2025-10-14',
  monto: 5000,
  descripcion: 'Pago de servicios',
  categoria: 'Servicios',
  // ... otros campos extraídos de la voz
};

const resultado = await procesarVoz(
  'movimiento',
  datosTranscripcion,
  'Egreso'
);
```

### Importar Excel

```javascript
import { importarExcel } from './api/cargaDatosApi';

const resultado = await importarExcel(
  archivoExcel,
  'movimiento',
  'santander'
);
```

## Migración desde el Sistema Anterior

### Endpoints Antiguos (Deprecated)
- `/facturas/formulario` → Usar `/api/carga-datos` con `tipo: "factura"`
- `/recibos/formulario` → Usar `/api/carga-datos` con `tipo: "recibo"`
- `/pagares/formulario` → Usar `/api/carga-datos` con `tipo: "pagare"`
- `/movimientos` (POST) → Usar `/api/carga-datos` con `tipo: "movimiento"`
- `/api/importar-excel` → Usar `/api/carga-datos/excel`
- `/api/preview-excel` → Usar `/api/carga-datos/excel/preview`

### Ventajas del Sistema Unificado

1. **Consistencia:** Un solo endpoint para todos los tipos
2. **Flexibilidad:** Soporta múltiples métodos de entrada
3. **Escalabilidad:** Fácil agregar nuevos tipos o métodos
4. **Mantenibilidad:** Código centralizado y reutilizable
5. **Trazabilidad:** Headers comunes para usuario y organización

## Respuestas del API

### Respuesta Exitosa
```json
{
  "exito": true,
  "mensaje": "Factura guardado exitosamente mediante formulario",
  "id": 123,
  "datos": {
    // Objeto guardado completo
  }
}
```

### Respuesta de Error
```json
{
  "exito": false,
  "mensaje": "Error al procesar la solicitud: ...",
  "id": null,
  "datos": null
}
```

## Configuración

### Variables de Entorno (Frontend)
```
REACT_APP_REGISTRO_API_URL=http://localhost:8082
```

### Headers Automáticos
El servicio frontend automáticamente incluye:
- `X-Usuario-Sub` desde `localStorage.getItem('usuario_sub')`
- `X-Organizacion-Id` desde `localStorage.getItem('organizacion_id')`

## Pendientes y Mejoras Futuras

1. ✅ Endpoint unificado implementado
2. ✅ Soporte para formulario, voz y Excel
3. ⏳ Servicio de transcripción de audio (en desarrollo)
4. ⏳ Validaciones avanzadas según tipo de documento
5. ⏳ Procesamiento de imágenes de facturas (OCR)
6. ⏳ Integración con IA para extracción de datos

## Notas Técnicas

- El controlador usa `ObjectMapper` para conversión flexible de datos
- Los servicios existentes se mantienen (FacturaService, ReciboService, etc.)
- La estructura de datos de cada tipo se conserva
- Compatible con el sistema de notificaciones existente

