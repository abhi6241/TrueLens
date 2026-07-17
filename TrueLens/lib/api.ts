import axios from 'axios';

export interface ClaimVerify {
  claim: string;
  status: string;
  details: string;
}

export interface SimilarArticle {
  id: string;
  title: string;
  author: string;
  publication: string;
  url?: string;
  distance?: number;
}

export interface AnalysisResponse {
  id: string;
  url?: string;
  filename?: string;
  title: string;
  author: string;
  publication: string;
  published_date: string;
  trust_score: number;
  bias_rating: string;
  sentiment_tone: string;
  sentiment_score: number;
  is_clickbait: boolean;
  is_sensational: boolean;
  is_verified_author: boolean;
  summary: string;
  content?: string;
  claims: ClaimVerify[];
  emotion: string;
  propaganda_score: number;
  propaganda_techniques: string[];
  missing_perspectives: string[];
  embedding_id?: string;
  similar_articles?: SimilarArticle[];
  is_bookmarked?: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_analyzed: number;
  verified_facts: number;
  avg_trust_score: number;
  saved_reports: number;
}

export interface ListAnalysesParams {
  limit?: number;
  search?: string;
  sort_by?: string;
  order?: string;
  is_bookmarked?: boolean;
}

export interface TaskResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface TaskStatus {
  task_id: string;
  status: string;
  progress: number;
  message: string;
  result_id?: string;
  error?: string;
}

let tokenProvider: (() => Promise<string | null>) | null = null;

export const setTokenProvider = (provider: () => Promise<string | null>) => {
  tokenProvider = provider;
};

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    try {
      const token = await tokenProvider();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to retrieve authentication token:", e);
    }
  }
  return config;
});

async function pollTask(taskId: string, onProgress?: (status: TaskStatus) => void): Promise<AnalysisResponse> {
  let attempts = 0;
  while (true) {
    const res = await apiClient.get<TaskStatus>(`/analyze/task/${taskId}`);
    const status = res.data;
    
    if (onProgress) onProgress(status);

    if (status.status === 'completed' && status.result_id) {
      return await api.getAnalysis(status.result_id);
    }
    
    if (status.status === 'failed') {
      throw new Error(status.error || "Analysis failed");
    }

    attempts++;
    await new Promise(r => setTimeout(r, Math.min(3000, 1000 + attempts * 500)));
  }
}

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/analyze/dashboard/stats');
    return res.data;
  },

  async listAnalyses(params?: ListAnalysesParams): Promise<AnalysisResponse[]> {
    const res = await apiClient.get<AnalysisResponse[]>('/analyze/', { params });
    return res.data;
  },

  async getAnalysis(id: string): Promise<AnalysisResponse> {
    const res = await apiClient.get<AnalysisResponse>(`/analyze/${id}`);
    return res.data;
  },

  async analyzeUrl(url: string, onProgress?: (status: TaskStatus) => void): Promise<AnalysisResponse> {
    const res = await apiClient.post<TaskResponse>('/analyze/', { url });
    return pollTask(res.data.task_id, onProgress);
  },

  async analyzeFile(file: File, onProgress?: (status: TaskStatus) => void): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<TaskResponse>('/analyze/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return pollTask(res.data.task_id, onProgress);
  },

  async toggleBookmark(id: string): Promise<{ status: string, is_bookmarked: boolean }> {
    const res = await apiClient.post(`/analyze/${id}/bookmark`);
    return res.data;
  },

  async deleteAnalysis(id: string): Promise<{ status: string, message: string }> {
    const res = await apiClient.delete(`/analyze/${id}`);
    return res.data;
  }
};
