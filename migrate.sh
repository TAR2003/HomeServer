#!/bin/bash

# Database Migration Script for Home Media Server

DB_CONTAINER="media-server-db"
DB_USER="postgres"
DB_NAME="mediaserver"

echo "🗄️  Database Migration Tool"
echo "=========================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    exit 1
fi

# Check if database container exists
if ! docker ps -a | grep -q $DB_CONTAINER; then
    echo "❌ Error: Database container not found"
    echo "Run 'docker-compose up -d' first"
    exit 1
fi

# Check if database container is running
if ! docker ps | grep -q $DB_CONTAINER; then
    echo "⚠️  Database container is not running"
    echo "Starting database..."
    docker-compose up -d postgres
    echo "Waiting for database to be ready..."
    sleep 5
fi

case "$1" in
    init)
        echo "📋 Initializing database schema..."
        docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME < database/init.sql
        echo "✅ Database initialized!"
        ;;
    
    reset)
        echo "⚠️  WARNING: This will delete all data!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Cancelled."
            exit 0
        fi
        echo "🗑️  Dropping all tables..."
        docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        echo "📋 Recreating schema..."
        docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME < database/init.sql
        echo "✅ Database reset complete!"
        ;;
    
    backup)
        mkdir -p backups
        BACKUP_FILE="backups/db-backup-$(date +%Y%m%d-%H%M%S).sql"
        echo "💾 Creating backup..."
        docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE
        echo "✅ Backup created: $BACKUP_FILE"
        ;;
    
    restore)
        if [ -z "$2" ]; then
            echo "Usage: $0 restore <backup-file>"
            echo ""
            echo "Available backups:"
            ls -lh backups/db-backup-*.sql 2>/dev/null || echo "No backups found"
            exit 1
        fi
        
        if [ ! -f "$2" ]; then
            echo "❌ Error: Backup file not found: $2"
            exit 1
        fi
        
        echo "⚠️  WARNING: This will overwrite current data!"
        read -p "Continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Cancelled."
            exit 0
        fi
        
        echo "📥 Restoring from $2..."
        docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME < $2
        echo "✅ Database restored!"
        ;;
    
    shell)
        echo "🐚 Opening PostgreSQL shell..."
        echo "Type \\q to exit"
        docker exec -it $DB_CONTAINER psql -U $DB_USER $DB_NAME
        ;;
    
    status)
        echo "📊 Database Status:"
        echo ""
        echo "Container Status:"
        docker ps -a | grep $DB_CONTAINER
        echo ""
        echo "Tables:"
        docker exec $DB_CONTAINER psql -U $DB_USER $DB_NAME -c "\\dt"
        echo ""
        echo "Media Count:"
        docker exec $DB_CONTAINER psql -U $DB_USER $DB_NAME -c "SELECT category, COUNT(*) FROM media GROUP BY category;"
        ;;
    
    *)
        echo "Usage: $0 {init|reset|backup|restore|shell|status}"
        echo ""
        echo "Commands:"
        echo "  init          - Initialize database schema"
        echo "  reset         - Reset database (DELETES ALL DATA)"
        echo "  backup        - Create database backup"
        echo "  restore FILE  - Restore from backup file"
        echo "  shell         - Open PostgreSQL shell"
        echo "  status        - Show database status"
        echo ""
        echo "Examples:"
        echo "  $0 backup"
        echo "  $0 restore backups/db-backup-20240101-120000.sql"
        exit 1
        ;;
esac
