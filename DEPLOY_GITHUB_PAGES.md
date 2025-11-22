# 🚀 Deploy Frontend a GitHub Pages

## 📋 Configuración completada:

### ✅ Archivos modificados/creados:

1. **`frontend/package.json`**: 
   - `homepage`: `https://Martin-Fedorenko.github.io/mycfo`

2. **`frontend/public/404.html`**: 
   - Maneja errores 404 y redirige correctamente con HashRouter

3. **`.github/workflows/deploy-frontend.yml`**: 
   - Workflow automático para desplegar en GitHub Pages

4. **`gateway/CorsConfig.java`**: 
   - Permite origen: `https://martin-fedorenko.github.io`

## 🔧 Pasos para activar GitHub Pages:

### 1. **Configurar GitHub Pages en tu repositorio**:

1. Ve a tu repositorio: https://github.com/Martin-Fedorenko/mycfo
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona: **GitHub Actions**
5. Guarda los cambios

### 2. **Push de los cambios**:

```bash
cd d:\Proyectos\mycfo

# Agregar todos los cambios
git add .

# Commit
git commit -m "Configure GitHub Pages deployment"

# Push a la rama main (o master)
git push origin main
```

### 3. **El workflow se ejecutará automáticamente**:

- Ve a la pestaña **Actions** en tu repositorio
- Verás el workflow "Deploy Frontend to GitHub Pages" ejecutándose
- Espera a que termine (toma unos 2-3 minutos)

### 4. **Tu sitio estará disponible en**:

```
https://Martin-Fedorenko.github.io/mycfo
```

## 🎯 Características:

- ✅ URL: `https://Martin-Fedorenko.github.io/mycfo`
- ✅ HashRouter maneja las rutas correctamente (`/#/dashboard`, `/#/signin`, etc.)
- ✅ 404.html redirige automáticamente a la ruta correcta
- ✅ Deploy automático con cada push a `main` que modifique `frontend/**`
- ✅ CORS configurado en el gateway para permitir el origen de GitHub Pages

## 🔄 Actualizaciones futuras:

Cada vez que hagas cambios en el frontend y hagas push a `main`, el sitio se actualizará automáticamente.

## 🐛 Troubleshooting:

### Si el deploy falla:

1. Verifica que la rama sea `main` (o cambia `main` a `master` en el workflow si usas master)
2. Verifica que tengas permisos de Pages habilitados en Settings → Actions → General → Workflow permissions
3. Revisa los logs en la pestaña Actions

### Si las rutas no funcionan:

- Verifica que estés usando HashRouter (ya configurado en `App.js`)
- El archivo `404.html` debe estar en `frontend/public/`

### Si hay errores CORS:

- Reinicia el gateway después de los cambios en `CorsConfig.java`
- Verifica que el origen en el navegador sea exactamente `https://martin-fedorenko.github.io`

## 📝 Notas:

- El sitio se despliega desde la carpeta `frontend/build`
- Los cambios en otros módulos (backend) NO disparan el deploy
- El workflow solo se ejecuta cuando hay cambios en `frontend/**`
