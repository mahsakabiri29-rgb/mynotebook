# Verify desktop portable copy links
$d = [Environment]::GetFolderPath('Desktop') + '\سایت دفترچه من'

$idx = Select-String -Path ($d + '\index.html') -Pattern 'href="([^"]*professionals[^"]*)"' | Select-Object -First 1
Write-Output ('link-to-professionals: ' + $idx.Matches[0].Groups[1].Value)

$nested = Select-String -Path ($d + '\professionals\index.html') -Pattern 'rel="stylesheet" href="([^"]+)"' | Select-Object -First 1
Write-Output ('nested-css: ' + $nested.Matches[0].Groups[1].Value)

Write-Output ('stale-nested-copy-exists: ' + (Test-Path ($d + '\dist-html')))
Write-Output ('search-json-beside-page: ' + (Test-Path ($d + '\professionals\search.json')))
