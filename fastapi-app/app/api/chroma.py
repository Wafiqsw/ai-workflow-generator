from fastapi import APIRouter
from app.services import get_all_vectors, search_similar

router = APIRouter(prefix="/chroma", tags=["ChromaDB"])

@router.get("/vectors")
async def list_vectors(limit: int = 100):
    """
    Get all vectors and metadata stored in ChromaDB
    """
    return get_all_vectors(limit=limit)

@router.get("/search")
async def search(query: str, top_k: int = 5):
    """
    Search for similar APIs based on natural language query
    """
    return search_similar(query, top_k=top_k)
