"""
NotificationSystem Service
Handles email and SMS notification operations
"""

import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.mysql import get_db


class NotificationService:
    """Service for NotificationSystem mock APIs"""

    @staticmethod
    def send_email(email: str, subject: str, body: str, db: Session) -> Dict[str, Any]:
        """
        Send an email notification (mock - just logs to database)
        
        Args:
            email: Recipient email address
            subject: Email subject
            body: Email body content
            db: Database session
            
        Returns:
            dict: Response with status
        """
        try:
            notification_id = str(uuid.uuid4())
            
            query = text("""
                INSERT INTO mock_notifications (id, notification_type, recipient, subject, message, status)
                VALUES (:id, 'email', :recipient, :subject, :message, 'sent')
            """)
            
            db.execute(query, {
                "id": notification_id,
                "recipient": email,
                "subject": subject,
                "message": body
            })
            db.commit()
            
            return {
                "status": "sent",
                "notification_id": notification_id
            }
            
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def send_sms(phone_number: str, message: str, db: Session) -> Dict[str, Any]:
        """
        Send an SMS notification (mock - just logs to database)
        
        Args:
            phone_number: Recipient phone number
            message: SMS message content
            db: Database session
            
        Returns:
            dict: Response with status
        """
        try:
            notification_id = str(uuid.uuid4())
            
            query = text("""
                INSERT INTO mock_notifications (id, notification_type, recipient, subject, message, status)
                VALUES (:id, 'sms', :recipient, NULL, :message, 'sent')
            """)
            
            db.execute(query, {
                "id": notification_id,
                "recipient": phone_number,
                "message": message
            })
            db.commit()
            
            return {
                "status": "sent",
                "notification_id": notification_id
            }
            
        except Exception as e:
            db.rollback()
            raise e
