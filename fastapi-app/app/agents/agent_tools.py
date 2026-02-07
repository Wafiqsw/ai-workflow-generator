from langchain_core.tools import tool
from app.services.vector_service import search_similar
from typing import Any
import os
import json
import uuid
from datetime import datetime

@tool
def search_apis(query: str) -> str:
    """
    Search for existing APIs in the database.
    Query should be a string description of the functionality needed.
    """
    # LangChain sometimes passes a dict or list to single-input tools
    if isinstance(query, dict):
        query = query.get("query", str(query))
    elif not isinstance(query, str):
        query = str(query)

    results = search_similar(query, top_k=10)
    if not results:
        return "No similar APIs found in the database. Try different keywords."
    
    formatted = []
    for res in results:
        meta = res['metadata']
        dist = res.get('hybrid_distance', res.get('distance', 0.0))
        score = max(0, min(100, int((1 - dist) * 100)))
        
        info = (f"System: {meta.get('system_name', 'Unknown')} | API: {meta.get('api_name', 'Unknown')}\n"
                f"Description: {meta.get('description', 'No description')}\n"
                f"Match Score: {score}%")
        formatted.append(info)
    
    return "\n\n".join(formatted)

@tool
def evaluate_feasibility(input_data: str) -> str:
    """
    Evaluate if a workflow prompt is feasible based on retrieved APIs.
    Input: A string describing the workflow and available APIs.
    Returns: A report with [FEASIBILITY_REPORT: is_feasible=True/False, score=0.X, reason='...'].
    """
    return "Please analyze the provided APIs against the prompt and give your judgment in the format: [FEASIBILITY_REPORT: is_feasible=True/False, score=0.8, reason='...']"

@tool
def save_workflow_files(json_input: str) -> str:
    """
    Create and save workflow files (JSON and Airflow DAG) to the disk.
    Args:
        json_input: A JSON string with keys: "workflow_name", "steps_json", and "dag_python".
    Returns: A success message with the unique folder ID.
    You MUST call this for every feasible workflow with actual data from your search.
    """
    print(f"🚀 [TOOL INTERFACE] save_workflow_files called with JSON input.")
    try:
        data = json.loads(json_input)
        workflow_name = data.get("workflow_name", "unnamed_workflow")
        steps_json = data.get("steps_json", "[]")
        dag_python = data.get("dag_python", "")

        # 1. Create a unique ID/folder name
        workflow_id = f"wf_{uuid.uuid4().hex[:8]}"
        base_dir = "/app/workflows"
        workflow_dir = os.path.join(base_dir, workflow_id)
        
        os.makedirs(workflow_dir, exist_ok=True)
        os.chmod(workflow_dir, 0o777)
        
        # 2. Save JSON file
        json_path = os.path.join(workflow_dir, "workflow.json")
        try:
            workflow_steps = json.loads(steps_json)
        except:
            workflow_steps = {"raw_info": steps_json}

        workflow_data = {
            "id": workflow_id,
            "name": workflow_name,
            "status": "draft",
            "created_at": str(datetime.now()),
            "steps": workflow_steps
        }
        with open(json_path, "w") as f:
            json.dump(workflow_data, f, indent=4)
        os.chmod(json_path, 0o666)

        # 3. Save Python/Airflow file
        dag_path = os.path.join(workflow_dir, "airflow_dag.py")
        
        if not dag_python or "DAG" not in dag_python:
             dag_python = f"""from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

# Workflow: {workflow_name}
# ID: {workflow_id}

with DAG('{workflow_id}', start_date=datetime(2025,1,1), schedule_interval=None) as dag:
    # Steps: {steps_json}
    pass
"""
        with open(dag_path, "w") as f:
            f.write(dag_python)
        os.chmod(dag_path, 0o666)
            
        print(f"✅ [TOOL SUCCESS] Workflow files created: {workflow_id}")
        return f"SUCCESS: Workflow '{workflow_name}' persisted in folder '{workflow_id}'."
    except Exception as e:
        print(f"❌ [TOOL ERROR] save_workflow_files: {e}")
        return f"ERROR: Failed to save workflow: {str(e)}"

# List of tools for the agent to use
tools = [search_apis, evaluate_feasibility, save_workflow_files]
