# Endpoints Unificados - Sistema de Carga de Datos

## 📋 Resumen de Cambios

Se ha unificado el sistema de carga de datos para que **un solo endpoint** maneje todos los tipos de documentos (facturas, recibos, pagarés, movimientos) mediante cualquier método (formulario, voz, audio, Excel).

---

## 🔄 Antes vs Ahora

### ❌ ANTES (Múltiples endpoints)

```
POST /facturas/formulario          → Para facturas
POST /recibos/formulario           → Para recibos  
POST /pagares/formulario           → Para pagarés
POST /movimientos                  → Para movimientos
POST /api/importar-excel           → Para Excel
POST /api/preview-excel            → Para preview
```

### ✅ AHORA (Endpoint unificado)

```
POST /api/carga-datos                    → Formulario/Voz para TODOS
POST /api/carga-datos/excel             → Excel para TODOS
POST /api/carga-datos/excel/preview     → Preview Excel
POST /api/carga-datos/voz               → Voz específico
POST /api/carga-datos/audio             → Audio (en desarrollo)
```

---

## 🎯 Endpoint Principal

### `POST /api/carga-datos`

**Tipos soportados:** `factura`, `recibo`, `pagare`, `movimiento`  
**Métodos soportados:** `formulario`, `voz`, `audio`

#### Request

```json
{
  "tipo": "factura|recibo|pagare|movimiento",
  "metodo": "formulario|voz|audio",
  "datos": {
    // Campos específicos del tipo
  },
  "tipoMovimiento": "Ingreso|Egreso|Deuda|Acreencia" // Solo para movimientos
}
```

#### Headers
```
X-Usuario-Sub: {usuario_id}
X-Organizacion-Id: {organizacion_id}
```

#### Response
```json
{
  "exito": true,
  "mensaje": "Factura guardado exitosamente mediante formulario",
  "id": 123,
  "datos": { /* objeto guardado */ }
}
```

---

## 📊 Endpoint Excel

### `POST /api/carga-datos/excel/preview`

Obtiene una vista previa de los datos del Excel antes de importar.

**Query Params:**
- `file`: Archivo Excel (multipart)
- `tipo`: `factura` | `movimiento` (default: `movimiento`)
- `tipoOrigen`: `mycfo` | `mercado-pago` | `santander` (default: `mycfo`)

**Response:**
```json
{
  "registros": [
    { /* preview del registro 1 */ },
    { /* preview del registro 2 */ }
  ],
  "totalRegistros": 100,
  "columnas": ["fecha", "monto", "descripcion"]
}
```

### `POST /api/carga-datos/excel`

Importa el Excel directamente sin preview.

**Query Params:** (iguales que preview)

**Response:**
```json
{
  "total": 100,
  "correctos": 98,
  "errores": [
    { "fila": 15, "error": "Fecha inválida" }
  ]
}
```

---

## 🎤 Endpoint Voz

### `POST /api/carga-datos/voz`

Procesa datos provenientes de transcripción de voz.

**Request:** (igual que `/api/carga-datos` pero con `metodo: "voz"`)

---

## 🔊 Endpoint Audio

### `POST /api/carga-datos/audio`

⚠️ **Estado:** En desarrollo (HTTP 501 Not Implemented)

Procesará archivos de audio para extraer datos automáticamente.

**Query Params:**
- `file`: Archivo de audio
- `tipo`: Tipo de documento a crear

---

## 📱 Uso en Frontend

### Importar el servicio

```javascript
import { 
  cargarDatos, 
  importarExcel, 
  previewExcel,
  procesarVoz,
  procesarAudio 
} from './api/cargaDatosApi';
```

### Ejemplos

#### 1. Cargar Factura por Formulario

```javascript
const datos = {
  tipoFactura: 'B',
  numeroFactura: '0001-00000123',
  fecha: '2025-10-14',
  vendedorNombre: 'Mi Empresa',
  compradorNombre: 'Cliente SA',
  total: 15000
};

const resultado = await cargarDatos('factura', 'formulario', datos);
```

#### 2. Cargar Movimiento por Voz

```javascript
const datosVoz = {
  fecha: '2025-10-14',
  monto: 5000,
  descripcion: 'Pago de luz',
  categoria: 'Servicios'
};

const resultado = await procesarVoz('movimiento', datosVoz, 'Egreso');
```

#### 3. Importar Excel

```javascript
// Preview primero
const preview = await previewExcel(archivoExcel, 'movimiento', 'santander');

// Luego importar
const resultado = await importarExcel(archivoExcel, 'movimiento', 'santander');
```

---

## 🔀 Flujo de Carga

```
1. Usuario selecciona TIPO
   └─ Factura / Recibo / Pagaré / Movimiento
   
2. Usuario selecciona MÉTODO  
   ├─ Formulario → Completa campos → POST /api/carga-datos
   ├─ Excel → Sube archivo → POST /api/carga-datos/excel
   ├─ Voz → Habla → Transcribe → POST /api/carga-datos/voz
   └─ Audio → Graba → POST /api/carga-datos/audio (pendiente)

3. Backend procesa según tipo y método

4. Respuesta unificada
```

---

## 🗺️ Rutas Frontend

```
/carga                    → Selección de tipo
/carga/:tipo             → Selección de método  
/carga/:tipo/:modo       → Vista final de carga
```

**Tipos válidos:** `factura`, `recibo`, `pagare`, `movimiento`  
**Modos válidos:** `formulario`, `excel`, `voz`, `audio`

---

## ✅ Ventajas del Sistema Unificado

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Endpoints** | 6+ separados | 1 principal + 4 especializados |
| **Consistencia** | Cada uno diferente | Estructura uniforme |
| **Mantenimiento** | Código duplicado | Lógica centralizada |
| **Métodos** | Solo formulario/Excel | Formulario/Excel/Voz/Audio |
| **Escalabilidad** | Difícil agregar tipos | Fácil agregar tipos |
| **Frontend** | APIs diferentes | API única reutilizable |

---

## 🔧 Configuración Necesaria

### Backend
- Controlador: `CargaDatosController.java`
- DTOs: `CargaDatosRequest.java`, `CargaDatosResponse.java`
- Servicios existentes se reutilizan

### Frontend
- API: `frontend/src/consolidacion/carga-movimientos/api/cargaDatosApi.js`
- Variable de entorno: `REACT_APP_REGISTRO_API_URL`
- LocalStorage: `usuario_sub`, `organizacion_id`

---

## 📝 Notas Importantes

1. ✅ **Compatible con código existente** - Los servicios antiguos siguen funcionando
2. ✅ **Headers automáticos** - Usuario y organización se envían automáticamente
3. ✅ **Validación por tipo** - Cada tipo mantiene sus validaciones
4. ⚠️ **Audio en desarrollo** - Retorna 501 por ahora
5. 📋 **Logs centralizados** - Más fácil de debuggear

---

## 🚀 Próximos Pasos

- [ ] Implementar servicio de transcripción de audio
- [ ] Agregar OCR para imágenes de facturas
- [ ] Integrar IA para extracción inteligente de datos
- [ ] Agregar validaciones avanzadas según tipo
- [ ] Dashboard de métricas de carga

---

## 📞 Soporte

Para más detalles, ver: `SISTEMA_CARGA_UNIFICADO.md`

