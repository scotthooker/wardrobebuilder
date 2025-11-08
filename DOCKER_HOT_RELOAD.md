# Docker Hot Reload Configuration

This document explains the hot reload setup for the Wardrobe Builder application in Docker development environment.

## Overview

The application uses a comprehensive hot reload system that combines:
1. **Vite HMR** - Instant frontend updates for JavaScript/TypeScript/CSS changes
2. **TypeScript Watch Mode** - Real-time type checking as you code
3. **Nodemon** - Backend API auto-restart on file changes

## Frontend Hot Reload

### How It Works

The frontend container runs two processes concurrently using `concurrently`:

```bash
npm run dev:docker
```

This executes:
- **TypeScript Compiler** (`tsc --noEmit --watch`) - Watches for type errors
- **Vite Dev Server** - Serves the app with Hot Module Replacement (HMR)

### What Triggers Reload?

**Instant HMR (no page refresh):**
- React component changes (`.tsx`, `.ts`)
- CSS changes (`.css`)
- Style updates in components

**Full page reload:**
- Configuration file changes (`vite.config.ts`, `tailwind.config.js`)
- HTML changes (`index.html`)
- Environment variable changes

### TypeScript Watch Output

The TypeScript compiler runs in watch mode with colored output:
- **Blue** label for TSC output
- **Green** label for VITE output
- Type errors appear immediately in the console
- Uses `--preserveWatchOutput` to keep previous errors visible

## Backend Hot Reload

### How It Works

The API container uses `nodemon` to watch for changes:

```bash
npm run server:dev
```

### What Triggers Restart?

- JavaScript file changes in `server/` directory
- Changes to `package.json`
- Database connection changes

### Nodemon Configuration

File: `nodemon.json` (if exists) or inline configuration in `package.json`

```json
{
  "watch": ["server"],
  "ext": "js,json",
  "ignore": ["node_modules", "public"],
  "delay": "1000"
}
```

## Docker Compose Configuration

### Mounted Volumes for Hot Reload

```yaml
app:
  volumes:
    - ./src:/app/src                    # React source code
    - ./public:/app/public              # Static assets
    - ./tsconfig.json:/app/tsconfig.json # TypeScript config
    - ./vite.config.ts:/app/vite.config.ts # Vite config
    - ./tailwind.config.js:/app/tailwind.config.js # Tailwind config
    - node_modules:/app/node_modules    # Named volume for dependencies
```

**Why named volumes for `node_modules`?**
- Prevents conflicts between host and container dependencies
- Faster performance (Docker-managed volume)
- Avoids platform-specific binary issues (e.g., macOS vs Linux)

## Development Workflow

### Starting the Stack

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app  # Frontend logs with TypeScript errors
docker-compose logs -f api  # Backend API logs
docker-compose logs -f db   # Database logs

# Restart specific service
docker-compose restart app
docker-compose restart api
```

### Making Changes

1. **Edit TypeScript/React files** - Save and see instant HMR
2. **Check terminal** - TypeScript errors appear in blue TSC output
3. **Fix errors** - Type errors disappear automatically when fixed
4. **Backend changes** - API automatically restarts via nodemon

### Stopping the Stack

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

## Production vs Development

### Development (Docker)
- Uses `npm run dev:docker` with TypeScript watch
- All source files mounted for live reload
- Two concurrent processes: TSC + Vite
- Colored console output for debugging
- `NODE_ENV=development`

### Production (Vercel)
- Uses `npm run vercel-build` (Vite only)
- Pre-compiled TypeScript (runs `tsc` once before build)
- Optimized bundle with code splitting
- No watch mode or hot reload
- `NODE_ENV=production`

## Troubleshooting

### Hot Reload Not Working

1. **Check container logs:**
   ```bash
   docker-compose logs -f app
   ```

2. **Verify mounted volumes:**
   ```bash
   docker-compose exec app ls -la /app/src
   ```

3. **Restart the service:**
   ```bash
   docker-compose restart app
   ```

4. **Check file permissions:**
   ```bash
   ls -la src/  # Should be readable
   ```

### TypeScript Errors Not Showing

1. Ensure `tsconfig.json` is mounted:
   ```bash
   docker-compose exec app cat /app/tsconfig.json
   ```

2. Check if `tsc` is running:
   ```bash
   docker-compose exec app ps aux | grep tsc
   ```

### Port Conflicts

If port 5173 is already in use:
```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "5174:5173"  # Host:5174 -> Container:5173
```

### Node Modules Issues

If dependencies are out of sync:
```bash
# Rebuild node_modules volume
docker-compose down -v
docker-compose up -d
```

## Performance Tips

1. **Use .dockerignore** - Excludes unnecessary files from context
2. **Named volumes** - Faster than bind mounts for `node_modules`
3. **Minimal mounts** - Only mount files that need hot reload
4. **Resource limits** - Set CPU/memory limits if needed

## Scripts Reference

### Package.json Scripts

```json
{
  "dev": "vite",                          // Local development (no Docker)
  "dev:docker": "concurrently ...",       // Docker development with TSC watch
  "tsc:watch": "tsc --noEmit --watch",    // TypeScript watch mode
  "server:dev": "nodemon server/index.js", // Backend hot reload
  "build": "tsc && vite build"            // Production build
}
```

### Docker Commands

```bash
# Start development
docker-compose up -d

# View specific logs
docker-compose logs -f app | grep "TSC"   # TypeScript errors
docker-compose logs -f app | grep "VITE"  # Vite output

# Shell into container
docker-compose exec app sh
docker-compose exec api sh

# Clean restart
docker-compose down -v && docker-compose up -d
```

## Features

✅ **Instant HMR** - React changes reflect immediately
✅ **TypeScript Watch** - Real-time type checking in Docker
✅ **Backend Auto-restart** - Express server restarts on changes
✅ **Colored Output** - Easy to distinguish TSC vs Vite logs
✅ **Production-ready** - Hot reload disabled in Vercel builds
✅ **Fast Performance** - Named volumes for dependencies
✅ **Easy Debugging** - Clear console output with process labels

## Next Steps

- Consider adding ESLint watch mode for linting on save
- Add Prettier formatting on file save
- Configure Vite plugins for additional features
- Set up VSCode Dev Containers for full IDE integration
