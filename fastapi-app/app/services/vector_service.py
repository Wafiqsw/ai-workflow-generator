from sentence_transformers import SentenceTransformer
from typing import List, Tuple, Dict, Any, Optional
import os

# Global storage for vectors and texts
_model = None
_chroma_client = None
_collection = None

def _get_model(model_name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
    """Helper function to load model once"""
    global _model
    if _model is None:
        _model = SentenceTransformer(model_name)
    return _model


def _get_chroma_collection():
    """Helper to get or create ChromaDB collection"""
    global _chroma_client, _collection
    if _collection is None:
        from app.db.chroma import get_chroma_client
        _chroma_client = get_chroma_client()
        _collection = _chroma_client.get_or_create_collection(name="api_vectors")
    return _collection


def store_in_chroma(records: List[Dict[str, Any]], embeddings: List[List[float]]):
    """
    Store records and their embeddings in ChromaDB
    """
    collection = _get_chroma_collection()
    
    ids = [r["id"] for r in records]
    metadatas = [
        {
            "system_name": r["system_name"],
            "api_name": r["api_name"],
            "description": r.get("description", "")
        }
        for r in records
    ]
    documents = [
        f"System: {r['system_name']} | API: {r['api_name']} | Description: {r.get('description', '')}"
        for r in records
    ]
    
    collection.add(
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas,
        documents=documents
    )
    print(f"✅ Stored {len(ids)} vectors in ChromaDB")


def test_embedding(texts: List[str] = None) -> List[List[float]]:
    """
    Testing function - encode sample texts and return their embeddings
    """
    if texts is None:
        texts = ["Hello world!", "FastAPI with embeddings."]
    
    model = _get_model()
    embeddings = model.encode(texts)
    return embeddings.tolist()


def encode_text(texts: List[str]) -> List[List[float]]:
    """
    Turn text into vectors (embeddings)
    """
    model = _get_model()
    embeddings = model.encode(texts)
    return embeddings.tolist()


def search_similar(query: str, top_k: int = 10) -> List[Dict[str, Any]]:
    """
    Search for similar APIs in ChromaDB with Hybrid Re-ranking.
    Combines vector similarity with keyword matches in metadata.
    """
    collection = _get_chroma_collection()
    model = _get_model()
    
    query_vector = model.encode([query]).tolist()
    
    # Get results from vector search
    results = collection.query(
        query_embeddings=query_vector,
        n_results=top_k
    )
    
    formatted_results = []
    if not results or not results['ids'] or not results['ids'][0]:
        return []

    query_lower = query.lower()

    for i in range(len(results['ids'][0])):
        dist = float(results['distances'][0][i])
        metadata = results['metadatas'][0][i]
        
        # Hybrid Scoring: Boost if query matches system_name or api_name
        # Distance is lower for better match (0.0 is perfect).
        # We decrease distance for keyword matches.
        boost = 0
        sys_name = str(metadata.get("system_name", "")).lower()
        api_name = str(metadata.get("api_name", "")).lower()
        
        if query_lower in sys_name or query_lower in api_name:
            boost = 0.2 # Substantial boost for keyword match
        
        # Final "Hybrid Distance"
        hybrid_distance = max(0, dist - boost)

        formatted_results.append({
            "id": results['ids'][0][i],
            "distance": dist,
            "hybrid_distance": hybrid_distance,
            "metadata": metadata,
            "document": results['documents'][0][i]
        })
    
    # Re-rank based on hybrid distance
    formatted_results.sort(key=lambda x: x['hybrid_distance'])
    
    return formatted_results

def reindex_all_apis():
    """
    Sync all APIs from MySQL to ChromaDB.
    Wipes the current collection and re-adds all records.
    """
    from app.services.api_list_service import get_all_apis
    
    # 1. Get all APIs from MySQL
    records = get_all_apis()
    if not records:
        return {"success": True, "count": 0, "message": "No APIs found in MySQL to index."}
    
    # 2. Get Chroma collection
    collection = _get_chroma_collection()
    
    # 3. Wipe current collection (Optional: or just upsert)
    # For re-index, wiping is safer if we want perfect sync
    try:
        global _chroma_client
        _chroma_client.delete_collection(name="api_vectors")
        global _collection
        _collection = None # Reset so it gets re-created
        collection = _get_chroma_collection()
    except Exception as e:
        print(f"Warning during re-index cleanup: {e}")

    # 4. Prepare data for Chroma
    from app.services.csv_service import CSVService
    texts = CSVService.prepare_api_texts(records)
    embeddings = encode_text(texts)
    
    # 5. Store in Chroma
    store_in_chroma(records, embeddings)
    
    return {"success": True, "count": len(records)}


def get_all_vectors(limit: int = 100):
    """
    Get all vectors and metadata from ChromaDB
    """
    collection = _get_chroma_collection()
    return collection.get(limit=limit)
