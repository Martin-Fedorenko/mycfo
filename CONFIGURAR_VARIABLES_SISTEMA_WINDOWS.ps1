# Script para configurar variables de entorno de AWS en Windows
# ⚠️ SOLO PARA DESARROLLO LOCAL ⚠️

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Configurar Variables de Entorno AWS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script configurará las variables de entorno para desarrollo local." -ForegroundColor Yellow
Write-Host "Las credenciales se guardarán como variables de USUARIO (no del sistema)." -ForegroundColor Yellow
Write-Host ""

try {
    # Configurar variables de entorno de usuario
    [System.Environment]::SetEnvironmentVariable("AWS_ACCESS_KEY_ID", $AWS_ACCESS_KEY_ID, "User")
    [System.Environment]::SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", $AWS_SECRET_ACCESS_KEY, "User")
    [System.Environment]::SetEnvironmentVariable("AWS_REGION", $AWS_REGION, "User")
    [System.Environment]::SetEnvironmentVariable("COGNITO_USER_POOL_ID", $COGNITO_USER_POOL_ID, "User")
    [System.Environment]::SetEnvironmentVariable("COGNITO_CLIENT_ID", $COGNITO_CLIENT_ID, "User")
    
    Write-Host ""
    Write-Host "✅ Variables de entorno configuradas correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Variables configuradas:" -ForegroundColor Cyan
    Write-Host "  - AWS_ACCESS_KEY_ID" -ForegroundColor White
    Write-Host "  - AWS_SECRET_ACCESS_KEY" -ForegroundColor White
    Write-Host "  - AWS_REGION" -ForegroundColor White
    Write-Host "  - COGNITO_USER_POOL_ID" -ForegroundColor White
    Write-Host "  - COGNITO_CLIENT_ID" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Debes REINICIAR tu IDE para que tome las variables!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para verificar, ejecuta en una NUEVA terminal:" -ForegroundColor Cyan
    Write-Host '  $env:AWS_ACCESS_KEY_ID' -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error al configurar variables: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Presiona Enter para salir..."
Read-Host

