from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Tuple, Dict, Any

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


def search_similar(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Search for similar APIs in ChromaDB
    """
    collection = _get_chroma_collection()
    model = _get_model()
    
    query_vector = model.encode([query]).tolist()
    
    results = collection.query(
        query_embeddings=query_vector,
        n_results=top_k
    )
    
    formatted_results = []
    for i in range(len(results['ids'][0])):
        formatted_results.append({
            "id": results['ids'][0][i],
            "score": float(results['distances'][0][i]),
            "metadata": results['metadatas'][0][i],
            "document": results['documents'][0][i]
        })
    
    return formatted_results


def get_all_vectors(limit: int = 100):
    """
    Get all vectors and metadata from ChromaDB
    """
    collection = _get_chroma_collection()
    return collection.get(limit=limit)
