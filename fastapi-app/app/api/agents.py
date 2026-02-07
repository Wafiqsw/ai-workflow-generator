from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.open_router import chat_with_gemini, run_agent_query
from app.services.vector_service import reindex_all_apis
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/agents", tags=["Agents"])

class ChatRequest(BaseModel):
    prompt: str
    model: Optional[str] = "gemini-3-flash-preview"
    reasoning: Optional[bool] = True

class AgentQueryRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    content: str
    reasoning_details: Optional[Any] = None
    role: str

import re

class AgentQueryResponse(BaseModel):
    content: str
    is_feasible: bool = True
    score: float = 1.0
    reason: Optional[str] = None
    workflow_id: Optional[str] = None

@router.post("/query", response_model=AgentQueryResponse)
async def query_agent(request: AgentQueryRequest):
    """
    Invoke the LangChain agent with tools (Vector Search & Feasibility).
    """
    try:
        content = run_agent_query(request.prompt)

        is_feasible = True
        score = 1.0
        reason = None
        workflow_id = None

        report_match = re.search(r"\[FEASIBILITY_REPORT:\s*is_feasible=(True|False),\s*score=([0-9.]+),\s*reason='(.*?)'\]", content)

        if report_match:
            is_feasible = report_match.group(1) == "True"
            score = float(report_match.group(2))
            reason = report_match.group(3)
            content = content.replace(report_match.group(0), "").strip()

        id_match = re.search(r"`(wf_[a-z0-9]+)`", content)
        if not id_match:
            id_match = re.search(r"wf_[a-z0-9]{8}", content)

        if id_match:
            workflow_id = id_match.group(1) if "`" in id_match.group(0) else id_match.group(0)

        return AgentQueryResponse(
            content=content,
            is_feasible=is_feasible,
            score=score,
            reason=reason,
            workflow_id=workflow_id
        )
    except Exception as e:
        error_detail = str(e)
        if "Provider returned error" in error_detail:
            match = re.search(r'"message":"(.*?)"', error_detail)
            if match:
                error_detail = match.group(1)

        return AgentQueryResponse(
            content=f"❌ Backend Error: {error_detail}",
            is_feasible=False,
            score=0.0,
            reason=f"Technical Failure: {error_detail}"
        )

@router.post("/reindex")
async def reindex_apis():
    """
    Manually trigger re-indexing of all APIs from MySQL to ChromaDB.
    """
    try:
        result = reindex_all_apis()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-chat", response_model=ChatResponse)
async def test_chat_post(request: ChatRequest):
    """
    Test the Gemini model with a simple prompt (POST).
    """
    try:
        messages = [{"role": "user", "content": request.prompt}]
        result = chat_with_gemini(messages=messages)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-chat", response_model=ChatResponse)
async def test_chat_get(
    prompt: str = "Hey, how are you today?",
):
    """
    Test the Gemini model via GET.
    Example: /agents/test-chat?prompt=Hello
    """
    try:
        messages = [{"role": "user", "content": prompt}]
        result = chat_with_gemini(messages=messages)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
