# Script para configurar hosts file para desenvolvimento local com localhost
# Execute este script como Administrador

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = @"
# Servify Development - Multi-tenant subdomains on localhost
127.0.0.1 empresa1.localhost
127.0.0.1 empresa2.localhost
127.0.0.1 empresa3.localhost
127.0.0.1 demo.localhost
127.0.0.1 test.localhost
"@

Write-Host "Configurando hosts file para desenvolvimento Servify com localhost..." -ForegroundColor Green

# Verificar se já existe configuração do Servify
$existingContent = Get-Content $hostsPath -ErrorAction SilentlyContinue
if ($existingContent -match "\.localhost") {
    Write-Host "Configuração do localhost já existe no hosts file." -ForegroundColor Yellow
    Write-Host "Removendo configurações antigas..." -ForegroundColor Yellow
    
    # Remover linhas existentes do localhost
    $newContent = $existingContent | Where-Object { $_ -notmatch "\.localhost" }
    $newContent | Set-Content $hostsPath
}

# Adicionar nova configuração
Add-Content -Path $hostsPath -Value $hostsContent

Write-Host "Hosts file configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora você pode acessar:" -ForegroundColor Cyan
Write-Host "  Frontend: http://empresa1.localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://empresa1.localhost:3001/api/v1/companies" -ForegroundColor White
Write-Host "  Frontend: http://empresa2.localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://empresa2.localhost:3001/api/v1/companies" -ForegroundColor White
Write-Host "  Frontend: http://demo.localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://demo.localhost:3001/api/v1/companies" -ForegroundColor White
Write-Host ""
Write-Host "Para remover estas configurações, execute:" -ForegroundColor Yellow
Write-Host "  Remove-Content -Path '$hostsPath' -Pattern '\.localhost'" -ForegroundColor White
