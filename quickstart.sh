#!/bin/bash

echo "🚀 Devsquare Quick Start Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo ""
    echo "⚠️  npm is not installed. Installing npm..."
    echo ""

    # Detect OS and install npm
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        echo "Detected Debian/Ubuntu system"
        echo "Running: sudo apt-get update && sudo apt-get install -y npm"
        sudo apt-get update && sudo apt-get install -y npm
    elif [ -f /etc/arch-release ]; then
        # Arch Linux
        echo "Detected Arch Linux system"
        echo "Running: sudo pacman -S npm --noconfirm"
        sudo pacman -S npm --noconfirm
    elif [ -f /etc/fedora-release ]; then
        # Fedora
        echo "Detected Fedora system"
        echo "Running: sudo dnf install -y npm"
        sudo dnf install -y npm
    else
        echo "❌ Could not detect OS. Please install npm manually."
        echo ""
        echo "For more information, visit: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm"
        exit 1
    fi

    if npm --version &> /dev/null; then
        echo "✓ npm installed successfully! Version: $(npm --version)"
    else
        echo "❌ Failed to install npm. Please install manually."
        exit 1
    fi
else
    echo "✓ npm version: $(npm --version)"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Dependencies installed successfully!"
    echo ""
    echo "🎉 Ready to start Devsquare!"
    echo ""
    echo "Run the following command to start the development server:"
    echo ""
    echo "    npm run dev"
    echo ""
    echo "Then open http://localhost:3000 in your browser"
else
    echo ""
    echo "❌ Failed to install dependencies"
    exit 1
fi
