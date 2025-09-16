# Script para configurar hosts file para desenvolvimento local
# Execute este script como Administrador

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = @"
# Servify Development - Multi-tenant subdomains
127.0.0.1 servify.com.br
127.0.0.1 empresa1.servify.com.br
127.0.0.1 empresa2.servify.com.br
127.0.0.1 empresa3.servify.com.br
127.0.0.1 demo.servify.com.br
127.0.0.1 test.servify.com.br
"@

Write-Host "Configurando hosts file para desenvolvimento Servify..." -ForegroundColor Green

# Verificar se já existe configuração do Servify
$existingContent = Get-Content $hostsPath -ErrorAction SilentlyContinue
if ($existingContent -match "servify\.com\.br") {
    Write-Host "Configuração do Servify já existe no hosts file." -ForegroundColor Yellow
    Write-Host "Removendo configurações antigas..." -ForegroundColor Yellow
    
    # Remover linhas existentes do Servify
    $newContent = $existingContent | Where-Object { $_ -notmatch "servify\.com\.br" }
    $newContent | Set-Content $hostsPath
}

# Adicionar nova configuração
Add-Content -Path $hostsPath -Value $hostsContent

Write-Host "Hosts file configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora você pode acessar:" -ForegroundColor Cyan
Write-Host "  http://servify.com.br:3001/api/v1/companies" -ForegroundColor White
Write-Host "  http://empresa1.servify.com.br:3001/api/v1/companies" -ForegroundColor White
Write-Host "  http://empresa2.servify.com.br:3001/api/v1/companies" -ForegroundColor White
Write-Host "  http://demo.servify.com.br:3001/api/v1/companies" -ForegroundColor White
Write-Host ""
Write-Host "Para remover estas configurações, execute:" -ForegroundColor Yellow
Write-Host "  Remove-Content -Path '$hostsPath' -Pattern 'servify\.com\.br'" -ForegroundColor White
