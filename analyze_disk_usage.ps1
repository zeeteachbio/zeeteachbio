# Disk Usage Analyzer for D: Drive

Write-Host "Analyzing D: Drive Usage... This may take a few minutes." -ForegroundColor Cyan

$drive = "D:\"
$topLevelFolders = Get-ChildItem -Path $drive -Directory -ErrorAction SilentlyContinue

$results = @()

foreach ($folder in $topLevelFolders) {
    Write-Host "Scanning $($folder.FullName)..." -NoNewline
    try {
        $size = (Get-ChildItem -Path $folder.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $sizeGB = [math]::Round($size / 1GB, 2)
        $results += [PSCustomObject]@{
            Folder = $folder.FullName
            SizeGB = $sizeGB
        }
        Write-Host " $sizeGB GB" -ForegroundColor Green
    } catch {
        Write-Host " Access Denied or Error" -ForegroundColor Red
    }
}

Write-Host "`nTop Folders by Size:" -ForegroundColor Cyan
$results | Sort-Object SizeGB -Descending | Format-Table -AutoSize

Write-Host "`nChecking for recently modified files (last 7 days) in likely installation paths..." -ForegroundColor Cyan
# Check common install locations for recent activity
$checkPaths = @("D:\Program Files", "D:\Program Files (x86)", "D:\AndroidProjects", "D:\antigravity projects")

foreach ($path in $checkPaths) {
    if (Test-Path $path) {
        Write-Host "Checking $path..." -ForegroundColor Yellow
        Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue | 
            Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-7) } | 
            Sort-Object Length -Descending | 
            Select-Object -First 10 Name, Directory, @{Name="Size(MB)";Expression={[math]::Round($_.Length / 1MB, 2)}}, LastWriteTime |
            Format-Table -AutoSize
    }
}

Write-Host "Analysis Complete." -ForegroundColor Green
Pause
