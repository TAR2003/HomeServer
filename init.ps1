# Home Media Server Initialization Script (Windows)

Write-Host "🚀 Initializing Home Media Server..." -ForegroundColor Green

# Create media directories
Write-Host "📁 Creating media directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "media\images-videos" | Out-Null
New-Item -ItemType Directory -Force -Path "media\movies" | Out-Null
New-Item -ItemType Directory -Force -Path "media\series" | Out-Null
New-Item -ItemType Directory -Force -Path "media\thumbnails" | Out-Null

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please update .env with your actual configuration!" -ForegroundColor Yellow
}

Write-Host "✅ Initialization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Update the .env file with your configuration" -ForegroundColor White
Write-Host "2. Run 'docker-compose up -d' to start the server" -ForegroundColor White
Write-Host "3. Access the application at http://localhost" -ForegroundColor White
