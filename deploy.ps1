# PowerShell Deployment Script for Familia Gómez De La Cruz Finance App
# This script ensures reliable dependency installation and build process on Windows

param(
    [switch]$Clean = $false,
    [switch]$SkipLint = $false
)

Write-Host "🚀 Starting deployment for Familia Gómez De La Cruz Finance App..." -ForegroundColor Green

# Function to handle errors
function Handle-Error {
    param([string]$Message)
    Write-Host "❌ Error: $Message" -ForegroundColor Red
    exit 1
}

# Check Node.js version
Write-Host "📋 Checking Node.js version..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Yellow
} catch {
    Handle-Error "Node.js not found. Please install Node.js 22.16.0 or later."
}

# Check npm version
Write-Host "📋 Checking npm version..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Yellow
} catch {
    Handle-Error "npm not found. Please ensure npm is installed."
}

# Clean up previous installations if requested or if build fails
if ($Clean -or (Test-Path "node_modules" -and -not (Test-Path "node_modules/.package-lock.json"))) {
    Write-Host "🧹 Cleaning up previous installations..." -ForegroundColor Cyan
    
    if (Test-Path "node_modules") {
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "bun.lock*") {
        Remove-Item -Path "bun.lock*" -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "pnpm-lock.yaml") {
        Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "yarn.lock") {
        Remove-Item -Path "yarn.lock" -Force -ErrorAction SilentlyContinue
    }
    
    # Clear npm cache
    Write-Host "🗑️ Clearing npm cache..." -ForegroundColor Cyan
    npm cache clean --force
}

# Install dependencies using full npm path to avoid bun interference
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
try {
    & "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps --no-fund --no-audit
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Handle-Error "Failed to install dependencies. Check your internet connection and try again."
}

# Verify installation
Write-Host "✅ Verifying installation..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Handle-Error "node_modules directory not found after installation!"
}

# Run linting unless skipped
if (-not $SkipLint) {
    Write-Host "🔍 Running linting..." -ForegroundColor Cyan
    try {
        & "C:\Program Files\nodejs\npm.cmd" run lint --silent
        Write-Host "✅ Linting passed!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Linting warnings found, but continuing..." -ForegroundColor Yellow
    }
}

# Build the application
Write-Host "🏗️ Building the application..." -ForegroundColor Cyan
try {
    & "C:\Program Files\nodejs\npm.cmd" run build
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
} catch {
    Handle-Error "Build failed. Check the error messages above."
}

Write-Host "🎉 Familia Gómez De La Cruz Finance App deployment completed!" -ForegroundColor Green

# Display build information
Write-Host ""
Write-Host "📊 Build Summary:" -ForegroundColor Cyan
Write-Host "- Node.js: $nodeVersion" -ForegroundColor White
Write-Host "- npm: $npmVersion" -ForegroundColor White
Write-Host "- Build completed at: $(Get-Date)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Green
Write-Host "  Development: npm run dev" -ForegroundColor White
Write-Host "  Production:  npm run start" -ForegroundColor White