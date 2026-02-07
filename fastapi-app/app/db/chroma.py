"""
ChromaDB Vector Database Connection Module
Handles ChromaDB client connection and collection management
"""

import os
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get ChromaDB host and port from environment
CHROMA_HOST = os.getenv("CHROMA_HOST", "chromadb")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))

# Global ChromaDB client
_chroma_client = None


def get_chroma_client():
    """
    Get or create ChromaDB client instance.
    Returns a singleton client to reuse connections.
    
    Returns:
        chromadb.Client: ChromaDB client instance
    """
    global _chroma_client
    
    if _chroma_client is None:
        _chroma_client = chromadb.HttpClient(
            host=CHROMA_HOST,
            port=CHROMA_PORT,
            settings=Settings(
                anonymized_telemetry=False,
            )
        )
    
    return _chroma_client


def get_or_create_collection(collection_name: str, metadata: dict = None):
    """
    Get or create a ChromaDB collection.
    
    Args:
        collection_name (str): Name of the collection
        metadata (dict, optional): Collection metadata
    
    Returns:
        chromadb.Collection: ChromaDB collection instance
    
    Example:
        collection = get_or_create_collection("my_documents")
        collection.add(
            documents=["This is a document"],
            metadatas=[{"source": "api"}],
            ids=["doc1"]
        )
    """
    client = get_chroma_client()
    
    return client.get_or_create_collection(
        name=collection_name,
        metadata=metadata or {}
    )


def list_collections():
    """
    List all collections in ChromaDB.
    
    Returns:
        list: List of collection names
    """
    client = get_chroma_client()
    collections = client.list_collections()
    return [col.name for col in collections]


def delete_collection(collection_name: str):
    """
    Delete a collection from ChromaDB.
    
    Args:
        collection_name (str): Name of the collection to delete
    """
    client = get_chroma_client()
    client.delete_collection(name=collection_name)


def reset_chroma():
    """
    Reset ChromaDB - delete all collections.
    Use with caution!
    """
    client = get_chroma_client()
    client.reset()


def close_chroma():
    """
    Close ChromaDB connection.
    Call this on application shutdown.
    """
    global _chroma_client
    if _chroma_client is not None:
        # ChromaDB HttpClient doesn't need explicit closing
        _chroma_client = None
