' Desktop launcher: make sure the local site server is running, then open it in the default browser.
' Robust version: waits up to ~90s, logs dev-server output to C:\daftarche\.dev-log.txt for troubleshooting.
Dim shell, fso
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Always work through the ASCII junction path
shell.CurrentDirectory = "C:\daftarche"

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
  shell.Run "cmd /c npm run dev > C:\daftarche\.dev-log.txt 2>&1", 0, False
  Dim i
  For i = 1 To 45
    WScript.Sleep 2000
    If SiteUp() Then Exit For
  Next
End If

shell.Run "http://localhost:4321/"
