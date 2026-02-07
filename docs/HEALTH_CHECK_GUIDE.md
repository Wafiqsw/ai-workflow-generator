# Health Check API Testing Guide

## Available Health Check Endpoints

### 1. Overall Health Check
Tests both MySQL and ChromaDB connections in one call.

```bash
curl http://localhost:8001/test/health
```

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T10:25:00.123456",
  "databases": {
    "mysql": {
      "healthy": true,
      "message": "MySQL connection is healthy",
      "details": {
        "database": "myapp",
        "tables_count": 1,
        "api_list_rows": 0,
        "response_time_ms": 12.34
      }
    },
    "chromadb": {
      "healthy": true,
      "message": "ChromaDB connection is healthy",
      "details": {
        "collections_count": 0,
        "collections": [],
        "heartbeat": 1234567890,
        "response_time_ms": 5.67
      }
    }
  }
}
```

### 2. MySQL Health Check Only
```bash
curl http://localhost:8001/test/health/mysql
```

**Response Example:**
```json
{
  "healthy": true,
  "message": "MySQL connection is healthy",
  "details": {
    "database": "myapp",
    "tables_count": 1,
    "api_list_rows": 0,
    "response_time_ms": 12.34
  }
}
```

### 3. ChromaDB Health Check Only
```bash
curl http://localhost:8001/test/health/chromadb
```

**Response Example:**
```json
{
  "healthy": true,
  "message": "ChromaDB connection is healthy",
  "details": {
    "collections_count": 0,
    "collections": [],
    "heartbeat": 1234567890,
    "response_time_ms": 5.67
  }
}
```

## What Each Health Check Tests

### MySQL Health Check
1. ✅ Basic connection test (`SELECT 1`)
2. ✅ Database name verification
3. ✅ Count total tables in database
4. ✅ Check `api_list` table exists and count rows
5. ✅ Response time measurement

### ChromaDB Health Check
1. ✅ Client connection test
2. ✅ List all collections
3. ✅ Heartbeat check
4. ✅ Response time measurement

## Testing Workflow

### Step 1: Start the services
```bash
docker-compose up -d
```

### Step 2: Wait for services to be ready
```bash
# Check logs
docker-compose logs -f backend
```

### Step 3: Test overall health
```bash
curl http://localhost:8001/test/health | jq
```

### Step 4: Test individual databases
```bash
# MySQL only
curl http://localhost:8001/test/health/mysql | jq

# ChromaDB only
curl http://localhost:8001/test/health/chromadb | jq
```

## Troubleshooting

### If MySQL is unhealthy:
```bash
# Check MySQL container
docker-compose ps db
docker-compose logs db

# Verify environment variables
cat .env | grep MYSQL
```

### If ChromaDB is unhealthy:
```bash
# Check ChromaDB container
docker-compose ps chromadb
docker-compose logs chromadb

# Verify ChromaDB is accessible
curl http://localhost:8001/api/v1/heartbeat
```

### If backend can't connect:
```bash
# Rebuild backend with new dependencies
docker-compose build backend
docker-compose up -d backend

# Check backend logs
docker-compose logs -f backend
```

## Integration with Monitoring

You can use these endpoints for:
- **Docker health checks** in docker-compose.yml
- **Kubernetes liveness/readiness probes**
- **Monitoring tools** (Prometheus, Grafana, etc.)
- **CI/CD pipelines** to verify deployment

### Example: Add to docker-compose.yml
```yaml
backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8001/test/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## Response Status Codes

- `200 OK` - Health check executed (check `healthy` field in response)
- `500 Internal Server Error` - Endpoint failed to execute
- `503 Service Unavailable` - Service is down

Note: Even if databases are unhealthy, the endpoint returns `200` with `"healthy": false` in the response body.
