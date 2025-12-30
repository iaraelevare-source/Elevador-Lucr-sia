# Testes de Verificação Rápida - Elevare
# Execute com: .\scripts\test-deploy.ps1

param(
    [string]$DeployUrl = "https://elevare.railway.app"  # Substitua pelo seu domínio
)

Write-Host "🧪 TESTES DE VERIFICAÇÃO - ELEVARE" -ForegroundColor Cyan
Write-Host "🌐 URL: $DeployUrl" -ForegroundColor Gray
Write-Host ""

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [int[]]$ExpectedCodes = @(200)
    )
    
    Write-Host "📋 Testando: $Name" -ForegroundColor White
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        $statusCode = $response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        } else {
            $statusCode = 0
        }
    }
    
    if ($statusCode -in $ExpectedCodes) {
        Write-Host "   ✅ PASSOU (HTTP $statusCode)" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "   ❌ FALHOU (HTTP $statusCode, esperado: $($ExpectedCodes -join ', '))" -ForegroundColor Red
        $script:failed++
    }
    Write-Host ""
}

# ========== TESTES ==========

Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "1️⃣  TESTES DE INFRAESTRUTURA" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray

Test-Endpoint -Name "Health Check" -Url "$DeployUrl/api/health"
Test-Endpoint -Name "Frontend (Home)" -Url "$DeployUrl"
Test-Endpoint -Name "Frontend (Login)" -Url "$DeployUrl/login"

Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "2️⃣  TESTES DE API (tRPC)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray

Test-Endpoint -Name "tRPC - Auth Me (sem login)" -Url "$DeployUrl/api/trpc/auth.me" -ExpectedCodes @(200, 400, 401)
Test-Endpoint -Name "tRPC - System Health" -Url "$DeployUrl/api/trpc/system.health" -ExpectedCodes @(200, 400)

Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "3️⃣  TESTES DE SEGURANÇA" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray

Test-Endpoint -Name "Webhook Stripe (rejeita inválido)" -Url "$DeployUrl/webhooks/stripe" -Method "POST" -ExpectedCodes @(400, 401, 403)

Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "4️⃣  TESTE DE RATE LIMIT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray

Write-Host "📋 Testando: Rate Limit (10 requisições rápidas)" -ForegroundColor White
$rateLimitHit = $false
for ($i = 1; $i -le 15; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$DeployUrl/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $status = $response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        } else {
            $status = 0
        }
    }
    
    Write-Host "   Tentativa $i -> HTTP $status" -ForegroundColor Gray
    
    if ($status -eq 429) {
        $rateLimitHit = $true
        break
    }
}

if ($rateLimitHit) {
    Write-Host "   ✅ Rate Limit ATIVO (bloqueou após $i requisições)" -ForegroundColor Green
    $passed++
} else {
    Write-Host "   ⚠️  Rate Limit pode estar desativado ou muito alto" -ForegroundColor Yellow
}
Write-Host ""

# ========== RESUMO ==========

Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "📊 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor DarkGray

Write-Host "   ✅ Passou: $passed" -ForegroundColor Green
Write-Host "   ❌ Falhou: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM! Deploy está pronto." -ForegroundColor Green
} elseif ($failed -le 2) {
    Write-Host "⚠️  Alguns testes falharam. Verifique os logs do Railway." -ForegroundColor Yellow
} else {
    Write-Host "🚨 MUITOS TESTES FALHARAM! Considere rollback." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Acesse $DeployUrl no navegador" -ForegroundColor White
Write-Host "   2. Faça login com OAuth" -ForegroundColor White
Write-Host "   3. Teste o diagnóstico gratuito" -ForegroundColor White
Write-Host "   4. Verifique o painel admin em $DeployUrl/admin" -ForegroundColor White
