Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Starting OmniStore BOPIS Platform (.NET + Next.js)     " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend API
Write-Host "`n[1/2] Launching ASP.NET Core 8 Web API on http://localhost:5050..." -ForegroundColor Green
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; dotnet run" -PassThru

# Wait 3 seconds for API initialization
Start-Sleep -Seconds 3

# Start Next.js Frontend
Write-Host "[2/2] Launching Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend\bopis-retail-web'; npm run dev" -PassThru

Write-Host "`nApplication launched successfully!" -ForegroundColor Cyan
Write-Host "-> Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "-> API Docs:  http://localhost:5050/swagger" -ForegroundColor White
Write-Host "`nPress Enter to close this launcher script (servers will continue running in their windows)."
Read-Host
