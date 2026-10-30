# Script de Sincronização Automática: GitHub, Vercel & Supabase
$ErrorActionPreference = "Continue"

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " INICIANDO SINCRONIZAÇÃO GERAL DO SISTEMA" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# 1. Atualizar PATH com Node e Git
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 2. Build de Produção
Write-Host "1. Gerando build de produção (Vite + Dist)..." -ForegroundColor Yellow
cmd.exe /c "npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Falha no build. Verifique os erros acima."
} else {
    Write-Host "✓ Build finalizado com sucesso." -ForegroundColor Green
}

# 3. Status Supabase
Write-Host "`n2. Verificando sincronização com Supabase..." -ForegroundColor Yellow
try {
    $sb = Invoke-RestMethod -Uri "http://localhost:3000/api/supabase/status" -ErrorAction Stop
    if ($sb.connected) {
        Write-Host "✓ Supabase Conectado e Sincronizado: $($sb.message)" -ForegroundColor Green
    } else {
        Write-Warning "Supabase retornou: $($sb.message)"
    }
} catch {
    Write-Host "ℹ Servidor local não está rodando no momento para o healthcheck do Supabase (as credenciais do .env continuam ativas)." -ForegroundColor Gray
}

# 4. Git Commit & Push
Write-Host "`n3. Sincronizando com GitHub..." -ForegroundColor Yellow
git add .
$status = git status --porcelain
if ($status) {
    $msg = "auto-sync: atualizacoes do sistema $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m "$msg"
    Write-Host "✓ Commit realizado: $msg" -ForegroundColor Green
} else {
    Write-Host "ℹ Nenhuma nova alteração pendente de commit." -ForegroundColor Gray
}

Write-Host "Enviando alterações para o GitHub (origin main)..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Alterações enviadas com sucesso para o GitHub!" -ForegroundColor Green
    Write-Host "✓ Se a sua Vercel estiver conectada ao GitHub, o deploy iniciará automaticamente na Vercel." -ForegroundColor Green
} else {
    Write-Warning "O GitHub solicitou autenticação. Para enviar sem digitar senha, configure um Personal Access Token ou faça login no Git."
}

# 5. Vercel Direct Deploy (caso Vercel CLI esteja autenticada)
Write-Host "`n4. Verificando deploy direto via Vercel CLI..." -ForegroundColor Yellow
$vercelCheck = cmd.exe /c "npx vercel whoami 2>&1"
if ($LASTEXITCODE -eq 0 -and $vercelCheck -notlike "*Logged out*") {
    Write-Host "✓ Usuário autenticado na Vercel: $vercelCheck" -ForegroundColor Green
    Write-Host "Iniciando deploy de produção na Vercel..." -ForegroundColor Yellow
    cmd.exe /c "npx vercel --prod --yes"
} else {
    Write-Host "ℹ Vercel CLI não autenticada localmente (o deploy ocorrerá automaticamente via GitHub assim que o push for aceito)." -ForegroundColor Gray
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " SINCRONIZAÇÃO CONCLUÍDA" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

