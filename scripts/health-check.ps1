param(
  [string]$Url = "http://localhost:3000/api/health"
)

try {
  $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 5
  Write-Host "Status Code:" $response.StatusCode
  Write-Host "Content:" $response.Content
} catch {
  Write-Host "Health check failed:" $_
  exit 1
}
