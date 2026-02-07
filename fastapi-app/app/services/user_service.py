"""
UserSystem Service
Handles user creation and retrieval operations
"""

import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.mysql import get_db


class UserService:
    """Service for UserSystem mock APIs"""

    @staticmethod
    def create_user(username: str, email: str, db: Session) -> Dict[str, Any]:
        """
        Create a new user in mock_users table
        
        Args:
            username: User's username
            email: User's email address
            db: Database session
            
        Returns:
            dict: Response with status and user_id
        """
        try:
            user_id = str(uuid.uuid4())
            
            query = text("""
                INSERT INTO mock_users (id, username, email)
                VALUES (:id, :username, :email)
            """)
            
            db.execute(query, {
                "id": user_id,
                "username": username,
                "email": email
            })
            db.commit()
            
            return {
                "status": "success",
                "user_id": user_id
            }
            
        except Exception as e:
            db.rollback()
            # Handle duplicate username/email
            if "Duplicate entry" in str(e):
                return {
                    "status": "error",
                    "message": "Username or email already exists"
                }
            raise e

    @staticmethod
    def get_user(user_id: str, db: Session) -> Dict[str, Any]:
        """
        Get user details by ID
        
        Args:
            user_id: User's UUID
            db: Database session
            
        Returns:
            dict: Response with status and user data
        """
        query = text("""
            SELECT id, username, email, created_at
            FROM mock_users
            WHERE id = :user_id
        """)
        
        result = db.execute(query, {"user_id": user_id}).fetchone()
        
        if not result:
            return {
                "status": "error",
                "message": "User not found"
            }
        
        return {
            "status": "success",
            "user": {
                "id": result[0],
                "username": result[1],
                "email": result[2],
                "created_at": str(result[3])
            }
        }
