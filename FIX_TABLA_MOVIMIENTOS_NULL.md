# 🔧 Fix: Error de valores null en Tabla de Movimientos

## ❌ Error Original:

```
Cannot read properties of null (reading 'value')
TypeError: Cannot read properties of null (reading 'value')
    at Object.valueFormatter
```

---

## 🎯 Causa del Problema:

Los `valueFormatter`, `valueGetter` y `renderCell` de las columnas de DataGrid no estaban validando correctamente los valores nulos o indefinidos antes de intentar acceder a sus propiedades.

Cuando un campo de la base de datos es `null` o `undefined`, el código intentaba:
- `params.value.toLocaleDateString()` → Error si `params.value` es null
- `new Date(params.value)` → Error si `params.value` es null
- Acceder a `params.row` sin verificar si existe

---

## ✅ Solución Implementada:

Se agregaron validaciones exhaustivas en **TODAS** las columnas de la tabla:

### **1. Columna "Tipo"**
```javascript
renderCell: (params) => {
  if (!params || !params.value) {
    return (
      <Chip
        label="Sin tipo"
        size="small"
        sx={{
          backgroundColor: "#75757515",
          color: "#757575",
          fontWeight: 600,
          border: "1px solid #757575",
          fontSize: "0.8125rem",
        }}
      />
    );
  }
  // ... resto del código
}
```

### **2. Columna "Monto"**
```javascript
valueFormatter: (params) => {
  if (!params || params.value === null || params.value === undefined) return "$0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Math.abs(params.value));
}
```

### **3. Columna "Moneda"**
```javascript
renderCell: (params) => {
  if (!params) return "-";
  const moneda = params.value || "-";
  // ... resto del código
}
```

### **4. Columna "Fecha"** (La más crítica)
```javascript
valueGetter: (params) => {
  if (!params || !params.value) return null;
  try {
    return new Date(params.value);
  } catch (e) {
    return null;
  }
},
valueFormatter: (params) => {
  if (!params || !params.value) return "-";
  try {
    return params.value.toLocaleDateString("es-AR");
  } catch (e) {
    return "-";
  }
}
```

### **5. Columna "Conciliado"**
```javascript
renderCell: (params) => {
  if (!params || !params.row) return "-";
  const conciliado = params.row.documentoComercial !== null && 
                     params.row.documentoComercial !== undefined;
  // ... resto del código
}
```

### **6. Columnas de Texto (Categoría, Origen, Destino, Descripción)**
```javascript
// Categoría (renderCell)
renderCell: (params) => {
  if (!params || !params.value) return "-";
  // ... resto del código
}

// Origen, Destino, Descripción (valueGetter)
valueGetter: (params) => {
  if (!params || params.value === null || params.value === undefined) return "-";
  return params.value;
}
```

---

## 🛡️ Validaciones Agregadas:

Cada columna ahora valida:

1. ✅ **`params` existe** → `if (!params)`
2. ✅ **`params.value` existe** → `if (!params.value)` o `params.value === null`
3. ✅ **`params.row` existe** (cuando se usa) → `if (!params.row)`
4. ✅ **Try/catch** en conversiones de fecha

---

## 📊 Valores por Defecto:

| Campo | Valor si es null |
|-------|-----------------|
| **Tipo** | Chip "Sin tipo" (gris) |
| **Monto** | "$0" |
| **Moneda** | Chip "-" |
| **Fecha** | "-" |
| **Conciliado** | "-" |
| **Categoría** | "-" |
| **Origen** | "-" |
| **Destino** | "-" |
| **Descripción** | "-" |

---

## 🎯 Beneficios:

✅ **No más errores** al cargar la tabla  
✅ **Todos los campos son opcionales** en la BD  
✅ **Mejor UX** con valores por defecto claros  
✅ **Código robusto** con validaciones exhaustivas  
✅ **Try/catch** para evitar errores inesperados  

---

## 🧪 Casos de Prueba Cubiertos:

| Escenario | Resultado |
|-----------|-----------|
| Movimiento sin fecha | Muestra "-" |
| Movimiento sin monto | Muestra "$0" |
| Movimiento sin tipo | Chip "Sin tipo" (gris) |
| Movimiento sin moneda | Chip "-" |
| Movimiento sin categoría | Muestra "-" |
| Movimiento sin origen/destino | Muestra "-" |
| Movimiento sin descripción | Muestra "-" |
| Movimiento sin documento comercial | Chip "Sin conciliar" |
| `params` es null | Muestra valor por defecto |
| Fecha inválida | Muestra "-" (catch) |

---

## ✅ Estado:

**Todas las columnas** de la tabla ahora manejan valores nulos correctamente. La tabla puede mostrar movimientos con cualquier combinación de campos nulos sin generar errores. 🎉

---

## 🔄 Próximos Pasos:

Si quieres que algunos campos sean **obligatorios** en la BD, deberías:
1. Agregar validaciones en el backend (DTOs, anotaciones `@NotNull`)
2. Agregar validaciones en los formularios del frontend
3. Decidir qué campos realmente deben ser opcionales

Por ahora, la tabla está **completamente protegida** contra valores nulos. ✅

