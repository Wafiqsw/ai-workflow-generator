"""
Lightweight DAG runner that executes airflow_dag.py files
without requiring Apache Airflow. Provides mock Airflow shims
that capture task definitions and dependencies, then runs them
in topological order.
"""

import io
import sys
import time
import types
from collections import defaultdict, deque
from typing import Any, Dict, List, Optional


# ── Mock Airflow classes ──────────────────────────────────────────

class _XComStore:
    """Simple in-memory XCom replacement."""

    def __init__(self):
        self._data: Dict[str, Any] = {}

    def push(self, task_id: str, value: Any):
        self._data[task_id] = value

    def pull(self, task_ids: str) -> Any:
        return self._data.get(task_ids)


class _TaskInstance:
    """Fake TaskInstance passed as kwargs['ti'] to callables."""

    def __init__(self, xcom: _XComStore):
        self._xcom = xcom

    def xcom_pull(self, task_ids: str, key: str = "return_value") -> Any:
        return self._xcom.pull(task_ids)

    def xcom_push(self, key: str, value: Any):
        pass  # not needed — return values auto-stored


class _PythonOperator:
    """Mock PythonOperator that records task metadata."""

    def __init__(self, task_id: str, python_callable, op_kwargs: Optional[dict] = None,
                 dag=None, provide_context: bool = False, **ignored):
        self.task_id = task_id
        self.python_callable = python_callable
        self.op_kwargs = op_kwargs or {}
        self._downstream: List[str] = []
        self._upstream: List[str] = []
        # auto-register on current DAG
        if dag is not None:
            dag._register_task(self)
        elif _DAG._current is not None:
            _DAG._current._register_task(self)

    # Support >> and << operators for dependency wiring
    def __rshift__(self, other):
        """self >> other"""
        if isinstance(other, list):
            for o in other:
                self._add_downstream(o)
        else:
            self._add_downstream(other)
        return other

    def __lshift__(self, other):
        """self << other"""
        if isinstance(other, list):
            for o in other:
                o._add_downstream(self)
        else:
            other._add_downstream(self)
        return other

    def __rrshift__(self, other):
        """list >> self"""
        if isinstance(other, list):
            for o in other:
                o._add_downstream(self)
        return self

    def _add_downstream(self, other: "_PythonOperator"):
        if other.task_id not in self._downstream:
            self._downstream.append(other.task_id)
        if self.task_id not in other._upstream:
            other._upstream.append(self.task_id)


class _DAG:
    """Mock DAG that collects tasks via context manager or explicit dag= param."""

    _current: Optional["_DAG"] = None

    def __init__(self, dag_id: str, **ignored):
        self.dag_id = dag_id
        self.tasks: Dict[str, _PythonOperator] = {}

    def _register_task(self, task: _PythonOperator):
        self.tasks[task.task_id] = task

    # Context manager support: `with DAG(...) as dag:`
    def __enter__(self):
        _DAG._current = self
        return self

    def __exit__(self, *args):
        _DAG._current = None


# ── Build mock airflow modules ───────────────────────────────────

def _build_airflow_modules() -> Dict[str, types.ModuleType]:
    """Create fake airflow module hierarchy for exec() namespace."""
    airflow_mod = types.ModuleType("airflow")
    airflow_mod.DAG = _DAG

    operators_mod = types.ModuleType("airflow.operators")
    python_mod = types.ModuleType("airflow.operators.python")
    python_mod.PythonOperator = _PythonOperator

    # Some DAGs use the legacy import path
    python_operator_mod = types.ModuleType("airflow.operators.python_operator")
    python_operator_mod.PythonOperator = _PythonOperator

    airflow_mod.operators = operators_mod
    operators_mod.python = python_mod
    operators_mod.python_operator = python_operator_mod

    return {
        "airflow": airflow_mod,
        "airflow.operators": operators_mod,
        "airflow.operators.python": python_mod,
        "airflow.operators.python_operator": python_operator_mod,
    }


# ── Topological sort ─────────────────────────────────────────────

