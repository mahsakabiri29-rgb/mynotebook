# کپی سایت روی دسکتاپ + ساخت میان‌بر دابل‌کلیک
$src = Join-Path $PSScriptRoot '..\dist-html'
$dst = Join-Path ([Environment]::GetFolderPath('Desktop')) 'سایت دفترچه من'
Copy-Item -Path $src -Destination $dst -Recurse -Force

$ws = New-Object -ComObject WScript.Shell
$lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'دفترچه علمی من.lnk'
$s = $ws.CreateShortcut($lnk)
$s.TargetPath = (Join-Path $dst 'index.html')
$s.WorkingDirectory = $dst
$s.Description = 'باز کردن سایت دفترچهٔ علمی من'
$s.Save()

Write-Output 'shortcut + folder ready'
