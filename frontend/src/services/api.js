import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

/**
 * Upload PDF and extract text
 * @param {File} file
 * @param {(progress: number) => void} onProgress
 */
export const uploadPDF = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("contract", file);

  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
};

/**
 * Analyze contract text
 * @param {{ contractText, filename, userType, language, charCount }} payload
 */
export const analyzeContract = async (payload) => {
  const { data } = await api.post("/analyze", payload);
  return data;
};

/**
 * Ask a follow-up question
 * @param {{ contractText, question, history, language }} payload
 */
export const askQuestion = async (payload) => {
  const { data } = await api.post("/chat", payload);
  return data;
};
