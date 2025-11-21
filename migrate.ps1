# Database Migration Script for Home Media Server (Windows)

$DB_CONTAINER = "media-server-db"
$DB_USER = "postgres"
$DB_NAME = "mediaserver"

Write-Host "🗄️  Database Migration Tool" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running" -ForegroundColor Red
    exit 1
}

# Check if database container exists
$containerExists = docker ps -a | Select-String $DB_CONTAINER
if (-not $containerExists) {
    Write-Host "❌ Error: Database container not found" -ForegroundColor Red
    Write-Host "Run 'docker-compose up -d' first" -ForegroundColor Yellow
    exit 1
}

# Check if database container is running
$containerRunning = docker ps | Select-String $DB_CONTAINER
if (-not $containerRunning) {
    Write-Host "⚠️  Database container is not running" -ForegroundColor Yellow
    Write-Host "Starting database..." -ForegroundColor Cyan
    docker-compose up -d postgres
    Write-Host "Waiting for database to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}

$command = $args[0]

switch ($command) {
    "init" {
        Write-Host "📋 Initializing database schema..." -ForegroundColor Cyan
        Get-Content "database\init.sql" | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME
        Write-Host "✅ Database initialized!" -ForegroundColor Green
    }
    
    "reset" {
        Write-Host "⚠️  WARNING: This will delete all data!" -ForegroundColor Yellow
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -ne "yes") {
            Write-Host "Cancelled." -ForegroundColor Yellow
            exit 0
        }
        Write-Host "🗑️  Dropping all tables..." -ForegroundColor Cyan
        docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        Write-Host "📋 Recreating schema..." -ForegroundColor Cyan
        Get-Content "database\init.sql" | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME
        Write-Host "✅ Database reset complete!" -ForegroundColor Green
    }
    
    "backup" {
        New-Item -ItemType Directory -Force -Path "backups" | Out-Null
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupFile = "backups\db-backup-$timestamp.sql"
        Write-Host "💾 Creating backup..." -ForegroundColor Cyan
        docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | Out-File -FilePath $backupFile -Encoding UTF8
        Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green
    }
    
    "restore" {
        $backupFile = $args[1]
        if (-not $backupFile) {
            Write-Host "Usage: .\migrate.ps1 restore <backup-file>" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Available backups:" -ForegroundColor Cyan
            Get-ChildItem "backups\db-backup-*.sql" -ErrorAction SilentlyContinue | Format-Table Name, Length, LastWriteTime
            exit 1
        }
        
        if (-not (Test-Path $backupFile)) {
            Write-Host "❌ Error: Backup file not found: $backupFile" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "⚠️  WARNING: This will overwrite current data!" -ForegroundColor Yellow
        $confirm = Read-Host "Continue? (yes/no)"
        if ($confirm -ne "yes") {
            Write-Host "Cancelled." -ForegroundColor Yellow
            exit 0
        }
        
        Write-Host "📥 Restoring from $backupFile..." -ForegroundColor Cyan
        Get-Content $backupFile | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME
        Write-Host "✅ Database restored!" -ForegroundColor Green
    }
    
    "shell" {
        Write-Host "🐚 Opening PostgreSQL shell..." -ForegroundColor Cyan
        Write-Host "Type \q to exit" -ForegroundColor Yellow
        docker exec -it $DB_CONTAINER psql -U $DB_USER $DB_NAME
    }
    
    "status" {
        Write-Host "📊 Database Status:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Container Status:" -ForegroundColor Yellow
        docker ps -a | Select-String $DB_CONTAINER
        Write-Host ""
        Write-Host "Tables:" -ForegroundColor Yellow
        docker exec $DB_CONTAINER psql -U $DB_USER $DB_NAME -c "\dt"
        Write-Host ""
        Write-Host "Media Count:" -ForegroundColor Yellow
        docker exec $DB_CONTAINER psql -U $DB_USER $DB_NAME -c "SELECT category, COUNT(*) FROM media GROUP BY category;"
    }
    
    default {
        Write-Host "Usage: .\migrate.ps1 {init|reset|backup|restore|shell|status}" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Cyan
        Write-Host "  init          - Initialize database schema"
        Write-Host "  reset         - Reset database (DELETES ALL DATA)"
        Write-Host "  backup        - Create database backup"
        Write-Host "  restore FILE  - Restore from backup file"
        Write-Host "  shell         - Open PostgreSQL shell"
        Write-Host "  status        - Show database status"
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Green
        Write-Host "  .\migrate.ps1 backup"
        Write-Host "  .\migrate.ps1 restore backups\db-backup-20240101-120000.sql"
        exit 1
    }
}
