from fastapi import APIRouter
from app.services import get_all_apis

router = APIRouter(prefix="/mysql", tags=["MySQL"])

@router.get("/apis")
async def list_apis():
    """
    Get all API records stored in MySQL
    """
    return get_all_apis()
