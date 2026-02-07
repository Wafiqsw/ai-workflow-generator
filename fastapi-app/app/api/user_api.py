"""
UserSystem API Endpoints
Provides endpoints for user creation and retrieval
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.mysql import get_db
from app.services.user_service import UserService

router = APIRouter(prefix="/api/user", tags=["UserSystem"])


# Request/Response Models
class CreateUserRequest(BaseModel):
    username: str
    email: EmailStr


class CreateUserResponse(BaseModel):
    status: str
    user_id: str = None
    message: str = None


class UserData(BaseModel):
    id: str
    username: str
    email: str
    created_at: str = None


class GetUserResponse(BaseModel):
    status: str
    user: UserData = None
    message: str = None


# Endpoints
@router.post("/create", response_model=CreateUserResponse)
async def create_user(request: CreateUserRequest, db: Session = Depends(get_db)):
    """
    Create a new user
    
    Request body:
    - username: User's username (required)
    - email: User's email address (required)
    
    Returns:
    - status: "success" or "error"
    - user_id: UUID of created user (on success)
    """
    result = UserService.create_user(request.username, request.email, db)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    
    return result


@router.get("/{user_id}", response_model=GetUserResponse)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """
    Get user details by ID
    
    Path parameter:
    - user_id: UUID of the user
    
    Returns:
    - status: "success" or "error"
    - user: User object with id, username, email (on success)
    """
    result = UserService.get_user(user_id, db)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    
    return result
