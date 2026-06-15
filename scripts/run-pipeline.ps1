# SnapMarket Pipeline — runs every 6 hours via Windows Task Scheduler
# Schedule: schtasks /create /tn "SnapMarket Pipeline" /tr "powershell -File C:\Users\Snaphomz\Snaphomz\AI_search\snapsignal\scripts\run-pipeline.ps1" /sc hourly /mo 6 /f

$url = "http://localhost:3002/api/cron/collect?secret=snapsignal-cron"
$logFile = "$PSScriptRoot\pipeline.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 120
    Add-Content $logFile "[$timestamp] SUCCESS: $($response | ConvertTo-Json -Compress)"
} catch {
    Add-Content $logFile "[$timestamp] ERROR: $($_.Exception.Message)"
}
