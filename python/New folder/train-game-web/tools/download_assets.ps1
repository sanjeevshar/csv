<#
Template PowerShell script to download audio assets into the `assets` folder.
Fill `assets_to_download.json` with direct URLs (public-domain or CC0) and run this script.
#>
param(
  [string]$ListFile = "assets/assets_to_download.json"
)
if (-not (Test-Path $ListFile)) { Write-Host "Missing $ListFile — copy assets/assets_to_download.sample.json and edit URLs."; exit 1 }
$json = Get-Content $ListFile -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Path "assets" -Force | Out-Null
foreach ($k in $json.PSObject.Properties) {
  $url = $k.Value
  if ([string]::IsNullOrWhiteSpace($url)) { Write-Host "No URL for $($k.Name), skipping."; continue }
  $target = "assets/$($k.Name).mp3"
  Write-Host "Downloading $($k.Name) from $url to $target"
  try { Invoke-WebRequest -Uri $url -OutFile $target -UseBasicParsing -ErrorAction Stop; Write-Host "Saved $target" } catch { Write-Host "Failed to download $url : $_" }
}
