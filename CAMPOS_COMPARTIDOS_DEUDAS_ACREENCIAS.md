# Campos Compartidos: Deudas y Acreencias

## 📋 Descripción

Los movimientos de tipo **Deuda** y **Acreencia** comparten los mismos campos en el modelo de datos. Estos campos se interpretan según el contexto del tipo de movimiento.

---

## 🔄 Campos Compartidos

### 1. **`montoPagado`** (Double)

**Significado según tipo:**
- **Deuda:** Monto que **nosotros hemos pagado/abonado** de la deuda
- **Acreencia:** Monto que **nos han pagado/cobrado** de lo que nos deben

**Ejemplo:**
```java
// Deuda de $10,000 - hemos pagado $3,000
movimiento.tipo = TipoMovimiento.Deuda;
movimiento.montoTotal = 10000.0;
movimiento.montoPagado = 3000.0; // Lo que YO pagué

// Acreencia de $10,000 - nos han pagado $3,000
movimiento.tipo = TipoMovimiento.Acreencia;
movimiento.montoTotal = 10000.0;
movimiento.montoPagado = 3000.0; // Lo que ME pagaron
```

---

### 2. **`fechaVencimiento`** (LocalDate)

**Significado según tipo:**
- **Deuda:** Fecha límite en la que **debemos pagar**
- **Acreencia:** Fecha esperada en la que **nos deben pagar**

**Ejemplo:**
```java
// Deuda que vence el 30/11/2025
movimiento.tipo = TipoMovimiento.Deuda;
movimiento.fechaVencimiento = LocalDate.of(2025, 11, 30); // Fecha límite para pagar

// Acreencia que vence el 30/11/2025
movimiento.tipo = TipoMovimiento.Acreencia;
movimiento.fechaVencimiento = LocalDate.of(2025, 11, 30); // Fecha esperada de cobro
```

---

### 3. **`cuotasPagadas`** (Integer)

**Significado según tipo:**
- **Deuda:** Cantidad de cuotas que **nosotros hemos pagado**
- **Acreencia:** Cantidad de cuotas que **nos han pagado**

**Ejemplo:**
```java
// Deuda en 12 cuotas - hemos pagado 4
movimiento.tipo = TipoMovimiento.Deuda;
movimiento.cantidadCuotas = 12;
movimiento.cuotasPagadas = 4; // Cuotas que YO pagué

// Acreencia en 12 cuotas - nos han pagado 4
movimiento.tipo = TipoMovimiento.Acreencia;
movimiento.cantidadCuotas = 12;
movimiento.cuotasPagadas = 4; // Cuotas que ME pagaron
```

---

### 4. **Otros Campos Compartidos**

| Campo | Tipo | Descripción | Uso en Deuda | Uso en Acreencia |
|-------|------|-------------|--------------|------------------|
| `cantidadCuotas` | Integer | Total de cuotas | Cuotas totales a pagar | Cuotas totales a cobrar |
| `montoCuota` | Double | Monto de cada cuota | Monto que pagamos por cuota | Monto que nos pagan por cuota |
| `tasaInteres` | Double | Tasa de interés anual (%) | Interés que pagamos | Interés que cobramos |
| `periodicidad` | String | Frecuencia de pago | Cada cuánto pagamos | Cada cuánto nos pagan |

---

## 📝 Ejemplos Completos

### Ejemplo 1: Deuda (Préstamo Bancario)

```java
Movimiento deuda = new Movimiento();
deuda.setTipo(TipoMovimiento.Deuda);
deuda.setMontoTotal(50000.0);           // Debo $50,000
deuda.setMontoPagado(10000.0);          // He pagado $10,000
deuda.setFechaEmision(LocalDate.of(2025, 1, 15));
deuda.setFechaVencimiento(LocalDate.of(2025, 12, 15)); // Vence en diciembre
deuda.setCantidadCuotas(12);            // 12 cuotas totales
deuda.setCuotasPagadas(3);              // He pagado 3 cuotas
deuda.setMontoCuota(4500.0);            // Cada cuota es $4,500
deuda.setTasaInteres(25.0);             // 25% anual
deuda.setPeriodicidad("Mensual");       // Pago mensual
deuda.setOrigenNombre("Mi Empresa");    // Quien debe (yo)
deuda.setDestinoNombre("Banco Nación"); // A quien le debo
deuda.setEstado(EstadoMovimiento.PARCIAL); // Pagado parcialmente
```

**Interpretación:**
- Pedí un préstamo de $50,000 al Banco Nación
- Lo estoy pagando en 12 cuotas de $4,500 mensuales
- Con un interés del 25% anual
- Ya pagué 3 cuotas ($10,000 de los $50,000)
- Vence el 15/12/2025

---

### Ejemplo 2: Acreencia (Venta a Crédito)

```java
Movimiento acreencia = new Movimiento();
acreencia.setTipo(TipoMovimiento.Acreencia);
acreencia.setMontoTotal(80000.0);          // Me deben $80,000
acreencia.setMontoPagado(20000.0);         // Me han pagado $20,000
acreencia.setFechaEmision(LocalDate.of(2025, 2, 1));
acreencia.setFechaVencimiento(LocalDate.of(2025, 11, 1)); // Esperamos cobrar para noviembre
acreencia.setCantidadCuotas(10);           // 10 cuotas totales
acreencia.setCuotasPagadas(2);             // Me han pagado 2 cuotas
acreencia.setMontoCuota(9000.0);           // Cada cuota es $9,000
acreencia.setTasaInteres(18.0);            // 18% anual
acreencia.setPeriodicidad("Mensual");      // Cobro mensual
acreencia.setOrigenNombre("Cliente XYZ");  // Quien nos debe
acreencia.setDestinoNombre("Mi Empresa");  // A quien le deben (yo)
acreencia.setEstado(EstadoMovimiento.PARCIAL); // Cobrado parcialmente
```

