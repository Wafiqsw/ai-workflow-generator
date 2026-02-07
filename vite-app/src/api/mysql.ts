import { api } from "./api";
import type { APIRecord } from "./csv";

export const mysqlApi = {
    /**
     * Fetch all API records from MySQL
     */
    getAllApis: async (): Promise<APIRecord[]> => {
        const response = await api.get<APIRecord[]>("/mysql/apis");
        return response.data;
    },
};
