# Check desktop copy integrity then open it in the default browser
$d = [Environment]::GetFolderPath('Desktop') + '\سایت دفترچه من'
$idx = Join-Path $d 'index.html'

Write-Output ('folder-exists: ' + (Test-Path $d))
Write-Output ('index-exists: ' + (Test-Path $idx))
if (Test-Path $idx) {
  Write-Output ('index-size-bytes: ' + (Get-Item $idx).Length)
  $css = Select-String -Path $idx -Pattern 'rel="stylesheet" href="([^"]+)"' | Select-Object -First 1
  Write-Output ('first-css: ' + $css.Matches[0].Groups[1].Value)
  $cssFile = Join-Path $d ($css.Matches[0].Groups[1].Value -replace '/', '\')
  Write-Output ('css-file-exists: ' + (Test-Path $cssFile))
}

# Launch in default browser on the user's screen
Start-Process $idx
Write-Output 'launched'
