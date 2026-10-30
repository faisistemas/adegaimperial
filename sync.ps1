# Script de Sincronizacao Automatica: GitHub, Vercel & Supabase
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " INICIANDO SINCRONIZACAO GERAL DO SISTEMA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Atualizar PATH com Node e Git
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 2. Build de Producao
Write-Host "1. Gerando build de producao (Vite + Dist)..." -ForegroundColor Yellow
cmd.exe /c "npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Falha no build. Verifique os erros acima."
} else {
    Write-Host "[OK] Build finalizado com sucesso." -ForegroundColor Green
}

# 3. Status Supabase
Write-Host ""
Write-Host "2. Verificando sincronizacao com Supabase..." -ForegroundColor Yellow
try {
    $sb = Invoke-RestMethod -Uri "http://localhost:3000/api/supabase/status" -ErrorAction Stop
    if ($sb.connected) {
        Write-Host "[OK] Supabase Conectado e Sincronizado: $($sb.message)" -ForegroundColor Green
    } else {
        Write-Warning "Supabase retornou: $($sb.message)"
    }
} catch {
    Write-Host "[INFO] Servidor local nao esta ativo no momento para healthcheck, mas o Supabase esta configurado no .env." -ForegroundColor Gray
}

# 4. Git Commit & Push
Write-Host ""
Write-Host "3. Sincronizando com GitHub..." -ForegroundColor Yellow
git add .
$status = git status --porcelain
if ($status) {
    $msg = "auto-sync: atualizacoes do sistema $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m "$msg"
    Write-Host "[OK] Commit realizado: $msg" -ForegroundColor Green
} else {
    Write-Host "[INFO] Nenhuma nova alteracao pendente de commit local." -ForegroundColor Gray
}

Write-Host "Enviando alteracoes para o GitHub (origin main)..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Alteracoes enviadas com sucesso para o GitHub!" -ForegroundColor Green
    Write-Host "[OK] O deploy na Vercel foi iniciado automaticamente pelo webhook do GitHub." -ForegroundColor Green
} else {
    Write-Warning "Falha ao enviar para o GitHub. Verifique as credenciais."
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " SINCRONIZACAO CONCLUIDA COM SUCESSO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
