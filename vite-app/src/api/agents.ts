import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export interface AgentQueryResponse {
    content: string;
    is_feasible: boolean;
    score: number;
    reason?: string;
    workflow_id?: string;
}

export interface WorkflowStep {
    step: number;
    action: string;
    params?: Record<string, unknown>;
    description?: string;
}

export interface WorkflowData {
    id: string;
    name: string;
    status: string;
    created_at: string;
    steps: WorkflowStep[] | { raw_info: WorkflowStep[] } | unknown;
}

export interface WorkflowSummary {
    id: string;
    name: string;
    status: string;
    created_at: string;
    step_count: number;
}

export const getWorkflows = async (): Promise<WorkflowSummary[]> => {
    const response = await axios.get<WorkflowSummary[]>(`${API_URL}/agents/workflows`);
    return response.data;
};

export const getWorkflow = async (id: string): Promise<WorkflowData> => {
    const response = await axios.get<WorkflowData>(`${API_URL}/agents/workflows/${id}`);
    return response.data;
};

// ── Workflow execution types & functions ─────────────────────────

export interface TaskResult {
    task_id: string;
    status: 'success' | 'failed' | 'skipped' | 'running' | 'pending';
    output: string | null;
    return_value?: string | null;
    error: string | null;
    duration_ms: number;
}

export interface RunResponse {
    job_id: string;
}

export interface RunStatus {
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    tasks: TaskResult[];
    error: string | null;
}

export const runWorkflow = async (id: string): Promise<RunResponse> => {
    const response = await axios.post<RunResponse>(`${API_URL}/agents/workflows/${id}/run`);
    return response.data;
};

export const getRunStatus = async (workflowId: string, jobId: string): Promise<RunStatus> => {
    const response = await axios.get<RunStatus>(`${API_URL}/agents/workflows/${workflowId}/runs/${jobId}`);
    return response.data;
};

export const queryAgent = async (prompt: string): Promise<AgentQueryResponse> => {
    try {
        const response = await axios.post<AgentQueryResponse>(`${API_URL}/agents/query`, {
            prompt,
        });
        return response.data;
    } catch (error) {
        console.error('Error querying agent:', error);
        throw error;
    }
};
