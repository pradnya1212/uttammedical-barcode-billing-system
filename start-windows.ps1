$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$web = Join-Path $root "web"

if (-not (Test-Path (Join-Path $backend "pom.xml"))) {
    throw "Backend pom.xml not found: $backend"
}
if (-not (Test-Path (Join-Path $web "package.json"))) {
    throw "Website package.json not found: $web"
}

$envLines = @()
foreach ($name in @("DB_URL", "DB_USERNAME", "DB_PASSWORD")) {
    $value = [Environment]::GetEnvironmentVariable($name, "Process")
    if ($value) { $envLines += "`$env:$name = '$($value.Replace("'", "''"))'" }
}
$envSetup = if ($envLines.Count -gt 0) { ($envLines -join "; ") + "; " } else { "" }

# Locate Maven
$mvnCmd = "mvn"
if (-not (Get-Command "mvn" -ErrorAction SilentlyContinue)) {
    $ideaMaven = "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"
    if (Test-Path $ideaMaven) {
        $mvnCmd = "& `"$ideaMaven`""
    } else {
        $found = Get-ChildItem -Path "C:\Program Files\JetBrains" -Recurse -Filter "mvn.cmd" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
        if ($found) {
            $mvnCmd = "& `"$found`""
        }
    }
}

$backendCommand = "Set-Location '$backend'; $envSetup$mvnCmd spring-boot:run"
$webCommand = "Set-Location '$web'; npm run dev"

Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $backendCommand
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $webCommand

Write-Host "Started backend and website in separate PowerShell windows."
Write-Host "Backend: http://localhost:8086"
Write-Host "Admin Portal: http://localhost:5173"
Write-Host "Customer Store: http://localhost:5173/store.html"
