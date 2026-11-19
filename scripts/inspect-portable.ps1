# بازرسی لینک‌های نسخهٔ قابل‌حمل دسکتاپ
$d = [Environment]::GetFolderPath('Desktop') + '\سایت دفترچه من'

Write-Output '--- root stylesheet:'
Select-String -Path ($d + '\index.html') -Pattern 'rel="stylesheet" href="([^"]+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 2

Write-Output '--- root link to professionals:'
Select-String -Path ($d + '\index.html') -Pattern 'href="([^"]*professionals[^"]*)"' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 3

Write-Output '--- nested stylesheet (professionals/index.html):'
Select-String -Path ($d + '\professionals\index.html') -Pattern 'rel="stylesheet" href="([^"]+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 2

Write-Output '--- nested link back home:'
Select-String -Path ($d + '\professionals\index.html') -Pattern 'href="(\./|\.\./)[^"]*"' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 4
