' Desktop launcher v3 - anti-duplicate lock:
'   * A marker file prevents multiple launches stacking servers.
'   * If the site is already up, just opens the browser.
'   * Waits up to ~90s for first boot after Windows start.
Dim shell, fso
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Const SITE = "http://localhost:4321/"
Const LOCK = "C:\daftarche\.launcher.lock"
Const LOG  = "C:\daftarche\.dev-log.txt"

Function SiteUp()
  On Error Resume Next
  Dim http
  Set http = CreateObject("MSXML2.ServerXMLHTTP")
  http.Open "GET", SITE, False
  http.Send ""
  If Err.Number = 0 And http.Status = 200 Then
    SiteUp = True
  Else
    SiteUp = False
  End If
  Set http = Nothing
  On Error Goto 0
End Function

' If the site is already up -> just open the browser and quit (no new server)
If SiteUp() Then
  shell.Run SITE
  WScript.Quit 0
End If

' Anti-duplicate: if another launcher instance is booting, wait for it instead of stacking
If fso.FileExists(LOCK) Then
  Dim w
  For w = 1 To 45
    WScript.Sleep 2000
    If SiteUp() Then
      shell.Run SITE
      fso.DeleteFile LOCK, True
      WScript.Quit 0
    End If
  Next
  ' Lock is stale (old crash) -> remove it and continue
  On Error Resume Next
  fso.DeleteFile LOCK, True
  On Error Goto 0
End If

' Create the lock (note who and when)
On Error Resume Next
Dim ts
Set ts = fso.CreateTextFile(LOCK, True)
ts.WriteLine Now & " launcher pid booting server"
ts.Close
On Error Goto 0

' Boot the server hidden
shell.CurrentDirectory = "C:\daftarche"
shell.Run "cmd /c npm run dev > " & LOG & " 2>&1", 0, False

' Wait for readiness
Dim i
For i = 1 To 45
  WScript.Sleep 2000
  If SiteUp() Then Exit For
Next

' Open the browser whether or not it came up (if not, user sees error page & log exists)
shell.Run SITE

' Give the browser a moment, then release the lock
WScript.Sleep 3000
On Error Resume Next
fso.DeleteFile LOCK, True
On Error Goto 0
