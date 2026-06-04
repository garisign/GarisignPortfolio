$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir
$PortfolioDir = Join-Path $ProjectRoot 'img\portfolio'
$ServicosDir = Join-Path $ProjectRoot 'img\logotipos_servicos'
$GeneratorScript = Join-Path $ScriptDir 'generate_portfolio.ps1'

if (-not (Test-Path $GeneratorScript)) {
    Write-Error "Generator script not found: $GeneratorScript"
    exit 1
}
if (-not (Test-Path $PortfolioDir)) {
    Write-Error "Portfolio directory not found: $PortfolioDir"
    exit 1
}
if (-not (Test-Path $ServicosDir)) {
    Write-Error "Serviços directory not found: $ServicosDir"
    exit 1
}

function Invoke-GeneratePortfolio {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] >> Regenerating portfolio data..." -ForegroundColor Cyan
    try {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $GeneratorScript 2>&1 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] OK Portfolio data updated successfully." -ForegroundColor Green
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERROR Portfolio generator failed: $_" -ForegroundColor Red
    }
}

function Get-FileSystemSnapshot {
    param([string]$Directory)
    
    try {
        $files = Get-ChildItem -Path $Directory -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Extension -match '.(jpe?g|png|gif|jfif)$' } |
            Select-Object FullName, Length, LastWriteTime
        
        $snapshot = @()
        foreach ($file in $files) {
            $snapshot += "$($file.FullName)|$($file.Length)|$($file.LastWriteTime.Ticks)"
        }
        
        return [string]::Join("`n", ($snapshot | Sort-Object))
    } catch {
        return ""
    }
}

# Initial generation
Invoke-GeneratePortfolio

# Initialize snapshots
$lastPortfolioSnapshot = Get-FileSystemSnapshot $PortfolioDir
$lastServicosSnapshot = Get-FileSystemSnapshot $ServicosDir
$lastChangeTime = Get-Date

Write-Host "`nWatching folders for changes:" -ForegroundColor Cyan
Write-Host "  $PortfolioDir" -ForegroundColor Cyan
Write-Host "  $ServicosDir" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop.`n" -ForegroundColor Cyan

$pollInterval = 500  # milliseconds

try {
    while ($true) {
        Start-Sleep -Milliseconds $pollInterval
        
        $portfolioSnapshot = Get-FileSystemSnapshot $PortfolioDir
        $servicosSnapshot = Get-FileSystemSnapshot $ServicosDir
        
        # Check if anything changed
        if (($portfolioSnapshot -ne $lastPortfolioSnapshot) -or ($servicosSnapshot -ne $lastServicosSnapshot)) {
            # Debounce: only trigger if 1 second has passed since last change
            $timeSinceLastChange = (Get-Date) - $lastChangeTime
            if ($timeSinceLastChange.TotalSeconds -ge 1) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] CHANGE detected in folders" -ForegroundColor Yellow
                
                # Update snapshots before regenerating
                $lastPortfolioSnapshot = $portfolioSnapshot
                $lastServicosSnapshot = $servicosSnapshot
                $lastChangeTime = Get-Date
                
                # Regenerate
                Invoke-GeneratePortfolio
                Write-Host ""
            } else {
                # Still updating, just store the latest snapshots
                $lastPortfolioSnapshot = $portfolioSnapshot
                $lastServicosSnapshot = $servicosSnapshot
            }
        }
    }
} finally {
    Write-Host "`nWatch stopped." -ForegroundColor Yellow
}

