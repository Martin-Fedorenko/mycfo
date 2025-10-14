# 🔧 Configurar Variables de Entorno en el IDE

## Para IntelliJ IDEA

1. **Ir a:** `Run` → `Edit Configurations...`

2. **Seleccionar tu aplicación** (AdministracionApplication)

3. **En "Environment variables"** agregar:

```
AWS_ACCESS_KEY_ID=AKIA3PDL62RGT7LSNDJB;
AWS_SECRET_ACCESS_KEY=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;
AWS_REGION=sa-east-1;
COGNITO_USER_POOL_ID=sa-east-1_lTMNrWW7R;
COGNITO_CLIENT_ID=3ksssqtg3r49rf6js1t1177hrd
```

**Formato:** `VARIABLE=valor;VARIABLE2=valor2` (separado por punto y coma)

4. **Aplicar y correr** la aplicación

---

## Para VS Code

1. **Crear archivo:** `.vscode/launch.json`

2. **Agregar esta configuración:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "AdministracionApplication",
      "request": "launch",
      "mainClass": "administracion.AdministracionApplication",
      "env": {
        "AWS_ACCESS_KEY_ID": "AKIA3PDL62RGT7LSNDJB",
        "AWS_SECRET_ACCESS_KEY": "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",
        "AWS_REGION": "sa-east-1",
        "COGNITO_USER_POOL_ID": "sa-east-1_lTMNrWW7R",
        "COGNITO_CLIENT_ID": "3ksssqtg3r49rf6js1t1177hrd"
      }
    }
  ]
}
```

3. **Correr con F5** o desde el panel de Debug

---

## Para Eclipse

1. **Ir a:** `Run` → `Run Configurations...`

2. **Seleccionar tu aplicación**

3. **Tab "Environment"** → `New` para cada variable:

```
AWS_ACCESS_KEY_ID = AKIA3PDL62RGT7LSNDJB
AWS_SECRET_ACCESS_KEY = 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
AWS_REGION = sa-east-1
COGNITO_USER_POOL_ID = sa-east-1_lTMNrWW7R
COGNITO_CLIENT_ID = 3ksssqtg3r49rf6js1t1177hrd
```

4. **Aplicar y correr**

---

## ⚠️ IMPORTANTE

- ❌ **NO agregues** `.vscode/launch.json` al `.gitignore` si ya tiene credenciales
- ✅ **Mejor:** Usa variables de entorno del sistema (Opción 2)

