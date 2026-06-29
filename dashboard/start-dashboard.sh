#!/bin/bash

# Playwright BDD Test Execution Dashboard - Startup Script
# This script builds the frontend and starts the backend server

echo "=========================================="
echo "  Playwright BDD Dashboard Startup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Build Frontend
echo -e "${BLUE}Step 1: Building Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Running build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo -e "${GREEN}✓ Frontend build completed${NC}"
echo ""

# Step 2: Start Backend
echo -e "${BLUE}Step 2: Starting Backend Server...${NC}"
cd ../backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🚀 Dashboard is starting...${NC}"
echo "=========================================="
echo ""
echo "📊 Dashboard URL: http://localhost:3001"
echo "🔌 API Endpoint: http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start