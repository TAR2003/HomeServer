#!/bin/bash

# Debian Server Deployment Script
# Run this on your Debian server after pulling the latest code

echo "=================================="
echo "Home Media Server - Debian Deploy"
echo "=================================="
echo ""

# Stop existing containers
echo "1. Stopping existing containers..."
sudo docker compose down
echo ""

# Pull latest changes (if needed)
echo "2. Checking for updates..."
git status
echo ""

# Rebuild with no cache
echo "3. Building containers (this may take 5-10 minutes)..."
sudo docker compose build --no-cache
echo ""

# Start services
echo "4. Starting services..."
sudo docker compose up -d
echo ""

# Wait for services to start
echo "5. Waiting for services to start (30 seconds)..."
sleep 30
echo ""

# Check status
echo "6. Checking container status..."
sudo docker compose ps
echo ""

# Test health endpoint
echo "7. Testing backend health..."
curl -s http://localhost:8080/api/health || echo "Backend not responding yet..."
echo ""

# Show logs
echo "8. Showing recent logs..."
sudo docker compose logs --tail=20
echo ""

echo "=================================="
echo "Deployment Complete!"
echo "=================================="
echo ""
echo "Access your application at:"
echo "  http://YOUR_SERVER_IP"
echo ""
echo "To view live logs:"
echo "  sudo docker compose logs -f"
echo ""
echo "To check status:"
echo "  sudo docker compose ps"
echo ""
