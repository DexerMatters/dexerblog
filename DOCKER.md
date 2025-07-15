# Docker Deployment Guide

This project includes Docker configuration to run both the Next.js frontend and Express.js backend in a single container.

## Prerequisites

Make sure you have Docker with BuildKit support installed. If you see legacy builder warnings, install buildx:

```bash
# Check if buildx is available
docker buildx version

# If not available, install Docker Desktop (includes buildx) or install buildx plugin
# For Linux: sudo apt-get install docker-buildx-plugin
```

## Quick Start with Docker

### Using Docker Compose (Recommended)

```bash
# Build and run the application using BuildKit
DOCKER_BUILDKIT=1 docker-compose up --build

# Run in detached mode with BuildKit
DOCKER_BUILDKIT=1 docker-compose up -d --build

# Alternative: Use docker compose (newer syntax)
docker compose up --build

# Stop the application
docker-compose down
# or
docker compose down
```

### Using Docker directly with BuildKit

```bash
# Build the image using BuildKit
DOCKER_BUILDKIT=1 docker build -t dexerblog .

# Alternative: Use buildx (recommended)
docker buildx build -t dexerblog .

# Run the container
docker run -p 3000:3000 -p 3001:3001 dexerblog
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Backend Health Check**: http://localhost:3001/api/health
- **Backend Data Endpoint**: http://localhost:3001/api/data

## Resolving Legacy Builder Warnings

If you see warnings about "legacy builder is deprecated", use one of these modern approaches:

### Method 1: Use BuildKit explicitly
```bash
# Set environment variable
export DOCKER_BUILDKIT=1
docker-compose up --build

# Or use it inline
DOCKER_BUILDKIT=1 docker build -t dexerblog .
```

### Method 2: Use docker buildx (recommended)
```bash
# Build with buildx
docker buildx build -t dexerblog .

# Create and use a new builder instance
docker buildx create --name mybuilder --use
docker buildx build -t dexerblog .
```

### Method 3: Enable BuildKit by default
Add to your `~/.docker/config.json`:
```json
{
  "features": {
    "buildkit": true
  }
}
```

## Production Deployment

The Dockerfile uses multi-stage builds for optimized production images:

1. **Dependencies stage**: Installs all dependencies
2. **Builder stage**: Builds the Next.js application
3. **Runner stage**: Creates the final optimized image

### Environment Variables

- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: Frontend port (default: 3000)
- `BACKEND_PORT`: Backend port (default: 3001)
- `HOSTNAME`: Server hostname (default: 0.0.0.0)

### Process Management

The container uses PM2 to manage both frontend and backend processes:
- Automatic restart on failure
- Process monitoring
- Log management

## Development

For development, you can still use the traditional approach:

```bash
# Install dependencies
npm install
cd backend && npm install

# Run frontend (terminal 1)
npm run dev

# Run backend (terminal 2)
cd backend && npm start
```

## Container Features

- ✅ Multi-stage build for smaller image size
- ✅ Non-root user for security
- ✅ PM2 process management
- ✅ Both services in single container
- ✅ Proper file permissions
- ✅ Optimized layer caching
- ✅ Production-ready configuration
