$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$sourcePath = Join-Path $projectRoot 'public/assets/chess/storm-commander/factions/pirate/queen.png'
$outputPath = Join-Path $projectRoot 'public/favicon.ico'

Add-Type -AssemblyName System.Drawing

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
$bitmap = New-Object System.Drawing.Bitmap 256, 256
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$pngStream = New-Object System.IO.MemoryStream
$writer = $null

try {
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.DrawImage($sourceImage, 0, 0, 256, 256)
  $bitmap.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)

  $pngBytes = $pngStream.ToArray()
  $writer = New-Object System.IO.BinaryWriter([System.IO.File]::Open($outputPath, [System.IO.FileMode]::Create))

  $writer.Write([UInt16]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]1)
  $writer.Write([Byte]0)
  $writer.Write([Byte]0)
  $writer.Write([Byte]0)
  $writer.Write([Byte]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]32)
  $writer.Write([UInt32]$pngBytes.Length)
  $writer.Write([UInt32]22)
  $writer.Write($pngBytes)
} finally {
  if ($writer) {
    $writer.Dispose()
  }
  $pngStream.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
  $sourceImage.Dispose()
}
