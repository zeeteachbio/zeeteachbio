# Android Studio Cleanup Script

Write-Host "Starting Android Studio Cleanup..." -ForegroundColor Cyan

# 1. Check for Android Studio Uninstaller
$uninstallPath = "C:\Program Files\Android\Android Studio\uninstall.exe"
if (Test-Path $uninstallPath) {
    Write-Host "Found Android Studio Uninstaller at: $uninstallPath" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to run the uninstaller now? (y/n)"
    if ($choice -eq 'y') {
        Start-Process -FilePath $uninstallPath -Wait
        Write-Host "Uninstaller finished." -ForegroundColor Green
    } else {
        Write-Host "Skipping uninstaller. Please uninstall manually via Settings > Apps." -ForegroundColor Gray
    }
} else {
    Write-Host "Android Studio uninstaller not found in default location." -ForegroundColor Yellow
    Write-Host "Please ensure Android Studio is uninstalled via Settings > Apps."
}

# 2. Remove Android SDK
$sdkPath = "$env:LOCALAPPDATA\Android"
if (Test-Path $sdkPath) {
    Write-Host "Found Android SDK at: $sdkPath" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to DELETE the Android SDK folder? (y/n)"
    if ($choice -eq 'y') {
        Write-Host "Deleting Android SDK... This may take a while." -ForegroundColor Cyan
        Remove-Item -Path $sdkPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Android SDK deleted." -ForegroundColor Green
    }
}

# 3. Remove .android folder (AVDs, keystores)
$androidConfigPath = "$env:USERPROFILE\.android"
if (Test-Path $androidConfigPath) {
    Write-Host "Found .android config folder at: $androidConfigPath" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to DELETE the .android folder? (y/n)"
    if ($choice -eq 'y') {
        Remove-Item -Path $androidConfigPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host ".android folder deleted." -ForegroundColor Green
    }
}

# 4. Remove .gradle folder (Caches)
$gradlePath = "$env:USERPROFILE\.gradle"
if (Test-Path $gradlePath) {
    Write-Host "Found .gradle cache folder at: $gradlePath" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to DELETE the .gradle folder? (y/n)"
    if ($choice -eq 'y') {
        Write-Host "Deleting .gradle folder... This may take a while." -ForegroundColor Cyan
        Remove-Item -Path $gradlePath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host ".gradle folder deleted." -ForegroundColor Green
    }
}

# 5. Reminder for Projects
Write-Host "`n--------------------------------------------------" -ForegroundColor White
Write-Host "IMPORTANT: Project Cleanup" -ForegroundColor Cyan
Write-Host "Please manually check your projects folder (e.g., D:\AndroidProjects)."
Write-Host "Delete any unwanted projects (like 'Match Survival Fun')."
Write-Host "KEEP 'ZeeTeachBio' if you want to preserve it."
Write-Host "--------------------------------------------------" -ForegroundColor White

Write-Host "Cleanup script completed." -ForegroundColor Green
Pause
