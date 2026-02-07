"""
Database Module
Provides MySQL and ChromaDB connections
"""

from .mysql import (
    engine,
    SessionLocal,
    Base,
    get_db,
    init_db,
    close_db
)

from .chroma import (
    get_chroma_client,
    get_or_create_collection,
    list_collections,
    delete_collection,
    reset_chroma,
    close_chroma
)

__all__ = [
    # MySQL
    "engine",
    "SessionLocal",
    "Base",
    "get_db",
    "init_db",
    "close_db",
    # ChromaDB
    "get_chroma_client",
    "get_or_create_collection",
    "list_collections",
    "delete_collection",
    "reset_chroma",
    "close_chroma",
]
