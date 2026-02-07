import { api } from "./api";

export interface APIRecord {
    id: string;
    system_name: string;
    api_name: string;
    params_values: Record<string, any>;
    return_values: Record<string, any>;
    description: string;
    embedding?: number[];
}

export interface TransformAndEmbedResponse {
    message: string;
    original_rows: number;
    transformed_rows: number;
    data: APIRecord[];
    file_info?: {
        saved: boolean;
        file_path: string;
        filename: string;
    };
}

export const csvApi = {
    /**
     * Start async transformation and embedding job
     */
    processAsync: async (file: File): Promise<{ job_id: string; status_url: string }> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<{ job_id: string; status_url: string }>("/csv/process-async", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    },

    /**
     * Get job status and results
     */
    getJobStatus: async (jobId: string): Promise<any> => {
        const response = await api.get(`/csv/job/${jobId}`);
        return response.data;
    },
};
