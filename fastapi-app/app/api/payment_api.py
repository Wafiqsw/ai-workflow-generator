"""
PaymentSystem API Endpoints
Provides endpoints for payment processing and refunds
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.mysql import get_db
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/api/payment", tags=["PaymentSystem"])


# Request/Response Models
class ProcessPaymentRequest(BaseModel):
    amount: float
    currency: str


class ProcessPaymentResponse(BaseModel):
    status: str
    transaction_id: str = None
    message: str = None


class RefundPaymentRequest(BaseModel):
    transaction_id: str


class RefundPaymentResponse(BaseModel):
    status: str
    refund_id: str = None
    message: str = None


# Endpoints
@router.post("/process", response_model=ProcessPaymentResponse)
async def process_payment(request: ProcessPaymentRequest, db: Session = Depends(get_db)):
    """
    Process a payment transaction
    
    Request body:
    - amount: Payment amount (required)
    - currency: Currency code, e.g., USD, EUR (required)
    
    Returns:
    - status: "success" or "error"
    - transaction_id: UUID of the transaction (on success)
    """
    try:
        result = PaymentService.process_payment(request.amount, request.currency, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refund", response_model=RefundPaymentResponse)
async def refund_payment(request: RefundPaymentRequest, db: Session = Depends(get_db)):
    """
    Refund a payment transaction
    
    Request body:
    - transaction_id: UUID of the original transaction (required)
    
    Returns:
    - status: "success" or "error"
    - refund_id: UUID of the refund transaction (on success)
    """
    result = PaymentService.refund_payment(request.transaction_id, db)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    
    return result
