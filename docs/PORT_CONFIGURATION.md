# Port Configuration Summary

## Updated Port Mappings

All services now use **matching internal and external ports** to avoid confusion:

| Service | External Port | Internal Port | Access URL |
|---------|--------------|---------------|------------|
| **MySQL** | 3308 | 3306 | `localhost:3308` |
| **Backend (FastAPI)** | 8001 | 8001 | `http://localhost:8001` |
| **Frontend (Vite)** | 5173 | 5173 | `http://localhost:5173` |
| **ChromaDB** | 8002 | 8002 | `http://localhost:8002` |

## Changes Made

### 1. Backend (FastAPI)
- **Port changed**: `8000:8000` → `8001:8001`
- **Healthcheck updated**: Uses `localhost:8001`
- **Frontend env updated**: `VITE_API_URL=http://localhost:8001`

### 2. ChromaDB
- **Port changed**: `8002:8000` → `8002:8002`
- **Environment variable added**: `CHROMA_SERVER_HTTP_PORT=8002`
- **Healthcheck updated**: Uses `localhost:8002`
- **.env updated**: `CHROMA_PORT=8002`

## Files Modified

1. ✅ [`docker-compose.yml`](file:///home/wafiq/Project/fullstack-setup/docker-compose.yml)
   - Backend ports: `8001:8001`
   - ChromaDB ports: `8002:8002`
   - Frontend API URL updated
   - All healthchecks updated

2. ✅ [`.env`](file:///home/wafiq/Project/fullstack-setup/.env)
   - `CHROMA_PORT=8002`

3. ✅ [`HEALTH_CHECK_GUIDE.md`](file:///home/wafiq/Project/fullstack-setup/HEALTH_CHECK_GUIDE.md)
   - All URLs updated to use port 8001

## Testing the Changes

### 1. Restart services
```bash
docker-compose down
docker-compose up -d --build
```

### 2. Test each service
```bash
# MySQL
mysql -h 127.0.0.1 -P 3308 -u user -p

# Backend
curl http://localhost:8001/test/health

# Frontend
open http://localhost:5173

# ChromaDB
curl http://localhost:8002/api/v1/heartbeat
```

## Internal Docker Network

Services communicate using these addresses:
- MySQL: `db:3306`
- Backend: `backend:8001`
- Frontend: `frontend:5173`
- ChromaDB: `chromadb:8002`

## Why This Change?

**Before**: ChromaDB used `8002:8000` which was confusing
- External: port 8002
- Internal: port 8000

**After**: All services use matching ports
- External = Internal
- Easier to understand and debug
- No confusion about which port to use
