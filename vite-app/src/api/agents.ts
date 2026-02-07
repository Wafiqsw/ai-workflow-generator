import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export interface AgentQueryResponse {
    content: string;
    is_feasible: boolean;
    score: number;
    reason?: string;
    workflow_id?: string;
}

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
