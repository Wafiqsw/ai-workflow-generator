from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.services import check_mysql_health, check_chroma_health, test_embedding
from datetime import datetime

router = APIRouter(prefix="/test", tags=["Test"])

@router.get("/")
def say_hello():
    return {"message": "Hello from test router!"}


# ============= Health Check Endpoints =============

@router.get("/health")
def health_check():
    """
    Overall health check - tests both MySQL and ChromaDB connections
    Returns detailed status for each database
    """
    mysql_status = check_mysql_health()
    chroma_status = check_chroma_health()
    
    overall_healthy = mysql_status["healthy"] and chroma_status["healthy"]
    
    return {
        "status": "healthy" if overall_healthy else "unhealthy",
        "timestamp": datetime.now().isoformat(),
        "databases": {
            "mysql": mysql_status,
            "chromadb": chroma_status
        }
    }


@router.get("/health/mysql")
def mysql_health(db: Session = Depends(get_db)):
    """
    MySQL health check endpoint
    Tests connection and query execution
    """
    return check_mysql_health(db)


@router.get("/health/chromadb")
def chromadb_health():
    """
    ChromaDB health check endpoint
    Tests connection and collection listing
    """
    return check_chroma_health()

@router.get("/vector/test")
def vector_test():
    """
    Test vector embedding functionality
    """
    texts = ["Hello world!", "FastAPI with embeddings."]
    embeddings = test_embedding(texts)
    
    return {
        "status": "success",
        "model": "all-MiniLM-L6-v2",
        "dimension": len(embeddings[0]) if embeddings else 0,
        "sample_count": len(texts),
        "results": [
            {"text": text, "embedding_preview": emb[:5]}
            for text, emb in zip(texts, embeddings)
        ]
    }

# ============= Generic Test Endpoint =============

@router.get("/{name}")
def greet_name(name: str):
    return {"message": f"Hello, {name} the test is working!"}