def _topo_sort(tasks: Dict[str, _PythonOperator]) -> List[str]:
    in_degree: Dict[str, int] = {tid: 0 for tid in tasks}
    adj: Dict[str, List[str]] = defaultdict(list)

    for tid, task in tasks.items():
        for down in task._downstream:
            adj[tid].append(down)
            in_degree[down] = in_degree.get(down, 0) + 1

    queue = deque(tid for tid, deg in in_degree.items() if deg == 0)
    order: List[str] = []

    while queue:
        tid = queue.popleft()
        order.append(tid)
        for down in adj[tid]:
            in_degree[down] -= 1
            if in_degree[down] == 0:
                queue.append(down)

    if len(order) != len(tasks):
        raise RuntimeError("Cycle detected in DAG dependencies")

    return order


# ── Public API ────────────────────────────────────────────────────

def run_dag(dag_path: str, on_task_update=None) -> dict:
    """
    Execute an airflow_dag.py file and return execution results.

    Args:
        dag_path: Absolute path to the airflow_dag.py file
        on_task_update: Optional callback(task_id, status, index, total) for progress

    Returns:
        { status, tasks: [{ task_id, status, output, error, duration_ms }] }
    """
    # Reset global DAG state
    _DAG._current = None

    # Inject mock airflow modules
    fake_modules = _build_airflow_modules()
    saved_modules = {}
    for name, mod in fake_modules.items():
        saved_modules[name] = sys.modules.get(name)
        sys.modules[name] = mod

    try:
        # Read and exec the DAG file
        with open(dag_path, "r") as f:
            code = f.read()

        namespace: Dict[str, Any] = {"__builtins__": __builtins__}
        exec(compile(code, dag_path, "exec"), namespace)

        # Find the DAG instance — could be in a variable or from create_dag()
        dag = None
        for val in namespace.values():
            if isinstance(val, _DAG) and val.tasks:
                dag = val
                break

        # Try calling create_dag() if no DAG found via context manager
        if dag is None:
            for val in namespace.values():
                if callable(val) and getattr(val, "__name__", "") == "create_dag":
                    result = val()
                    if isinstance(result, _DAG):
                        dag = result
                        break

        if dag is None or not dag.tasks:
            return {"status": "failed", "tasks": [], "error": "No DAG with tasks found in file"}

        # Topological sort
        order = _topo_sort(dag.tasks)
        xcom = _XComStore()
        ti = _TaskInstance(xcom)

        task_results: List[dict] = []
        failed = False

        for idx, task_id in enumerate(order):
            task = dag.tasks[task_id]

            if on_task_update:
                on_task_update(task_id, "running", idx, len(order))

            if failed:
                task_results.append({
                    "task_id": task_id,
                    "status": "skipped",
                    "output": None,
                    "error": "Skipped due to upstream failure",
                    "duration_ms": 0,
                })
                if on_task_update:
                    on_task_update(task_id, "skipped", idx, len(order))
                continue

            # Capture stdout
            capture = io.StringIO()
            old_stdout = sys.stdout
            sys.stdout = capture

            start = time.time()
            try:
                kwargs = {**task.op_kwargs, "ti": ti}
                ret = task.python_callable(**kwargs)
                duration = int((time.time() - start) * 1000)

                # Store return value as XCom
                if ret is not None:
                    xcom.push(task_id, ret)

                sys.stdout = old_stdout
                output = capture.getvalue().strip() or None

                task_results.append({
                    "task_id": task_id,
                    "status": "success",
                    "output": output,
                    "return_value": repr(ret) if ret is not None else None,
                    "error": None,
                    "duration_ms": duration,
                })
                if on_task_update:
                    on_task_update(task_id, "success", idx, len(order))

            except Exception as e:
                duration = int((time.time() - start) * 1000)
                sys.stdout = old_stdout
                output = capture.getvalue().strip() or None
                failed = True

                task_results.append({
                    "task_id": task_id,
                    "status": "failed",
                    "output": output,
                    "error": str(e),
                    "duration_ms": duration,
                })
                if on_task_update:
                    on_task_update(task_id, "failed", idx, len(order))

        overall = "failed" if failed else "completed"
        return {"status": overall, "tasks": task_results}

    except Exception as e:
        return {"status": "failed", "tasks": [], "error": str(e)}

    finally:
        # Restore original modules
        for name, orig in saved_modules.items():
            if orig is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = orig
        _DAG._current = None
