# Script de Rollback de Emergência
# Execute com: .\scripts\rollback.ps1

Write-Host "🔄 ROLLBACK DE EMERGÊNCIA - ELEVARE" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "⚠️  Tem certeza que deseja fazer rollback? (s/n)"

if ($confirm -ne "s") {
    Write-Host "❌ Rollback cancelado." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "📋 Executando rollback..." -ForegroundColor Cyan

# 1. Reverter último commit
Write-Host "   1. Revertendo último commit..." -ForegroundColor White
git revert HEAD --no-edit

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Falha ao reverter commit" -ForegroundColor Red
    Write-Host "   Tente manualmente: git revert HEAD --no-edit" -ForegroundColor Yellow
    exit 1
}

# 2. Push para origin
Write-Host "   2. Enviando para origin/main..." -ForegroundColor White
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Falha ao fazer push" -ForegroundColor Red
    Write-Host "   Tente manualmente: git push origin main -f" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ ROLLBACK COMPLETO!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 O Railway irá automaticamente fazer redeploy com a versão anterior." -ForegroundColor White
Write-Host "   Aguarde 3-5 minutos e verifique o status em:" -ForegroundColor White
Write-Host "   https://railway.app/dashboard" -ForegroundColor Cyan
