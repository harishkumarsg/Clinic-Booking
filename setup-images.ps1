# Image Setup Script for Dr. Sindhu's Clinic Booking App
# This script helps you set up the required images

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Dr. Sindhu's Clinic - Image Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$publicFolder = Join-Path $PSScriptRoot "public"
$logoFile = Join-Path $publicFolder "clinic-logo.png"
$doctorFile = Join-Path $publicFolder "doctor-sindhu.jpg"

# Check if public folder exists
if (!(Test-Path $publicFolder)) {
    Write-Host "Creating public folder..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $publicFolder | Out-Null
}

# Check for clinic logo
Write-Host "Checking for clinic logo..." -ForegroundColor White
if (Test-Path $logoFile) {
    $logoSize = (Get-Item $logoFile).Length / 1KB
    Write-Host "[OK] clinic-logo.png found ($([math]::Round($logoSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "[MISSING] clinic-logo.png NOT FOUND" -ForegroundColor Red
    Write-Host "  Please save the clinic logo as: $logoFile" -ForegroundColor Yellow
}

Write-Host ""

# Check for doctor photo
Write-Host "Checking for doctor photo..." -ForegroundColor White
if (Test-Path $doctorFile) {
    $doctorSize = (Get-Item $doctorFile).Length / 1KB
    Write-Host "[OK] doctor-sindhu.jpg found ($([math]::Round($doctorSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "[MISSING] doctor-sindhu.jpg NOT FOUND" -ForegroundColor Red
    Write-Host "  Please save the doctor photo as: $doctorFile" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan

# Summary
$allFilesPresent = (Test-Path $logoFile) -and (Test-Path $doctorFile)

if ($allFilesPresent) {
    Write-Host "[SUCCESS] All images are ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: pnpm dev" -ForegroundColor White
    Write-Host "2. Open: http://localhost:3000" -ForegroundColor White
    Write-Host "3. Check the header for the logo and hero screen for doctor photo" -ForegroundColor White
} else {
    Write-Host "[ACTION REQUIRED] Please add the missing images" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To complete the setup:" -ForegroundColor White
    Write-Host "1. Save the clinic logo image as: clinic-logo.png" -ForegroundColor White
    Write-Host "2. Save the doctor photo image as: doctor-sindhu.jpg" -ForegroundColor White
    Write-Host "3. Place both files in the 'public' folder" -ForegroundColor White
    Write-Host "4. Run this script again to verify" -ForegroundColor White
    Write-Host ""
    Write-Host "Public folder location:" -ForegroundColor Cyan
    Write-Host $publicFolder -ForegroundColor White
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
