# Ejemplos de Uso - Sistema de Carga Unificado

## 📚 Guía Práctica de Implementación

Este documento contiene ejemplos prácticos de cómo usar el nuevo sistema unificado de carga de datos.

---

## 🎯 Caso 1: Cargar Factura desde Formulario Web

### Frontend (React)

```javascript
import { cargarDatos } from '../api/cargaDatosApi';
import { useState } from 'react';

function FormularioFactura() {
  const [factura, setFactura] = useState({
    tipoFactura: 'B',
    numeroFactura: '',
    fecha: '',
    vendedorNombre: '',
    compradorNombre: '',
    total: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const resultado = await cargarDatos(
        'factura',           // tipo
        'formulario',        // metodo
        factura             // datos
      );
      
      if (resultado.exito) {
        alert(`Factura guardada con ID: ${resultado.id}`);
        // Resetear formulario o redirigir
      }
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button type="submit">Guardar Factura</button>
    </form>
  );
}
```

---

## 💰 Caso 2: Cargar Movimiento (Ingreso/Egreso)

### Frontend

```javascript
import { cargarDatos } from '../api/cargaDatosApi';

async function guardarMovimiento(tipo) {
  const datosMovimiento = {
    fecha: '2025-10-14',
    monto: 25000,
    descripcion: 'Venta de producto',
    categoria: 'Ventas',
    subcategoria: 'Productos',
    medioPago: 'TRANSFERENCIA',
    moneda: 'ARS'
  };

  const resultado = await cargarDatos(
    'movimiento',     // tipo
    'formulario',     // metodo
    datosMovimiento,  // datos
    'Ingreso'         // tipoMovimiento (Ingreso, Egreso, Deuda, Acreencia)
  );

  return resultado;
}

// Uso:
await guardarMovimiento('Ingreso');
```

---

## 📊 Caso 3: Importar Excel de Banco

### Frontend

```javascript
import { previewExcel, importarExcel } from '../api/cargaDatosApi';

function ImportadorExcel() {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    
    // Mostrar preview
    const previewData = await previewExcel(
      file,
      'movimiento',    // tipo
      'santander'      // tipoOrigen: 'mycfo', 'mercado-pago', 'santander'
    );
    
    setPreview(previewData);
  };

  const handleImport = async () => {
    const resultado = await importarExcel(
      archivo,
      'movimiento',
      'santander'
    );
    
    console.log(`Importados: ${resultado.correctos}/${resultado.total}`);
    if (resultado.errores.length > 0) {
      console.error('Errores:', resultado.errores);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".xlsx,.xls" />
      
      {preview && (
        <div>
          <h3>Preview ({preview.totalRegistros} registros)</h3>
          {/* Mostrar tabla de preview */}
          <button onClick={handleImport}>Confirmar Importación</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🎤 Caso 4: Cargar Movimiento por Voz

### Frontend con Reconocimiento de Voz

```javascript
import { procesarVoz } from '../api/cargaDatosApi';

function CargaPorVoz() {
  const [transcripcion, setTranscripcion] = useState('');

  const iniciarGrabacion = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'es-AR';
    
    recognition.onresult = async (event) => {
      const texto = event.results[0][0].transcript;
      setTranscripcion(texto);
      
      // Procesar texto y extraer datos
      const datos = extraerDatosDeTexto(texto);
      
      // Enviar al backend
      const resultado = await procesarVoz(
        'movimiento',
        datos,
        'Egreso'
      );
      
      if (resultado.exito) {
        alert('Movimiento guardado por voz!');
      }
    };
    
    recognition.start();
  };

  function extraerDatosDeTexto(texto) {
    // Ejemplo: "Pago de luz por 5000 pesos el 14 de octubre"
    // Usar regex o NLP para extraer:
    return {
      descripcion: 'Pago de luz',
      monto: 5000,
      fecha: '2025-10-14',
      categoria: 'Servicios'
    };
  }

  return (
    <div>
      <button onClick={iniciarGrabacion}>🎤 Grabar Movimiento</button>
      {transcripcion && <p>Transcripción: {transcripcion}</p>}
    </div>
  );
}
```

---

## 📄 Caso 5: Cargar Recibo

### Frontend

```javascript
import { cargarDatos } from '../api/cargaDatosApi';

async function guardarRecibo() {
  const datosRecibo = {
    numeroRecibo: '0001-00001234',
    fecha: '2025-10-14',
    monto: 15000,
    emisor: 'Mi Empresa SRL',
    receptor: 'Cliente XYZ',
    concepto: 'Pago parcial factura 123',
    facturaId: 123  // Relación con factura
  };

  const resultado = await cargarDatos(
    'recibo',       // tipo
    'formulario',   // metodo
    datosRecibo     // datos
  );

  return resultado;
}
```

---

## 💳 Caso 6: Cargar Pagaré

### Frontend

```javascript
import { cargarDatos } from '../api/cargaDatosApi';

async function guardarPagare() {
  const datosPagare = {
    numeroPagare: 'PG-2025-001',
    fechaEmision: '2025-10-14',
    fechaVencimiento: '2025-11-14',
    monto: 50000,
    librador: 'Empresa ABC SA',
    beneficiario: 'Proveedor XYZ SRL',
    lugarPago: 'Buenos Aires',
    facturaId: 456  // Relación con factura
  };

  const resultado = await cargarDatos(
    'pagare',       // tipo
    'formulario',   // metodo
    datosPagare     // datos
  );

  return resultado;
}
```

---

## 🔄 Caso 7: Componente Reutilizable

### Componente Universal de Carga

```javascript
import { cargarDatos } from '../api/cargaDatosApi';

