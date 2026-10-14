Add-Type -AssemblyName System.Drawing
$bitmap = [System.Drawing.Bitmap]::new(64,64)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)
$path = [System.Drawing.Drawing2D.GraphicsPath]::new()
foreach ($arc in @(@(0,0,24,24,180),@(39,0,24,24,270),@(39,39,24,24,0),@(0,39,24,24,90))) {
    $path.AddArc($arc[0],$arc[1],$arc[2],$arc[3],$arc[4],90)
}
$path.CloseFigure()
$brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(0,0),[System.Drawing.Point]::new(64,64),[System.Drawing.Color]::FromArgb(139,122,247),[System.Drawing.Color]::FromArgb(81,75,211))
$graphics.FillPath($brush,$path)
$pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White,4)
$graphics.DrawLines($pen,[System.Drawing.Point[]]@([System.Drawing.Point]::new(23,24),[System.Drawing.Point]::new(23,43),[System.Drawing.Point]::new(41,43)))
$graphics.DrawLine($pen,31,34,45,20)
$graphics.DrawLines($pen,[System.Drawing.Point[]]@([System.Drawing.Point]::new(35,20),[System.Drawing.Point]::new(45,20),[System.Drawing.Point]::new(45,30)))
$icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
$stream = [System.IO.File]::Create((Join-Path $PSScriptRoot 'app.ico'))
$icon.Save($stream)
$stream.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
