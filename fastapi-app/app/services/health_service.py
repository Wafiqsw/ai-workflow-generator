"""
Health Check Service
Contains business logic for checking database health
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_chroma_client, list_collections, SessionLocal
import time


def check_mysql_health(db: Session = None) -> dict:
    """
    Check MySQL database health
    Returns dict with health status and details
    """
    start_time = time.time()
    
    try:
        # Use provided session or create new one
        if db is None:
            db = SessionLocal()
            should_close = True
        else:
            should_close = False
        
        try:
            # Test 1: Simple query
            result = db.execute(text("SELECT 1 as test"))
            test_value = result.fetchone()[0]
            
            # Test 2: Check database name
            result = db.execute(text("SELECT DATABASE() as db_name"))
            db_name = result.fetchone()[0]
            
            # Test 3: Count tables
            result = db.execute(text("""
                SELECT COUNT(*) as table_count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            """))
            table_count = result.fetchone()[0]
            
            # Test 4: Check api_list table exists and count rows
            try:
                result = db.execute(text("SELECT COUNT(*) as row_count FROM api_list"))
                api_count = result.fetchone()[0]
            except Exception:
                api_count = None
            
            response_time = round((time.time() - start_time) * 1000, 2)
            
            return {
                "healthy": True,
                "message": "MySQL connection is healthy",
                "details": {
                    "database": db_name,
                    "tables_count": table_count,
                    "api_list_rows": api_count,
                    "response_time_ms": response_time
                }
            }
            
        finally:
            if should_close:
                db.close()
                
    except Exception as e:
        response_time = round((time.time() - start_time) * 1000, 2)
        return {
            "healthy": False,
            "message": "MySQL connection failed",
            "error": str(e),
            "details": {
                "response_time_ms": response_time
            }
        }


def check_chroma_health() -> dict:
    """
    Check ChromaDB health
    Returns dict with health status and details
    """
    start_time = time.time()
    
    try:
        # Test 1: Get client
        client = get_chroma_client()
        
        # Test 2: List collections
        collections = list_collections()
        
        # Test 3: Get heartbeat (if available)
        try:
            heartbeat = client.heartbeat()
        except Exception:
            heartbeat = None
        
        response_time = round((time.time() - start_time) * 1000, 2)
        
        return {
            "healthy": True,
            "message": "ChromaDB connection is healthy",
            "details": {
                "collections_count": len(collections),
                "collections": collections,
                "heartbeat": heartbeat,
                "response_time_ms": response_time
            }
        }
        
    except Exception as e:
        response_time = round((time.time() - start_time) * 1000, 2)
        return {
            "healthy": False,
            "message": "ChromaDB connection failed",
            "error": str(e),
            "details": {
                "response_time_ms": response_time
            }
        }
