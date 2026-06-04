$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir
$PortfolioDir = Join-Path $ProjectRoot 'img\portfolio'
$ServicosDir = Join-Path $ProjectRoot 'img\logotipos_servicos'
$OutDir = Join-Path $ProjectRoot 'data'
$OutFile = Join-Path $OutDir 'portfolio-data.json'
$OutJSFile = Join-Path $OutDir 'portfolio-data.js'

if (-not (Test-Path $PortfolioDir)){
  Write-Error "Portfolio directory not found: $PortfolioDir"
  exit 1
}
if (-not (Test-Path $ServicosDir)){
  Write-Error "Serviços directory not found: $ServicosDir"
  exit 1
}
if (-not (Test-Path $OutDir)){
  try {
    New-Item -ItemType Directory -Path $OutDir -ErrorAction Stop | Out-Null
  } catch {
    Write-Error "Failed to create output directory: $_"
    exit 1
  }
}

function Test-IsImage($name){
  return $name -match '.(jpe?g|png|gif|jfif)$'
}

function Get-CatFromNumber($n){
  $num = [int]$n
  if($num -ge 1 -and $num -le 4){ return 'design' }
  if($num -ge 5 -and $num -le 8){ return 'grafica' }
  if($num -ge 9 -and $num -le 11){ return 'promo' }
  if($num -ge 12 -and $num -le 13){ return 'ext' }
  return 'other'
}

$folders = Get-ChildItem -Path $PortfolioDir -Directory | Sort-Object Name
$result = @()
foreach($f in $folders){
  $folderName = $f.Name
  $folderPath = Join-Path $PortfolioDir $folderName
  $files = Get-ChildItem -Path $folderPath -File | Where-Object { Test-IsImage($_.Name) } | Sort-Object Name
  $images = @()
  foreach($fi in $files){ $images += ("img/portfolio/$folderName/$($fi.Name)") }
  $cover = if($images.Count -gt 0) { $images[0] } else { "img/portfolio/$folderName/placeholder.webp" }

  $servicosFolderPath = Join-Path $ServicosDir $folderName
  $icon = ""
  if(Test-Path $servicosFolderPath){
    $servFiles = Get-ChildItem -Path $servicosFolderPath -File | Where-Object { $_.Extension -match '.png' } | Sort-Object Name
    if($servFiles.Count -gt 0){ $icon = ("img/logotipos_servicos/$folderName/$($servFiles[0].Name)") }
  }

  $prefixMatch = [regex]::Match($folderName, '^\s*(\d+)')
  $num = if($prefixMatch.Success){ '{0:00}' -f [int]$prefixMatch.Groups[1].Value } else { '{0:00}' -f ($folders.IndexOf($f)+1) }
  $cat = Get-CatFromNumber $num
  $displayTitle = [regex]::Replace($folderName, '^\s*\d+\s*', '').Trim()

  $obj = [PSCustomObject]@{
    id = "$($cat)$($num)"
    title = $folderName
    displayTitle = $displayTitle
    folder = $folderName
    cat = $cat
    cover = $cover
    icon = $icon
    accent = '#8dc63f'
    images = $images
  }
  $result += $obj
}

$result | ConvertTo-Json -Depth 5 | Out-File -FilePath $OutFile -Encoding utf8 -ErrorAction Stop
$OutJSFile = Join-Path $OutDir 'portfolio-data.js'
$jsContent = "window.portfolioData = " + ($result | ConvertTo-Json -Depth 5) + ";"
Set-Content -Path $OutJSFile -Value $jsContent -Encoding utf8 -ErrorAction Stop
Write-Output "Wrote $OutFile"
Write-Output "Wrote $OutJSFile"
Write-Output "Folders processed: $($result.Count)"
exit 0
