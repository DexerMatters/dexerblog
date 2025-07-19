# DexerBlog - Full Stack Application

This is a full-stack blog application with a Next.js frontend and Express.js backend, organized as a pnpm workspace.

## Project Structure

```
dexerblog/
├── frontend/           # Next.js frontend application
├── backend/           # Express.js backend application
├── data/              # Database data (PostgreSQL)
├── docker-compose.yml # Docker orchestration
└── pnpm-workspace.yaml # Workspace configuration
```

## Getting Started

### Development

Install dependencies for all workspaces:
```bash
pnpm install
```

Start the frontend development server:
```bash
pnpm dev:frontend
# or
pnpm dev
```

Start the backend development server:
```bash
pnpm dev:backend
```

Start both frontend and backend with Docker:
```bash
docker-compose up frontend-dev backend
```

### Production

Build all packages:
```bash
pnpm build
```

Start with Docker:
```bash
docker-compose up
```

## Available Scripts

- `pnpm dev` - Start frontend development server
- `pnpm dev:frontend` - Start frontend development server  
- `pnpm dev:backend` - Start backend development server
- `pnpm build` - Build both frontend and backend
- `pnpm build:frontend` - Build frontend only
- `pnpm build:backend` - Build backend only
- `pnpm start:frontend` - Start frontend production server
- `pnpm start:backend` - Start backend production server
- `pnpm lint` - Run ESLint on frontend

## Tech Stack

### Frontend
- Next.js 15.4.1
- React 19.1.0
- TailwindCSS 4
- TypeScript 5

### Backend  
- Express.js 5.1.0
- TypeScript 5.8.3
- PostgreSQL (via Docker)

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)
- pnpm workspaces
