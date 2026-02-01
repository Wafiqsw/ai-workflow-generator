# Docker Setup Guide

Complete guide for running the fullstack application using Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Services Overview](#services-overview)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Docker Commands](#docker-commands)
- [Port Mappings](#port-mappings)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- At least 4GB RAM available
- Ports 3308, 5173, and 8000 available

## Project Structure

```
fullstack-setup/
├── docker-compose.yml          # Main orchestration file
├── .env                        # Environment variables (create from .env.example)
├── .env.example               # Environment template
├── fastapi-app/               # Backend service
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       └── api/
├── vite-app/                  # Frontend service
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── scripts/                   # Database init scripts
```

## Services Overview

### 1. **Database (MySQL 8.0)**
- **Container Name**: `mydb`
- **Image**: `mysql:8.0`
- **Purpose**: Primary database for the application
- **Health Check**: Automated ping check every 10s
- **Data Persistence**: Volume `db_data`

### 2. **Backend (FastAPI)**
- **Container Name**: `fastapi-app`
- **Image**: Custom built from `fastapi-app/Dockerfile`
- **Purpose**: REST API server
- **Framework**: FastAPI with Uvicorn
- **Hot Reload**: Enabled for development
- **Dependencies**: Waits for database to be healthy

### 3. **Frontend (Vite + React)**
- **Container Name**: `vite-app`
- **Image**: Custom built from `vite-app/Dockerfile`
- **Purpose**: Web application UI
- **Framework**: Vite with React
- **Hot Reload**: Enabled with file watching
- **Dependencies**: Waits for backend to be healthy

## Quick Start

### 1. Initial Setup

```bash
# Clone or navigate to project directory
cd /home/wafiq/Project/fullstack-setup

# Create environment file from example
cp .env.example .env

# (Optional) Edit .env file with your preferences
nano .env
```

### 2. Build and Start Services

```bash
# Build images and start all services in detached mode
docker-compose up --build -d

# View logs (optional)
docker-compose logs -f
```

### 3. Verify Services

```bash
# Check service status
docker-compose ps

# Test backend API
curl http://localhost:8000/

# Open frontend in browser
# Navigate to: http://localhost:5173
```

## Environment Configuration

### `.env` File Variables

```bash
# MySQL Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword    # Root user password
MYSQL_DATABASE=myapp                # Database name
MYSQL_USER=user                     # Application user
MYSQL_PASSWORD=password             # Application user password

# Backend Configuration
DATABASE_URL=mysql+pymysql://user:password@db:3306/myapp
```

**⚠️ Important**: Change default passwords in production!

## Docker Commands

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start with build (rebuild images)
docker-compose up --build -d

# Start in foreground (see logs)
docker-compose up
```

### Stopping Services

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes data)
docker-compose down -v
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# View last 50 lines
docker-compose logs --tail=50
```

### Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Executing Commands

```bash
# Access backend container shell
docker-compose exec backend bash

# Access database
docker-compose exec db mysql -u root -p

# Run backend command
docker-compose exec backend python -c "print('Hello')"

# Access frontend container
docker-compose exec frontend sh
```

### Cleaning Up

```bash
# Remove stopped containers
docker-compose rm

# Remove all unused images, containers, networks
docker system prune

# Remove everything including volumes (⚠️ nuclear option)
docker system prune -a --volumes
```

## Port Mappings

| Service  | Container Port | Host Port | URL                      |
|----------|----------------|-----------|--------------------------|
| MySQL    | 3306           | 3308      | localhost:3308           |
| Backend  | 8000           | 8000      | http://localhost:8000    |
| Frontend | 5173           | 5173      | http://localhost:5173    |

### Accessing Services

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (FastAPI auto-generated)
- **Database**: `mysql -h 127.0.0.1 -P 3308 -u user -p`

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:3308 failed: port is already allocated`

**Solution**:
```bash
# Check what's using the port
sudo lsof -i :3308

# Stop the conflicting service or change port in docker-compose.yml
```

### Container Unhealthy

**Error**: `Container is unhealthy`

**Solution**:
```bash
# Check container logs
docker logs fastapi-app

# Check health status
docker inspect fastapi-app --format='{{json .State.Health}}'

# Restart the service
docker-compose restart backend
```

### Database Connection Failed

**Error**: `Can't connect to MySQL server`

**Solution**:
```bash
# Wait for database to be ready (health check)
docker-compose ps

# Check database logs
docker-compose logs db

# Verify environment variables
docker-compose exec backend env | grep DATABASE
```

### Hot Reload Not Working

**Solution**:
```bash
# Ensure volumes are mounted correctly
docker-compose down
docker-compose up -d

# For frontend, CHOKIDAR_USEPOLLING is already set
# For backend, uvicorn --reload is already enabled
```

### Permission Issues

**Solution**:
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild containers
docker-compose down
docker-compose up --build -d
```

## Development Workflow

### Making Code Changes

1. **Backend Changes** (`fastapi-app/app/`)
   - Edit Python files
   - Changes auto-reload (no restart needed)
   - Check logs: `docker-compose logs -f backend`

2. **Frontend Changes** (`vite-app/src/`)
   - Edit React/JS/CSS files
   - Changes auto-reload in browser
   - Check logs: `docker-compose logs -f frontend`

3. **Database Changes** (`scripts/`)
   - Add SQL files to `scripts/` folder
   - Recreate database: `docker-compose down -v && docker-compose up -d`

### Adding Dependencies

**Backend (Python)**:
```bash
# Add to requirements.txt
echo "new-package==1.0.0" >> fastapi-app/requirements.txt

# Rebuild backend
docker-compose up --build -d backend
```

**Frontend (Node)**:
```bash
# Access container
docker-compose exec frontend sh

# Install package
npm install new-package

# Or rebuild
docker-compose up --build -d frontend
```

### Database Migrations

```bash
# Access database
docker-compose exec db mysql -u root -p

# Or use MySQL client from host
mysql -h 127.0.0.1 -P 3308 -u user -p myapp

# Backup database
docker-compose exec db mysqldump -u root -p myapp > backup.sql

# Restore database
docker-compose exec -T db mysql -u root -p myapp < backup.sql
```

### Debugging

```bash
# View container resource usage
docker stats

# Inspect container configuration
docker inspect fastapi-app

# Check network connectivity
docker-compose exec backend ping db
docker-compose exec frontend ping backend

# View all networks
docker network ls

# Inspect network
docker network inspect fullstack-setup_fullstack-network
```

## Health Checks

All services have automated health checks:

- **Database**: Checks MySQL ping every 10s
- **Backend**: Checks HTTP endpoint every 30s
- **Frontend**: Checks HTTP endpoint every 30s

Services won't start until their dependencies are healthy.

## Production Considerations

⚠️ **This setup is for DEVELOPMENT only**. For production:

1. Remove `--reload` from backend CMD
2. Use production-grade WSGI server (gunicorn)
3. Build frontend for production (`npm run build`)
4. Use environment-specific `.env` files
5. Enable SSL/TLS
6. Set up proper secrets management
7. Configure resource limits
8. Set up monitoring and logging
9. Use Docker secrets instead of .env
10. Implement backup strategies

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vite Documentation](https://vitejs.dev/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)

---

**Last Updated**: 2026-02-01  
**Docker Compose Version**: 3.9  
**Maintained By**: Development Team
