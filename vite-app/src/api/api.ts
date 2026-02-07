// src/api/axios.ts
import axios from "axios";

// Base URL for FastAPI backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Optional: default headers
// api.defaults.headers.common['Authorization'] = 'Bearer ...';

// TEST: check if backend is reachable
export const checkBackendConnection = async () => {
  try {
    const res = await api.get("/");
    console.log("✅ Connected to FastAPI:", res.data);
  } catch (err: any) {
    console.error("❌ Cannot connect to FastAPI:", err.message);
  }
};

