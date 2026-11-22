# کپی سایت روی دسکتاپ + میان‌بر — با robocopy (جایگزینی کامل، نه تودرتو)
$src = Join-Path $PSScriptRoot '..\dist-html'
$desktop = [Environment]::GetFolderPath('Desktop')
$dst = Join-Path $desktop 'سایت دفترچه من'

# پاک‌سازی کامل نسخهٔ قبلی و کپی آینه‌ای نسخهٔ تازه
robocopy $src $dst /MIR /NFL /NDL /NJH /NJS | Out-Null

$ws = New-Object -ComObject WScript.Shell
$lnk = Join-Path $desktop 'دفترچه علمی من.lnk'
$s = $ws.CreateShortcut($lnk)
$s.TargetPath = (Join-Path $dst 'index.html')
$s.WorkingDirectory = $dst
$s.Description = 'باز کردن سایت دفترچهٔ علمی من'
$s.Save()

Write-Output 'fresh copy on desktop'
