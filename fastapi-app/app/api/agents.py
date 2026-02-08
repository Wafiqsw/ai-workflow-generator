import asyncio
import json
import os
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.open_router import chat_with_gemini, run_agent_query
from app.services.vector_service import reindex_all_apis
from app.services.job_service import JobService
from app.services.dag_runner import run_dag
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/agents", tags=["Agents"])

WORKFLOWS_DIR = Path(__file__).resolve().parent.parent.parent / "workflows"

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

@router.get("/workflows")
async def list_workflows():
    """List all saved workflows."""
    workflows = []
    if WORKFLOWS_DIR.exists():
        for wf_dir in sorted(WORKFLOWS_DIR.iterdir()):
            wf_file = wf_dir / "workflow.json"
            if wf_dir.is_dir() and wf_file.exists():
                try:
                    data = json.loads(wf_file.read_text())
                    steps = data.get("steps", [])
                    if isinstance(steps, dict):
                        steps = steps.get("raw_info", [])
                    workflows.append({
                        "id": data.get("id", wf_dir.name),
                        "name": data.get("name", "Untitled"),
                        "status": data.get("status", "draft"),
                        "created_at": data.get("created_at", ""),
                        "step_count": len(steps) if isinstance(steps, list) else 0,
                    })
                except (json.JSONDecodeError, OSError):
                    continue
    return workflows


@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Return full workflow JSON for a given workflow ID."""
    wf_file = WORKFLOWS_DIR / workflow_id / "workflow.json"
    if not wf_file.exists():
        raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
    try:
        return json.loads(wf_file.read_text())
    except (json.JSONDecodeError, OSError) as e:
        raise HTTPException(status_code=500, detail=f"Error reading workflow: {e}")


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


# ── Workflow execution endpoints ─────────────────────────────────

@router.post("/workflows/{workflow_id}/run")
async def run_workflow(workflow_id: str):
    """Trigger execution of a workflow's airflow_dag.py."""
    dag_path = WORKFLOWS_DIR / workflow_id / "airflow_dag.py"
    if not dag_path.exists():
        raise HTTPException(status_code=404, detail=f"No airflow_dag.py found for {workflow_id}")

    job_id = JobService.create_job("workflow_run")
    JobService.update_job(job_id, status="running", progress=0)

    async def _execute():
        def on_update(task_id, status, idx, total):
            progress = int(((idx + 1) / total) * 100) if status != "running" else int((idx / total) * 100)
            JobService.update_job(job_id, progress=progress)

        result = await asyncio.to_thread(run_dag, str(dag_path), on_update)

        if result["status"] == "completed":
            JobService.update_job(job_id, status="completed", progress=100, result=result)
            # Update workflow status to active on success
            wf_file = WORKFLOWS_DIR / workflow_id / "workflow.json"
            if wf_file.exists():
                try:
                    data = json.loads(wf_file.read_text())
                    data["status"] = "active"
                    wf_file.write_text(json.dumps(data, indent=2))
                except (json.JSONDecodeError, OSError):
                    pass
        else:
            JobService.update_job(
                job_id,
                status="failed",
                progress=100,
                result=result,
                error=result.get("error") or "One or more tasks failed",
            )

    asyncio.create_task(_execute())
    return {"job_id": job_id}


@router.get("/workflows/{workflow_id}/runs/{job_id}")
async def get_run_status(workflow_id: str, job_id: str):
    """Poll execution status for a workflow run."""
    job = JobService.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return {
        "status": job["status"],
        "progress": job["progress"],
        "tasks": job["result"]["tasks"] if job.get("result") and "tasks" in job["result"] else [],
        "error": job.get("error"),
    }
