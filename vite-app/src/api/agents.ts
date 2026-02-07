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
