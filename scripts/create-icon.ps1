Add-Type -AssemblyName System.Drawing

$iconDir = Join-Path $PSScriptRoot "..\src-tauri\icons"
if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force
}

$bmp = New-Object System.Drawing.Bitmap(256, 256)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Background - indigo/purple gradient
$g.Clear([System.Drawing.Color]::FromArgb(99, 102, 241))

# White circle
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillEllipse($brush, 50, 50, 156, 156)

# Timer icon (simple clock hands)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(99, 102, 241), 12)
$g.DrawLine($pen, 128, 128, 128, 80)
$g.DrawLine($pen, 128, 128, 168, 128)

$g.Dispose()
$brush.Dispose()
$pen.Dispose()

$iconPath = Join-Path $iconDir "icon.png"
$bmp.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "Created icon at: $iconPath"
