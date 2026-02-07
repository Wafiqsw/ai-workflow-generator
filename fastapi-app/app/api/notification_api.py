"""
NotificationSystem API Endpoints
Provides endpoints for sending email and SMS notifications
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.mysql import get_db
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notification", tags=["NotificationSystem"])


# Request/Response Models
class SendEmailRequest(BaseModel):
    email: EmailStr
    subject: str
    body: str


class SendSMSRequest(BaseModel):
    phone_number: str
    message: str


class NotificationResponse(BaseModel):
    status: str
    notification_id: str = None
    message: str = None


# Endpoints
@router.post("/email", response_model=NotificationResponse)
async def send_email(request: SendEmailRequest, db: Session = Depends(get_db)):
    """
    Send an email notification (mock - logs to database)
    
    Request body:
    - email: Recipient email address (required)
    - subject: Email subject (required)
    - body: Email body content (required)
    
    Returns:
    - status: "sent" or "error"
    - notification_id: UUID of the notification log
    """
    try:
        result = NotificationService.send_email(request.email, request.subject, request.body, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sms", response_model=NotificationResponse)
async def send_sms(request: SendSMSRequest, db: Session = Depends(get_db)):
    """
    Send an SMS notification (mock - logs to database)
    
    Request body:
    - phone_number: Recipient phone number (required)
    - message: SMS message content (required)
    
    Returns:
    - status: "sent" or "error"
    - notification_id: UUID of the notification log
    """
    try:
        result = NotificationService.send_sms(request.phone_number, request.message, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
