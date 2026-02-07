"""
PaymentSystem Service
Handles payment processing and refund operations
"""

import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.mysql import get_db


class PaymentService:
    """Service for PaymentSystem mock APIs"""

    @staticmethod
    def process_payment(amount: float, currency: str, db: Session) -> Dict[str, Any]:
        """
        Process a payment transaction
        
        Args:
            amount: Payment amount
            currency: Currency code (e.g., USD, EUR)
            db: Database session
            
        Returns:
            dict: Response with status and transaction_id
        """
        try:
            transaction_id = str(uuid.uuid4())
            
            query = text("""
                INSERT INTO mock_transactions (id, amount, currency, status, transaction_type)
                VALUES (:id, :amount, :currency, 'completed', 'payment')
            """)
            
            db.execute(query, {
                "id": transaction_id,
                "amount": amount,
                "currency": currency
            })
            db.commit()
            
            return {
                "status": "success",
                "transaction_id": transaction_id
            }
            
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def refund_payment(transaction_id: str, db: Session) -> Dict[str, Any]:
        """
        Refund a payment transaction
        
        Args:
            transaction_id: Original transaction UUID
            db: Database session
            
        Returns:
            dict: Response with status and refund_id
        """
        try:
            # Check if transaction exists
            check_query = text("""
                SELECT id, amount, currency
                FROM mock_transactions
                WHERE id = :transaction_id AND transaction_type = 'payment'
            """)
            
            original_txn = db.execute(check_query, {"transaction_id": transaction_id}).fetchone()
            
            if not original_txn:
                return {
                    "status": "error",
                    "message": "Transaction not found"
                }
            
            refund_id = str(uuid.uuid4())
            
            # Create refund transaction
            refund_query = text("""
                INSERT INTO mock_transactions (id, amount, currency, status, transaction_type, refund_id)
                VALUES (:id, :amount, :currency, 'completed', 'refund', :original_txn_id)
            """)
            
            db.execute(refund_query, {
                "id": refund_id,
                "amount": original_txn[1],
                "currency": original_txn[2],
                "original_txn_id": transaction_id
            })
            db.commit()
            
            return {
                "status": "success",
                "refund_id": refund_id
            }
            
        except Exception as e:
            db.rollback()
            raise e
