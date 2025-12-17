' Create Desktop Shortcut for Sufian Panel
' This script creates a shortcut on the user's desktop

Set WshShell = WScript.CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get paths
strDesktop = WshShell.SpecialFolders("Desktop")
strCurrentDir = fso.GetParentFolderName(WScript.ScriptFullName)
strTarget = strCurrentDir & "\start.bat"
strShortcut = strDesktop & "\Sufian Panel.lnk"

' Create the shortcut
Set oShortcut = WshShell.CreateShortcut(strShortcut)
oShortcut.TargetPath = strTarget
oShortcut.WorkingDirectory = strCurrentDir
oShortcut.Description = "Start Sufian Panel - Design Studio Manager"
oShortcut.WindowStyle = 1  ' Normal window
oShortcut.Save

WScript.Echo "Shortcut created on Desktop: Sufian Panel"
