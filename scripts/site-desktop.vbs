' Desktop launcher: make sure the local site server is running, then open it in the default browser.
' Works from any browser (Firefox/Chrome/Edge) because the site is served over http://localhost.
Dim shell, fso
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectDir = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
shell.CurrentDirectory = projectDir

Function SiteUp()
  On Error Resume Next
  Dim http
  Set http = CreateObject("MSXML2.ServerXMLHTTP")
  http.Open "GET", "http://localhost:4321/", False
  http.Send ""
  If Err.Number = 0 And http.Status = 200 Then
    SiteUp = True
  Else
    SiteUp = False
  End If
  Set http = Nothing
  On Error Goto 0
End Function

If Not SiteUp() Then
  shell.Run "cmd /c npm run dev", 0, False
  Dim i
  For i = 1 To 12
    WScript.Sleep 2000
    If SiteUp() Then Exit For
  Next
End If

shell.Run "http://localhost:4321/"
