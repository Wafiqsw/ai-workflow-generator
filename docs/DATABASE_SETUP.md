# Database Setup Guide

## Overview
This project uses two databases:
- **MySQL**: Relational database for structured data (API list)
- **ChromaDB**: Vector database for embeddings and similarity search

## Quick Start

### 1. Start the databases
```bash
docker-compose up -d db chromadb
```

### 2. Rebuild backend with new dependencies
```bash
docker-compose build backend
docker-compose up -d backend
```

### 3. Test the connections
```bash
# Test MySQL
curl http://localhost:8000/mysql/test

# Test ChromaDB
curl http://localhost:8000/chroma/test
```

## MySQL Connection

### Import
```python
from app.db import get_db, SessionLocal
from sqlalchemy.orm import Session
```

### Usage in FastAPI routes
```python
@app.get("/items")
def get_items(db: Session = Depends(get_db)):
    result = db.execute("SELECT * FROM api_list")
    return result.fetchall()
```

### Direct usage
```python
from app.db import SessionLocal

db = SessionLocal()
try:
    result = db.execute("SELECT * FROM api_list")
    print(result.fetchall())
finally:
    db.close()
```

## ChromaDB Connection

### Import
```python
from app.db import get_chroma_client, get_or_create_collection
```

### Basic operations
```python
# Get client
client = get_chroma_client()

# Create/get collection
collection = get_or_create_collection("my_collection")

# Add documents
collection.add(
    documents=["This is a document", "Another document"],
    metadatas=[{"source": "api"}, {"source": "web"}],
    ids=["doc1", "doc2"]
)

# Search
results = collection.query(
    query_texts=["search query"],
    n_results=5
)
```

## Environment Variables

Add to `.env`:
```bash
# MySQL
DATABASE_URL=mysql+pymysql://user:password@db:3306/myapp

# ChromaDB
CHROMA_HOST=chromadb
CHROMA_PORT=8000
```

## Example Endpoints

See `app/example_usage.py` for complete examples:

- `GET /mysql/test` - Test MySQL connection
- `GET /api-list` - Get all APIs from MySQL
- `GET /chroma/test` - Test ChromaDB connection
- `POST /chroma/add-document` - Add document to ChromaDB
- `GET /chroma/search` - Search documents
- `POST /api-list/embed` - Embed API descriptions (uses both DBs)

## Troubleshooting

### MySQL connection error
```bash
# Check if MySQL is running
docker-compose ps db

# Check logs
docker-compose logs db
```

### ChromaDB connection error
```bash
# Check if ChromaDB is running
docker-compose ps chromadb

# Check logs
docker-compose logs chromadb
```

### Rebuild containers
```bash
# Stop and remove volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```
