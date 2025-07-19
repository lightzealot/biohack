#!/bin/bash
# Deployment script for Familia Gómez De La Cruz Finance App
# This script ensures reliable dependency installation and build process

set -e  # Exit on any error

echo "🚀 Starting deployment for Familia Gómez De La Cruz Finance App..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

# Check npm version
echo "📋 Checking npm version..."
npm_version=$(npm --version)
echo "npm version: $npm_version"

# Clean up previous installations
echo "🧹 Cleaning up previous installations..."
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lock*
rm -f pnpm-lock.yaml
rm -f yarn.lock

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-fund --no-audit

# Verify installation
echo "✅ Verifying installation..."
if [ ! -d "node_modules" ]; then
    echo "❌ Error: node_modules directory not found!"
    exit 1
fi

# Run linting
echo "🔍 Running linting..."
npm run lint --silent || echo "⚠️ Linting warnings found, but continuing..."

# Build the application
echo "🏗️ Building the application..."
npm run build

echo "✅ Deployment completed successfully!"
echo "🎉 Familia Gómez De La Cruz Finance App is ready!"

# Display build information
echo ""
echo "📊 Build Summary:"
echo "- Node.js: $node_version"
echo "- npm: $npm_version"
echo "- Build completed at: $(date)"
echo ""
echo "🚀 To start the application:"
echo "  Development: npm run dev"
echo "  Production:  npm run start"