**Interpretación:**
- Le vendí a crédito a Cliente XYZ por $80,000
- Me va a pagar en 10 cuotas de $9,000 mensuales
- Con un interés del 18% anual
- Ya me pagó 2 cuotas ($20,000 de los $80,000)
- Espero terminar de cobrar el 1/11/2025

---

## 🎨 Frontend: Labels en Formularios

### FormDeuda.js
```jsx
<FormLabel>Monto pagado (abonado)</FormLabel>
<FormLabel>Cuotas pagadas (abonadas)</FormLabel>
<FormLabel>Fecha de vencimiento</FormLabel>
```

### FormAcreencia.js
```jsx
<FormLabel>Monto cobrado (pagado)</FormLabel>
<FormLabel>Cuotas cobradas (pagadas)</FormLabel>
<FormLabel>Fecha de vencimiento</FormLabel>
```

**Nota:** Los paréntesis aclaran el contexto, pero internamente todos usan el mismo campo del modelo.

---

## ✅ Validaciones y Lógica de Negocio

### Calcular Saldo Pendiente

```java
public Double calcularSaldoPendiente(Movimiento movimiento) {
    if (movimiento.getMontoTotal() == null) return 0.0;
    if (movimiento.getMontoPagado() == null) return movimiento.getMontoTotal();
    
    return movimiento.getMontoTotal() - movimiento.getMontoPagado();
}
```

**Interpretación:**
- **Deuda:** Cuánto me falta pagar
- **Acreencia:** Cuánto me falta cobrar

---

### Calcular Cuotas Pendientes

```java
public Integer calcularCuotasPendientes(Movimiento movimiento) {
    if (movimiento.getCantidadCuotas() == null) return 0;
    if (movimiento.getCuotasPagadas() == null) return movimiento.getCantidadCuotas();
    
    return movimiento.getCantidadCuotas() - movimiento.getCuotasPagadas();
}
```

**Interpretación:**
- **Deuda:** Cuántas cuotas me faltan pagar
- **Acreencia:** Cuántas cuotas me faltan cobrar

---

### Determinar Estado

```java
public EstadoMovimiento determinarEstado(Movimiento movimiento) {
    if (movimiento.getMontoPagado() == null || movimiento.getMontoPagado() == 0) {
        return EstadoMovimiento.PENDIENTE;
    }
    
    if (movimiento.getMontoPagado().equals(movimiento.getMontoTotal())) {
        return EstadoMovimiento.PAGADO; // o COBRADO en el contexto
    }
    
    if (movimiento.getFechaVencimiento() != null && 
        LocalDate.now().isAfter(movimiento.getFechaVencimiento())) {
        return EstadoMovimiento.VENCIDO;
    }
    
    return EstadoMovimiento.PARCIAL;
}
```

---

## 📊 Reportes y Consultas

### Total Pendiente por Tipo

```java
// Cuánto debemos (Deudas pendientes)
SELECT SUM(montoTotal - COALESCE(montoPagado, 0)) 
FROM registro 
WHERE tipo = 'Deuda' 
  AND estado != 'PAGADO';

// Cuánto nos deben (Acreencias pendientes)
SELECT SUM(montoTotal - COALESCE(montoPagado, 0)) 
FROM registro 
WHERE tipo = 'Acreencia' 
  AND estado != 'PAGADO';
```

---

## 🔍 Búsqueda y Filtros

### Filtrar por Estado de Pago

```java
// Deudas completamente pagadas
repository.findByTipoAndEstado(TipoMovimiento.Deuda, EstadoMovimiento.PAGADO);

// Acreencias completamente cobradas
repository.findByTipoAndEstado(TipoMovimiento.Acreencia, EstadoMovimiento.PAGADO);

// Deudas parcialmente pagadas
repository.findByTipoAndEstado(TipoMovimiento.Deuda, EstadoMovimiento.PARCIAL);

// Acreencias parcialmente cobradas
repository.findByTipoAndEstado(TipoMovimiento.Acreencia, EstadoMovimiento.PARCIAL);
```

---

## 🎯 Resumen

### ✅ Ventajas del Diseño Unificado

1. **Un solo modelo** para ambos tipos
2. **Menos redundancia** en el código
3. **Más fácil de mantener**
4. **Campos reutilizables** con contexto semántico
5. **Consultas más simples**

### 📋 Campos Clave

| Campo Backend | FormDeuda | FormAcreencia |
|---------------|-----------|---------------|
| `montoPagado` | Monto que pagamos | Monto que nos pagaron |
| `cuotasPagadas` | Cuotas que pagamos | Cuotas que nos pagaron |
| `fechaVencimiento` | Cuándo debemos pagar | Cuándo nos deben pagar |

### 🔧 Para el Desarrollador

- Siempre usar los nombres de campo del **modelo backend**
- Los labels en frontend son para **claridad del usuario**
- La lógica de negocio se adapta según el `tipo` del movimiento
- Las validaciones y cálculos funcionan igual para ambos tipos

---

## 📞 Referencias

- Modelo: `registro/src/main/java/registro/cargarDatos/models/Movimiento.java`
- Form Deuda: `frontend/src/registro/carga-general/components/forms/FormDeuda.js`
- Form Acreencia: `frontend/src/registro/carga-general/components/forms/FormAcreencia.js`

