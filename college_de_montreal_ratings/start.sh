#!/bin/bash

# College de Montreal Teacher Ratings - Startup Script

echo "🎓 College de Montreal Teacher Ratings Platform"
echo "=============================================="
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install it first."
    exit 1
fi

echo "✓ Python 3 is installed"

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install it first."
    exit 1
fi

echo "✓ pip3 is installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt
echo ""

# Create necessary directories
mkdir -p instance

echo "🚀 Starting the application..."
echo ""
echo "The website will be available at:"
echo "  ➤ http://localhost:5000"
echo ""

# Get the local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ ! -z "$LOCAL_IP" ]; then
    echo "Other devices on your network can access at:"
    echo "  ➤ http://$LOCAL_IP:5000"
    echo ""
fi

echo "Admin Credentials:"
echo "  Username: devstral"
echo "  Password: jebogy84"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================="
echo ""

# Start the application
python3 app.py
