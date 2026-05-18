$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173
$listener = [System.Net.Sockets.TcpListener]::new([Net.IPAddress]::Parse("127.0.0.1"), $port)
$listener.Start()
Write-Host "Serving $root at http://127.0.0.1:$port/"

function Get-ContentType($filePath) {
  $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
  switch ($extension) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "application/javascript; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = [IO.StreamReader]::new($stream)
    $requestLine = $reader.ReadLine()

    while ($reader.Peek() -gt -1) {
      $line = $reader.ReadLine()
      if ([string]::IsNullOrEmpty($line)) { break }
    }

    $target = "index.html"
    if ($requestLine -match "GET\s+([^\s]+)") {
      $target = [Uri]::UnescapeDataString($matches[1]).TrimStart("/")
      if ([string]::IsNullOrWhiteSpace($target)) {
        $target = "index.html"
      }
    }

    $safeTarget = $target -replace "/", "\"
    $filePath = Join-Path $root $safeTarget
    $resolvedRoot = [IO.Path]::GetFullPath($root)
    $resolvedFile = [IO.Path]::GetFullPath($filePath)

    if (-not $resolvedFile.StartsWith($resolvedRoot) -or -not (Test-Path -LiteralPath $resolvedFile -PathType Leaf)) {
      $body = [Text.Encoding]::UTF8.GetBytes("Not found")
      $header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nContent-Type: text/plain; charset=utf-8`r`nConnection: close`r`n`r`n"
    } else {
      $body = [IO.File]::ReadAllBytes($resolvedFile)
      $type = Get-ContentType $resolvedFile
      $header = "HTTP/1.1 200 OK`r`nContent-Length: $($body.Length)`r`nContent-Type: $type`r`nConnection: close`r`n`r`n"
    }

    $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($body, 0, $body.Length)
    $stream.Close()
    $client.Close()
  }
} finally {
  $listener.Stop()
}
