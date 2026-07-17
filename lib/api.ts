import axios from 'axios';

export interface ClaimVerify {
  claim: string;
  status: string;
  details: string;
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
  claims: ClaimVerify[];
  created_at: string;
}

export interface DashboardStats {
  total_analyzed: number;
  verified_facts: number;
  avg_trust_score: number;
  saved_reports: number;
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

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/analyze/dashboard/stats');
    return res.data;
  },

  async listAnalyses(): Promise<AnalysisResponse[]> {
    const res = await apiClient.get<AnalysisResponse[]>('/analyze/');
    return res.data;
  },

  async getAnalysis(id: string): Promise<AnalysisResponse> {
    const res = await apiClient.get<AnalysisResponse>(`/analyze/${id}`);
    return res.data;
  },

  async analyzeUrl(url: string): Promise<AnalysisResponse> {
    const res = await apiClient.post<AnalysisResponse>('/analyze/', { url });
    return res.data;
  },

  async analyzeFile(file: File): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<AnalysisResponse>('/analyze/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
