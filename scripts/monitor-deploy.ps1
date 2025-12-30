# Monitor de Deploy - Elevare
# Execute com: .\scripts\monitor-deploy.ps1

param(
    [string]$DeployUrl = "https://elevare.railway.app"  # Substitua pelo seu domínio
)

Write-Host "🔍 MONITORANDO DEPLOY ELEVARE" -ForegroundColor Cyan
Write-Host "⏰ Verificação a cada 30 segundos" -ForegroundColor Gray
Write-Host "🌐 URL: $DeployUrl" -ForegroundColor Gray
Write-Host ""

function Test-Endpoint {
    param([string]$Url, [string]$Method = "GET")
    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue
        return $response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            return [int]$_.Exception.Response.StatusCode
        }
        return 0
    }
}

function Check-Status {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "📊 $timestamp - Verificando..." -ForegroundColor White
    
    # 1. Health Check
    $healthUrl = "$DeployUrl/api/health"
    $healthStatus = Test-Endpoint -Url $healthUrl
    if ($healthStatus -eq 200) {
        Write-Host "   ✅ Health Check: ONLINE" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Health Check: OFFLINE ($healthStatus)" -ForegroundColor Red
    }
    
    # 2. API tRPC
    $trpcUrl = "$DeployUrl/api/trpc/auth.me"
    $trpcStatus = Test-Endpoint -Url $trpcUrl
    if ($trpcStatus -in @(200, 401, 400)) {
        Write-Host "   ✅ tRPC API: FUNCIONANDO" -ForegroundColor Green
    } else {
        Write-Host "   ❌ tRPC API: ERRO ($trpcStatus)" -ForegroundColor Red
    }
    
    # 3. Webhook Stripe (deve rejeitar requisição inválida)
    $webhookUrl = "$DeployUrl/webhooks/stripe"
    $webhookStatus = Test-Endpoint -Url $webhookUrl -Method "POST"
    if ($webhookStatus -in @(400, 401, 403)) {
        Write-Host "   ✅ Webhook Stripe: SEGURO (rejeita inválido)" -ForegroundColor Green
    } elseif ($webhookStatus -eq 200) {
        Write-Host "   ⚠️  Webhook Stripe: ATENÇÃO (aceitou inválido)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Webhook Stripe: ERRO ($webhookStatus)" -ForegroundColor Red
    }
    
    # 4. Frontend
    $frontendStatus = Test-Endpoint -Url $DeployUrl
    if ($frontendStatus -eq 200) {
        Write-Host "   ✅ Frontend: CARREGANDO" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend: ERRO ($frontendStatus)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Loop de monitoramento
while ($true) {
    Check-Status
    Start-Sleep -Seconds 30
}
