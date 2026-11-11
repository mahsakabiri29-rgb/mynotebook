' Auto-start: launches the inbox watcher and the local site silently (no windows).
' Self-locating: works from the scripts folder regardless of path.
Dim fso, shell, projectDir
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

projectDir = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
shell.CurrentDirectory = projectDir

' inbox watcher (hidden)
shell.Run "cmd /c npm run inbox", 0, False

WScript.Sleep 1500

' local site (hidden)
shell.Run "cmd /c npm run dev", 0, False
