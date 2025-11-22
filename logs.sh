#!/bin/bash

echo "========================================"
echo "  Home Media Server - View Logs"
echo "========================================"
echo ""
echo "Choose a service to view logs:"
echo "1. All services"
echo "2. Backend only"
echo "3. Frontend only"
echo "4. Nginx only"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        docker-compose logs -f
        ;;
    2)
        docker-compose logs -f backend
        ;;
    3)
        docker-compose logs -f frontend
        ;;
    4)
        docker-compose logs -f nginx
        ;;
    *)
        echo "Invalid choice!"
        ;;
esac
