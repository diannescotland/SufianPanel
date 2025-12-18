# Sufian Panel - Desktop Shortcut Creator
# Run this script once to create a desktop shortcut

param(
    [string]$ShortcutName = "Sufian Panel",
    [switch]$Force
)

# Get paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LauncherPath = Join-Path $ScriptDir "launch.bat"
$IconPath = Join-Path $ScriptDir "app.ico"
$FaviconPath = Join-Path $ScriptDir "frontend\src\app\favicon.ico"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "$ShortcutName.lnk"

Write-Host ""
Write-Host "========================================"
Write-Host "  SUFIAN PANEL - Shortcut Creator"
Write-Host "========================================"
Write-Host ""

# Check if launcher exists
if (-not (Test-Path $LauncherPath)) {
    Write-Host "[ERROR] launch.bat not found at: $LauncherPath" -ForegroundColor Red
    Write-Host "Please create launch.bat first." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if shortcut already exists
if ((Test-Path $ShortcutPath) -and (-not $Force)) {
    Write-Host "[WARNING] Shortcut already exists: $ShortcutPath" -ForegroundColor Yellow
    $response = Read-Host "Overwrite? (Y/N)"
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Cancelled."
        exit 0
    }
}

# Determine icon to use
$IconToUse = $null
if (Test-Path $IconPath) {
    $IconToUse = $IconPath
    Write-Host "[INFO] Using custom icon: $IconPath" -ForegroundColor Cyan
} elseif (Test-Path $FaviconPath) {
    $IconToUse = $FaviconPath
    Write-Host "[INFO] Using favicon: $FaviconPath" -ForegroundColor Cyan
} else {
    Write-Host "[INFO] No custom icon found, using default." -ForegroundColor Yellow
}

# Create the shortcut
Write-Host ""
Write-Host "Creating shortcut..." -ForegroundColor Green

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)

    # Set shortcut properties
    $Shortcut.TargetPath = $LauncherPath
    $Shortcut.WorkingDirectory = $ScriptDir
    $Shortcut.Description = "Launch Sufian Panel Design Studio"
    $Shortcut.WindowStyle = 1  # Normal window

    # Set icon if available
    if ($IconToUse) {
        $Shortcut.IconLocation = "$IconToUse,0"
    }

    # Save the shortcut
    $Shortcut.Save()

    # Release COM object
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($WshShell) | Out-Null

    Write-Host ""
    Write-Host "========================================"
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Shortcut created at:"
    Write-Host "  $ShortcutPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now double-click the shortcut on your desktop"
    Write-Host "to launch Sufian Panel!"
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to create shortcut: $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Read-Host "Press Enter to close"
