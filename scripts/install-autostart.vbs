' Installs permanent access to the site (run once):
'   1. Startup shortcut  -> site + inbox watcher start silently at Windows logon
'   2. Desktop shortcut  -> "daftarche.url" opens http://localhost:4321
' Self-locating: no hardcoded paths (works with the Persian project folder).
Dim fso, shell, projectDir, startupDir, desktopDir, lnk
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

projectDir = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
startupDir = shell.SpecialFolders("Startup")
desktopDir = shell.SpecialFolders("Desktop")

' 1) Startup shortcut -> autostart.vbs
Set lnk = shell.CreateShortcut(startupDir & "\Daftarche-autostart.lnk")
lnk.TargetPath = "wscript.exe"
lnk.Arguments = Chr(34) & projectDir & "\scripts\autostart.vbs" & Chr(34)
lnk.WorkingDirectory = projectDir
lnk.WindowStyle = 1
lnk.Save

' 2) Desktop internet shortcut (ASCII content, Persian file name is fine)
Dim urlFile
urlFile = desktopDir & "\daftarche.url"
Dim ts
Set ts = fso.CreateTextFile(urlFile, True, False)
ts.WriteLine "[InternetShortcut]"
ts.WriteLine "URL=http://localhost:4321"
ts.WriteLine "IconIndex=0"
ts.Close

' 3) Start everything right now (silently)
shell.Run "wscript.exe " & Chr(34) & projectDir & "\scripts\autostart.vbs" & Chr(34), 0, False

MsgBox "OK!" & vbCrLf & vbCrLf & _
       "Site:  http://localhost:4321" & vbCrLf & _
       "Desktop shortcut: daftarche.url" & vbCrLf & _
       "Starts automatically at Windows logon.", vbInformation, "Daftarche"
