#!/bin/bash

# SecureLicense Pro Startup Script
echo "🚀 Starting SecureLicense Pro..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
fi

# Check if database exists, if not run setup
if [ ! -f "licenses.db" ]; then
    echo "🔧 Setting up sample data..."
    node admin-setup.js
    if [ $? -ne 0 ]; then
        echo "⚠️  Sample data setup failed, but continuing..."
    else
        echo "✅ Sample data setup completed"
    fi
fi

# Start the server
echo "🌐 Starting server on port 3000..."
echo "📱 Open http://localhost:3000 to access the application"
echo "🛑 Press Ctrl+C to stop the server"

npm start
