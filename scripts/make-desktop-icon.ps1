# Recreate desktop launcher icon (remove old one first)
$desktop = [Environment]::GetFolderPath('Desktop')
$proj = Split-Path -Parent $PSScriptRoot

$name = -join @(
  [char]0x062F, [char]0x0641, [char]0x062A, [char]0x0631, [char]0x0686, [char]0x0647, ' ',
  [char]0x0639, [char]0x0644, [char]0x0645, [char]0x06CC, ' ',
  [char]0x0645, [char]0x0646, '.lnk'
)
$lnkPath = Join-Path $desktop $name

if (Test-Path -LiteralPath $lnkPath) {
  Remove-Item -LiteralPath $lnkPath -Force
}

$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut($lnkPath)
$s.TargetPath = 'wscript.exe'
$s.Arguments = '"' + (Join-Path $proj 'scripts\site-desktop.vbs') + '"'
$s.WorkingDirectory = $proj
$s.WindowStyle = 1
$s.Description = 'My science notebook site'
$s.Save()

Write-Output ('exists-after: ' + (Test-Path -LiteralPath $lnkPath))
