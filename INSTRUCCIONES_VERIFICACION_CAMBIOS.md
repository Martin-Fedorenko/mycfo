# 🔍 Instrucciones de Verificación - Cambios Implementados

## ✅ Cambios Realizados

### 1. **Tabla de Movimientos** - Hover más sutil
### 2. **Tabla de Movimientos** - Logs de debug
### 3. **Componente Empresa** - Completamente reescrito con datos de BD

---

## 🧪 Cómo Verificar los Cambios

### 📊 **1. Verificar Tabla de Movimientos**

#### **Paso 1: Abrir la tabla**
```
http://localhost:3000/#/ver-movimientos
```

#### **Paso 2: Abrir la consola del navegador**
- Presiona `F12` o click derecho → "Inspeccionar"
- Ve a la pestaña "Console"

#### **Paso 3: Buscar los logs**
Deberías ver algo como:
```
📊 Datos recibidos del backend: {content: Array(X), ...}
📊 Content: [{id: 1, tipo: "Egreso", montoTotal: 50000, ...}, ...]
```

#### **Paso 4: Verificar los datos**

**SI VES DATOS EN LA CONSOLA PERO NO EN LA TABLA:**

Compara los nombres de campos en el log con los que espera la tabla:

**La tabla espera:**
- `id`
- `tipo`
- `montoTotal` ← **IMPORTANTE**
- `moneda`
- `fechaEmision`
- `conciliado` (o `documentoComercial`)
- `categoria`
- `origenNombre`
- `destinoNombre`
- `descripcion`

**Si el backend envía campos diferentes (ej: `monto` en lugar de `montoTotal`):**
- Necesitas ajustar el backend para que use los nombres correctos
- O ajustar el frontend para que lea los nombres que envía el backend

---

### 🏢 **2. Verificar Componente de Empresa**

#### **Paso 1: Ir al apartado de empresa**
```
http://localhost:3000/#/empresa
```
O navega desde el menú lateral → **Administración** → **Empresa**

#### **Paso 2: Verificar que se carguen los datos**

Deberías ver:

**📋 Información de la Empresa:**
- Nombre de la Empresa
- Descripción
- ID de Organización

**👥 Empleados de la Organización:**
- Lista de todos los empleados
- Nombre, Email, Teléfono
- Rol (ADMINISTRADOR / NORMAL)
- Estado (Activo / Inactivo)
- Badge "Admin" para administradores

#### **Paso 3: Probar permisos**

**Si eres ADMINISTRADOR:**
- ✅ Deberías ver botones de ✏️ Editar y 🗑️ Eliminar en cada empleado
- ✅ Puedes hacer click en "Editar" y modificar datos
- ✅ Puedes hacer click en "Eliminar" y eliminar empleados

**Si eres USUARIO NORMAL:**
- 📢 Deberías ver una alerta: "Solo los administradores pueden modificar..."
- 🚫 NO deberías ver botones de editar/eliminar
- 👁️ Solo puedes ver la información

---

## 🐛 Solución de Problemas

### **Problema 1: No se muestran datos en la tabla**

**Solución:**
1. Abre la consola (F12)
2. Busca el log `📊 Datos recibidos del backend`
3. Verifica:
   - ¿Hay datos en `response.data`?
   - ¿Hay datos en `response.data.content`?
   - ¿Los nombres de campos coinciden?

**Si NO hay datos:**
- Verifica que el backend esté corriendo en el puerto 8086
- Verifica que el endpoint `/movimientos` esté funcionando
- Prueba hacer una petición directa: `http://localhost:8086/movimientos?organizacionId=1`

**Si los nombres de campos NO coinciden:**
- Opción 1: Ajusta el backend para que envíe los nombres correctos
- Opción 2: Ajusta el frontend para que lea los nombres del backend

---

### **Problema 2: Error al cargar datos de empresa**

**Solución:**
1. Abre la consola (F12)
2. Busca errores de red (pestaña "Network" o "Red")
3. Verifica:
   - ¿El módulo de administración está corriendo en el puerto 8081?
   - ¿El usuario tiene `sub` y `organizacionId` en sessionStorage?
   - ¿Los endpoints devuelven 200 OK?

**Endpoints que deben funcionar:**
```
GET http://localhost:8081/api/usuarios/perfil (con header X-Usuario-Sub)
GET http://localhost:8081/api/empresas/{id}
GET http://localhost:8081/api/usuarios/empresa/{empresaId}
```

**Para verificar manualmente:**
```bash
# Prueba obtener datos de empresa (reemplaza {id} con tu organizacionId)
curl http://localhost:8081/api/empresas/1

# Prueba obtener empleados (reemplaza {empresaId} con tu organizacionId)
curl http://localhost:8081/api/usuarios/empresa/1
```

---

### **Problema 3: No puedo editar empleados siendo administrador**

**Verifica:**
1. ¿Tu rol en la BD es "ADMINISTRADOR"?
2. Verifica en la consola:
   ```javascript
   sessionStorage.getItem("sub")
   ```
3. Haz una petición al perfil:
   ```
   GET http://localhost:8081/api/usuarios/perfil
   Headers: X-Usuario-Sub: {tu_sub}
   ```
4. Verifica que el campo `rol` sea `"ADMINISTRADOR"`

---

## 📋 Checklist Final

### **Tabla de Movimientos:**
- [ ] La tabla carga sin errores
- [ ] Se muestran los datos correctamente
- [ ] El hover es sutil (casi imperceptible)
- [ ] Los logs de debug aparecen en la consola

### **Componente Empresa:**
- [ ] Se cargan los datos de la empresa
- [ ] Se carga la lista de empleados
- [ ] Los permisos funcionan correctamente (admin vs normal)
- [ ] Puedo editar empleados (si soy admin)
- [ ] Puedo eliminar empleados (si soy admin)
- [ ] Los cambios se guardan correctamente

---

## 🎯 Si Todo Funciona Correctamente:

Deberías ver:
- ✅ Tabla de movimientos con datos
- ✅ Hover muy sutil en las filas
- ✅ Datos de la empresa cargados desde la BD
- ✅ Lista de empleados actualizada
- ✅ Permisos basados en rol funcionando
- ✅ Edición y eliminación de empleados (solo admins)

---

## 📞 Si Algo No Funciona:

1. **Revisa la consola del navegador** (F12)
2. **Revisa la consola del backend** (donde corre Spring Boot)
3. **Verifica que todos los servicios estén corriendo:**
   - Frontend: `http://localhost:3000`
   - Administración: `http://localhost:8081`
   - Registro: `http://localhost:8086`
4. **Verifica que tengas datos en la BD**
5. **Copia los errores exactos** de la consola

---

## 🚀 ¡Listo!

Si todo funciona, ya tienes:
- Tabla de movimientos mejorada
- Gestión de empresa con datos reales
- Control de permisos por rol
- CRUD de empleados funcional

🎉 **¡Disfruta tu aplicación actualizada!**