function CargaUniversal({ tipo, metodo, onSuccess }) {
  const [datos, setDatos] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const tipoMovimiento = datos.tipoMovimiento || null;
      const resultado = await cargarDatos(tipo, metodo, datos, tipoMovimiento);
      
      if (resultado.exito && onSuccess) {
        onSuccess(resultado);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Cargar {tipo} por {metodo}</h2>
      {/* Formulario dinámico según tipo */}
      <FormularioDinamico 
        tipo={tipo} 
        datos={datos} 
        onChange={setDatos} 
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}

// Uso:
<CargaUniversal 
  tipo="factura" 
  metodo="formulario" 
  onSuccess={(res) => console.log('Guardado:', res.id)}
/>
```

---

## 🧪 Caso 8: Prueba Manual con cURL

### Cargar Factura

```bash
curl -X POST http://localhost:8082/api/carga-datos \
  -H "Content-Type: application/json" \
  -H "X-Usuario-Sub: usuario-123" \
  -H "X-Organizacion-Id: 1" \
  -d '{
    "tipo": "factura",
    "metodo": "formulario",
    "datos": {
      "tipoFactura": "B",
      "numeroFactura": "0001-00000123",
      "fecha": "2025-10-14",
      "vendedorNombre": "Mi Empresa",
      "compradorNombre": "Cliente SA",
      "total": 15000
    }
  }'
```

### Cargar Movimiento

```bash
curl -X POST http://localhost:8082/api/carga-datos \
  -H "Content-Type: application/json" \
  -H "X-Usuario-Sub: usuario-123" \
  -H "X-Organizacion-Id: 1" \
  -d '{
    "tipo": "movimiento",
    "metodo": "formulario",
    "datos": {
      "fecha": "2025-10-14",
      "monto": 5000,
      "descripcion": "Pago de servicios",
      "categoria": "Servicios"
    },
    "tipoMovimiento": "Egreso"
  }'
```

### Importar Excel

```bash
curl -X POST http://localhost:8082/api/carga-datos/excel \
  -H "X-Usuario-Sub: usuario-123" \
  -H "X-Organizacion-Id: 1" \
  -F "file=@movimientos.xlsx" \
  -F "tipo=movimiento" \
  -F "tipoOrigen=santander"
```

---

## 🔧 Caso 9: Configuración del Frontend

### Configurar Variables de Entorno

```env
# .env
REACT_APP_REGISTRO_API_URL=http://localhost:8082
```

### Configurar LocalStorage

```javascript
// En el login o después de autenticar
localStorage.setItem('usuario_sub', 'usuario-123-abc');
localStorage.setItem('organizacion_id', '1');
```

---

## 🎨 Caso 10: Integración con Flujo Existente

### Actualizar Componente Existente

```javascript
// ANTES:
import axios from 'axios';

const guardarFactura = async (factura) => {
  const response = await axios.post('/facturas/formulario', factura);
  return response.data;
};

// AHORA:
import { cargarDatos } from '../api/cargaDatosApi';

const guardarFactura = async (factura) => {
  const resultado = await cargarDatos('factura', 'formulario', factura);
  return resultado;
};
```

---

## 📱 Caso 11: Manejo de Errores

```javascript
import { cargarDatos } from '../api/cargaDatosApi';

async function guardarConManejodeErrores(tipo, metodo, datos) {
  try {
    const resultado = await cargarDatos(tipo, metodo, datos);
    
    if (resultado.exito) {
      // Éxito
      return {
        success: true,
        id: resultado.id,
        mensaje: resultado.mensaje
      };
    } else {
      // Error del negocio
      return {
        success: false,
        error: resultado.mensaje
      };
    }
  } catch (error) {
    // Error de red o servidor
    if (error.response) {
      // El servidor respondió con un código de error
      return {
        success: false,
        error: error.response.data.mensaje || 'Error del servidor'
      };
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return {
        success: false,
        error: 'No hay respuesta del servidor'
      };
    } else {
      // Error al configurar la petición
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

---

## ✅ Checklist de Implementación

- [ ] Configurar variable de entorno `REACT_APP_REGISTRO_API_URL`
- [ ] Importar el servicio `cargaDatosApi.js`
- [ ] Reemplazar llamadas antiguas a endpoints específicos
- [ ] Agregar headers de usuario y organización al localStorage
- [ ] Probar cada tipo: factura, recibo, pagaré, movimiento
- [ ] Probar cada método: formulario, Excel, voz
- [ ] Implementar manejo de errores
- [ ] Agregar feedback visual al usuario (loading, éxito, error)

---

## 🚀 Próximos Pasos

1. **Audio:** Implementar servicio de transcripción
2. **OCR:** Agregar reconocimiento de facturas en imagen
3. **IA:** Extracción inteligente de datos
4. **Validaciones:** Agregar validaciones específicas por tipo
5. **Historial:** Dashboard de cargas realizadas

---

## 📞 ¿Necesitas Ayuda?

Consulta la documentación completa en:
- `SISTEMA_CARGA_UNIFICADO.md` - Documentación técnica
- `ENDPOINTS_UNIFICADOS.md` - Referencia de endpoints

