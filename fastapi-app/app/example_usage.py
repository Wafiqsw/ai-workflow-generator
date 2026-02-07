"""
Example Usage of MySQL and ChromaDB Connections
This file demonstrates how to use both databases in your FastAPI application
"""

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db import (
    # MySQL
    get_db,
    init_db,
    close_db,
    # ChromaDB
    get_chroma_client,
    get_or_create_collection,
    list_collections,
)

app = FastAPI()


# ============= Startup/Shutdown Events =============

@app.on_event("startup")
async def startup_event():
    """Initialize databases on startup"""
    # Initialize MySQL tables (if needed)
    init_db()
    
    # Test ChromaDB connection
    try:
        client = get_chroma_client()
        print("✅ ChromaDB connected successfully")
    except Exception as e:
        print(f"❌ ChromaDB connection failed: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    close_db()
    print("🔒 Database connections closed")


# ============= MySQL Examples =============

@app.get("/mysql/test")
def test_mysql(db: Session = Depends(get_db)):
    """Test MySQL connection by executing a simple query"""
    try:
        result = db.execute("SELECT 1 as test")
        return {"status": "success", "message": "MySQL connection working", "result": result.fetchone()}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api-list")
def get_api_list(db: Session = Depends(get_db)):
    """Get all APIs from the api_list table"""
    try:
        result = db.execute("SELECT * FROM api_list")
        apis = []
        for row in result:
            apis.append({
                "id": row.id,
                "system_name": row.system_name,
                "api_name": row.api_name,
                "params_values": row.params_values,
                "return_values": row.return_values,
                "description": row.description,
                "created_at": row.created_at,
            })
        return {"status": "success", "data": apis}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= ChromaDB Examples =============

@app.get("/chroma/test")
def test_chroma():
    """Test ChromaDB connection"""
    try:
        client = get_chroma_client()
        collections = list_collections()
        return {
            "status": "success",
            "message": "ChromaDB connection working",
            "collections": collections
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/chroma/add-document")
def add_document(collection_name: str, document: str, doc_id: str, metadata: dict = None):
    """Add a document to ChromaDB collection"""
    try:
        collection = get_or_create_collection(collection_name)
        collection.add(
            documents=[document],
            metadatas=[metadata or {}],
            ids=[doc_id]
        )
        return {
            "status": "success",
            "message": f"Document added to collection '{collection_name}'"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/chroma/search")
def search_documents(collection_name: str, query: str, n_results: int = 5):
    """Search for similar documents in ChromaDB"""
    try:
        collection = get_or_create_collection(collection_name)
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return {
            "status": "success",
            "results": results
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/chroma/collections")
def get_collections():
    """List all ChromaDB collections"""
    try:
        collections = list_collections()
        return {
            "status": "success",
            "collections": collections
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============= Combined Example =============

@app.post("/api-list/embed")
def embed_api_descriptions(db: Session = Depends(get_db)):
    """
    Example: Fetch API descriptions from MySQL and store them in ChromaDB
    This demonstrates using both databases together
    """
    try:
        # Get APIs from MySQL
        result = db.execute("SELECT id, system_name, api_name, description FROM api_list")
        
        # Get or create ChromaDB collection
        collection = get_or_create_collection("api_descriptions")
        
        # Add each API description to ChromaDB
        count = 0
        for row in result:
            collection.add(
                documents=[row.description],
                metadatas=[{
                    "system_name": row.system_name,
                    "api_name": row.api_name,
                }],
                ids=[row.id]
            )
            count += 1
        
        return {
            "status": "success",
            "message": f"Embedded {count} API descriptions into ChromaDB"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
