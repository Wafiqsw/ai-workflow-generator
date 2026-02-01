# 🚀 Fullstack Development Setup

A modern fullstack application template with FastAPI backend, React frontend, and MySQL database - all containerized with Docker for seamless development.

## 🛠️ Tech Stack

<div align="center">

### Frontend
<img src="https://vitejs.dev/logo.svg" alt="Vite" width="60" height="60"/>
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" width="60" height="60"/>
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" width="60" height="60"/>

**Vite** + **React** + **TypeScript**

Lightning-fast development with hot module replacement

---

### Backend
<img src="https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png" alt="FastAPI" width="180"/>

**FastAPI** + **Python 3.12**

High-performance async API with automatic documentation

---

### Database
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original-wordmark.svg" alt="MySQL" width="80" height="80"/>

**MySQL 8.0**

Reliable relational database with full ACID compliance

---

### DevOps
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" alt="Docker" width="60" height="60"/>

**Docker** + **Docker Compose**

Containerized development environment

</div>

## 📋 Features

- ⚡ **Hot Reload** - Instant feedback on code changes
- 🔒 **Type Safety** - TypeScript for frontend reliability
- 📚 **Auto Documentation** - FastAPI generates interactive API docs
- 🐳 **Containerized** - Consistent development environment
- 🔄 **Health Checks** - Automated service monitoring
- 🌐 **CORS Enabled** - Frontend-backend communication ready
- 📦 **Volume Optimization** - No node_modules/venv conflicts

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- 4GB RAM available

### Setup & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd fullstack-setup

# Create environment file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Access Services

| Service | URL | Description |
|---------|-----|-------------|
| 🎨 Frontend | http://localhost:5173 | React application |
| ⚡ Backend API | http://localhost:8000 | FastAPI server |
| 📖 API Docs | http://localhost:8000/docs | Interactive API documentation |
| 🗄️ Database | localhost:3308 | MySQL server |

## 📁 Project Structure

```
fullstack-setup/
├── 🐳 docker-compose.yml      # Service orchestration
├── 📝 .env.example            # Environment template
├── 📚 docs/
│   └── DOCKER_GUIDE.md        # Complete Docker documentation
├── 🔧 fastapi-app/            # Backend service
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # FastAPI application
│       └── api/               # API routes
└── ⚛️ vite-app/               # Frontend service
    ├── Dockerfile
    ├── package.json
    └── src/                   # React components
```

## 🔧 Development

### Backend Development

```bash
# View backend logs
docker-compose logs -f backend

# Access backend container
docker-compose exec backend bash

# Add Python package
echo "package-name==1.0.0" >> fastapi-app/requirements.txt
docker-compose up --build -d backend
```

### Frontend Development

```bash
# View frontend logs
docker-compose logs -f frontend

# Access frontend container
docker-compose exec frontend sh

# Add npm package
docker-compose exec frontend npm install package-name
```

### Database Access

```bash
# Connect to MySQL
mysql -h 127.0.0.1 -P 3308 -u user -p

# Or via Docker
docker-compose exec db mysql -u root -p
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# View all logs
docker-compose logs -f

# Check service status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

## 📖 Documentation

For comprehensive Docker setup guide, troubleshooting, and advanced usage, see:

📘 **[Docker Guide](docs/DOCKER_GUIDE.md)**

## 🌟 Tech Stack Details

### Frontend Stack
- **Vite 7.2+** - Next generation frontend tooling
- **React 19** - Modern UI library with latest features
- **TypeScript 5.9** - Type-safe JavaScript
- **Axios** - HTTP client for API calls
- **ESLint** - Code quality and consistency

### Backend Stack
- **FastAPI 0.115** - Modern Python web framework
- **Uvicorn** - Lightning-fast ASGI server
- **SQLAlchemy 2.0** - SQL toolkit and ORM
- **PyMySQL** - Pure Python MySQL driver
- **Pydantic** - Data validation using Python type hints

### Database
- **MySQL 8.0** - World's most popular open source database
- **Persistent volumes** - Data survives container restarts
- **Health checks** - Automated monitoring

### DevOps
- **Docker Compose 3.9** - Multi-container orchestration
- **Health checks** - Service dependency management
- **Hot reload** - Development productivity
- **Volume optimization** - Fast file watching

## 🔐 Environment Variables

```bash
# MySQL Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=myapp
MYSQL_USER=user
MYSQL_PASSWORD=password

# Backend Configuration
DATABASE_URL=mysql+pymysql://user:password@db:3306/myapp
```

⚠️ **Important**: Change default passwords before deploying to production!

## 🎯 API Endpoints

Once running, visit http://localhost:8000/docs for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

Default endpoints:
- `GET /` - Health check
- `GET /test` - Test endpoint

## 🤝 Contributing

1. Make your changes in the appropriate service directory
2. Test locally with `docker-compose up -d`
3. Ensure all services are healthy: `docker-compose ps`
4. Submit your pull request

## 📝 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [Docker Guide](docs/DOCKER_GUIDE.md)
- Review service logs: `docker-compose logs -f`
- Verify service health: `docker-compose ps`

---

<div align="center">

**Built with ❤️ using FastAPI, React, and Docker**

⭐ Star this repo if you find it helpful!

</div>
