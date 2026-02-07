import uuid
from typing import Dict, Any, Optional
from datetime import datetime

class JobService:
    """
    Simple in-memory job tracker for background tasks.
    In production, this would use Redis or a database.
    """
    _jobs: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def create_job(cls, job_type: str) -> str:
        job_id = str(uuid.uuid4())
        cls._jobs[job_id] = {
            "id": job_id,
            "type": job_type,
            "status": "pending",
            "progress": 0,
            "result": None,
            "error": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        return job_id

    @classmethod
    def update_job(cls, job_id: str, status: str = None, progress: int = None, result: Any = None, error: str = None):
        if job_id in cls._jobs:
            job = cls._jobs[job_id]
            if status: job["status"] = status
            if progress is not None: job["progress"] = progress
            if result is not None: job["result"] = result
            if error: job["error"] = error
            job["updated_at"] = datetime.now().isoformat()

    @classmethod
    def get_job(cls, job_id: str) -> Optional[Dict[str, Any]]:
        return cls._jobs.get(job_id)

    @classmethod
    def list_jobs(cls) -> Dict[str, Dict[str, Any]]:
        return cls._jobs
