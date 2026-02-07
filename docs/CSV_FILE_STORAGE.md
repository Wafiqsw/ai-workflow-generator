# CSV File Storage Guide

## Where Files Are Stored

When you upload CSV files through the frontend, they are saved to **persistent Docker volume storage**.

### Storage Location

**Inside Container:** `/app/uploads/csv/`  
**Docker Volume:** `uploads_data`  
**Persistence:** ✅ Files persist even after container restart

### File Naming

Files are saved with unique names to prevent conflicts:

**Format:** `YYYYMMDD_HHMMSS_<random-8-chars>.<ext>`

**Example:** `20260207_043859_cf339283.csv`

- `20260207` - Date (Feb 7, 2026)
- `043859` - Time (04:38:59)
- `cf339283` - Random 8-character hex
- `.csv` - Original file extension

## How It Works

### 1. Upload Flow

```
Frontend Upload
    ↓
Backend Receives File
    ↓
Save to /app/uploads/csv/
    ↓
Parse & Transform
    ↓
Return JSON + File Info
```

### 2. API Response

When you upload via `/csv/transform-to-api-list`, you get:

```json
{
  "message": "CSV transformed to api_list format successfully",
  "original_rows": 3,
  "transformed_rows": 3,
  "data": [...],
  "file_info": {
    "saved": true,
    "file_path": "/app/uploads/csv/20260207_043859_cf339283.csv",
    "filename": "20260207_043859_cf339283.csv",
    "size_bytes": 331
  }
}
```

## Disable File Saving

If you don't want to save files (process in memory only):

```bash
curl -X POST "http://localhost:8001/csv/transform-to-api-list?save_file=false" \
  -F "file=@data.csv"
```

## Accessing Saved Files

### From Inside Container

```bash
docker exec fastapi-app ls -lah /app/uploads/csv/
docker exec fastapi-app cat /app/uploads/csv/<filename>
```

### From Host Machine

Files are in Docker volume, not directly accessible from host.

To copy file out:
```bash
docker cp fastapi-app:/app/uploads/csv/<filename> ./
```

### List All Uploaded Files

```bash
docker exec fastapi-app find /app/uploads/csv/ -type f -name "*.csv"
```

## Volume Management

### View Volume Info

```bash
docker volume ls | grep uploads
docker volume inspect fullstack-setup_uploads_data
```

### Backup Volume

```bash
docker run --rm -v fullstack-setup_uploads_data:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/uploads-backup.tar.gz -C /data .
```

### Restore Volume

```bash
docker run --rm -v fullstack-setup_uploads_data:/data \
  -v $(pwd):/backup alpine \
  tar xzf /backup/uploads-backup.tar.gz -C /data
```

### Clear All Uploads

```bash
docker exec fastapi-app rm -rf /app/uploads/csv/*
```

## Storage Limits

- **Max file size:** 10MB per file
- **Allowed types:** `.csv`, `.txt`
- **Volume size:** Unlimited (depends on host disk space)

## Production Considerations

For production, consider:

1. **Cloud Storage** (S3, GCS, Azure Blob)
   - Better scalability
   - Automatic backups
   - CDN integration

2. **File Cleanup**
   - Implement automatic deletion after X days
   - Archive old files

3. **Monitoring**
   - Track volume usage
   - Alert on low disk space

## Configuration

File storage is configured in:

- **Service:** [`csv_service.py`](file:///home/wafiq/Project/fullstack-setup/fastapi-app/app/services/csv_service.py)
  - `UPLOAD_DIR = "/app/uploads/csv"`
  
- **Docker:** [`docker-compose.yml`](file:///home/wafiq/Project/fullstack-setup/docker-compose.yml)
  - Volume mount: `uploads_data:/app/uploads`
