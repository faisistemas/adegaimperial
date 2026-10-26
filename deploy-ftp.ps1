param (
    [Parameter(Mandatory=$true)]
    [string]$FtpHost,
    [Parameter(Mandatory=$true)]
    [string]$FtpUser,
    [Parameter(Mandatory=$true)]
    [string]$FtpPass,
    [string]$RemoteDir = "public_html"
)

$distPath = Join-Path $PSScriptRoot "dist"

if (-not (Test-Path $distPath)) {
    Write-Error "Pasta dist não encontrada. Execute 'npm run build' primeiro."
    exit 1
}

Write-Host "Iniciando upload para Locaweb: $FtpHost..." -ForegroundColor Cyan

function Upload-FtpDirectory {
    param (
        [string]$localPath,
        [string]$remoteUrl
    )

    $items = Get-ChildItem -Path $localPath -Force

    foreach ($item in $items) {
        $targetUrl = "$remoteUrl/$($item.Name)"

        if ($item.PSIsContainer) {
            # Cria pasta remota
            try {
                $mkDirReq = [System.Net.FtpWebRequest]::Create($targetUrl)
                $mkDirReq.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
                $mkDirReq.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
                $mkDirReq.UsePassive = $true
                $mkDirReq.UseBinary = $true
                $mkDirReq.KeepAlive = $false
                $resp = $mkDirReq.GetResponse()
                $resp.Close()
            } catch {
                # Se pasta já existe, segue em frente
            }

            Upload-FtpDirectory -localPath $item.FullName -remoteUrl $targetUrl
        } else {
            # Upload arquivo
            Write-Host "Enviando: $($item.Name)..." -ForegroundColor Gray
            $uploadReq = [System.Net.FtpWebRequest]::Create($targetUrl)
            $uploadReq.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $uploadReq.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
            $uploadReq.UsePassive = $true
            $uploadReq.UseBinary = $true
            $uploadReq.KeepAlive = $false

            $fileBytes = [System.IO.File]::ReadAllBytes($item.FullName)
            $uploadReq.ContentLength = $fileBytes.Length

            $requestStream = $uploadReq.GetRequestStream()
            $requestStream.Write($fileBytes, 0, $fileBytes.Length)
            $requestStream.Close()

            $uploadResp = $uploadReq.GetResponse()
            $uploadResp.Close()
        }
    }
}

$baseUrl = "ftp://$FtpHost"
if ($RemoteDir) {
    $baseUrl = "$baseUrl/$RemoteDir"
}

try {
    Upload-FtpDirectory -localPath $distPath -remoteUrl $baseUrl
    Write-Host "`nDeploy para adegaswg.com.br concluído com sucesso!" -ForegroundColor Green
} catch {
    Write-Error "Falha durante o upload: $_"
}
