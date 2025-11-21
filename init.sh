#!/bin/bash

# Home Media Server Initialization Script

echo "🚀 Initializing Home Media Server..."

# Create media directories
echo "📁 Creating media directories..."
mkdir -p media/images-videos
mkdir -p media/movies
mkdir -p media/series
mkdir -p media/thumbnails

# Set permissions
chmod -R 755 media/

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual configuration!"
fi

echo "✅ Initialization complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your configuration"
echo "2. Run 'docker-compose up -d' to start the server"
echo "3. Access the application at http://localhost"
