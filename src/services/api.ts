import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  error => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service class - Projects only for now
export class ApiService {
  // Projects
  static async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: Project['status'];
    priority?: Project['priority'];
  }): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  }

  static async getProject(id: number): Promise<ApiResponse<Project>> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  }

  static async createProject(
    data: CreateProjectRequest
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.post('/projects', data);
    return response.data;
  }

  static async updateProject(
    data: UpdateProjectRequest
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.put(`/projects/${data.id}`, data);
    return response.data;
  }

  static async deleteProject(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  }
}

export default ApiService;
