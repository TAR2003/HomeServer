#!/bin/bash

echo "========================================"
echo "  Home Media Server - Clean Restart"
echo "========================================"
echo ""
echo "WARNING: This will remove all volumes and data!"
echo ""
read -p "Are you sure? (y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo ""
    echo "Stopping services and removing volumes..."
    docker-compose down -v
    
    echo ""
    echo "Rebuilding and starting..."
    docker-compose up --build
else
    echo ""
    echo "Operation cancelled."
fi
