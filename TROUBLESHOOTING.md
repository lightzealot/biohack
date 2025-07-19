# 🔧 Troubleshooting Guide - Familia Gómez De La Cruz Finance App

## Authentication Issues

### Issue: Double Login Prompt
**Symptoms:** Browser asks for authentication twice - first HTTP Basic popup, then custom login form

**Root Cause:** Conflicting authentication systems:
- HTTP Basic authentication in `middleware.ts`
- Custom React authentication in `app/page.tsx`

**Solution Applied:**
- Disabled HTTP Basic authentication middleware
- Only custom React login form is used now
- Single login experience maintained

### Login Credentials
Use the credentials defined in your `.env.local` file:
```env
NEXT_PUBLIC_STATIC_USERNAME=your_username
NEXT_PUBLIC_STATIC_PASSWORD=your_password
```

## Common Dependency Installation Issues

### Issue 1: Multiple Package Managers Conflict
**Symptoms:** Build fails with "dependency_installation script returned non-zero exit code: 1"

**Solution:**
```bash
# Remove conflicting lock files
rm -f bun.lock pnpm-lock.yaml yarn.lock
rm -rf node_modules
npm cache clean --force
npm install --legacy-peer-deps
```

### Issue 2: Node.js Version Incompatibility
**Symptoms:** Build fails with engine compatibility errors

**Solution:**
```bash
# Check Node.js version
node --version  # Should be 22.16.0 or later

# If version is incorrect, install the correct version
# Using nvm (recommended):
nvm install 22.16.0
nvm use 22.16.0
```

### Issue 3: Bun Interference (Windows)
**Symptoms:** Build fails even after npm install succeeds

**Solution:**
```powershell
# Use full npm path to bypass bun
& "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps
& "C:\Program Files\nodejs\npm.cmd" run build
```

### Issue 4: Peer Dependency Conflicts
**Symptoms:** npm install fails with peer dependency warnings

**Solution:**
```bash
# Install with legacy peer deps flag
npm install --legacy-peer-deps --no-fund --no-audit
```

## Quick Fixes

### For Development
```bash
# Start fresh development environment
npm run install:clean
npm run dev
```

### For Production Build
```bash
# Clean build process
npm run install:clean
npm run build
```

### For CI/CD Environments
```bash
# Use CI-optimized installation
npm ci --legacy-peer-deps
npm run build
```

## Automated Solutions

### Windows PowerShell
```powershell
# Run the automated deployment script
.\deploy.ps1 -Clean
```

### Linux/macOS Bash
```bash
# Run the automated deployment script
chmod +x deploy.sh
./deploy.sh
```

## Environment Verification

### Required Versions
- Node.js: 22.16.0+
- npm: 10.0.0+
- Operating System: Windows 10+, macOS 12+, Ubuntu 20.04+

### Required Environment Variables
Create `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STATIC_USERNAME=your_username
NEXT_PUBLIC_STATIC_PASSWORD=your_password
```

## Support

If issues persist:

1. **Check the logs:** Look for specific error messages in the terminal
2. **Clear everything:** Use the clean install script
3. **Verify environment:** Ensure Node.js and npm versions are correct
4. **Network issues:** Check internet connection and npm registry access

## Emergency Recovery

If the application is completely broken:

```bash
# Nuclear option - complete reset
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install --legacy-peer-deps --force
npm run build
```

## Performance Tips

1. Use `npm ci` in CI/CD environments
2. Enable npm cache for faster installs
3. Use `--legacy-peer-deps` to avoid conflicts
4. Keep dependencies up to date

## Contact Information

For technical support regarding the Familia Gómez De La Cruz Finance App:
- Repository: [Your Repository URL]
- Issues: [Your Issues URL]
- Documentation: [Your Docs URL]
