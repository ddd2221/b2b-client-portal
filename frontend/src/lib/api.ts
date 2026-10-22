import {
  AuthTokens,
  Client,
  DashboardStats,
  PaginatedResponse,
  Project,
  Task,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api';

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('agencyflow_access_token');
  }

  public setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('agencyflow_access_token', tokens.access);
    localStorage.setItem('agencyflow_refresh_token', tokens.refresh);
  }

  public clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('agencyflow_access_token');
    localStorage.removeItem('agencyflow_refresh_token');
    localStorage.removeItem('agencyflow_username');
  }

  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  public getSavedUsername(): string {
    if (typeof window === 'undefined') return 'User';
    return localStorage.getItem('agencyflow_username') || 'Agency Admin';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});

    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && typeof window !== 'undefined') {
      // Token might be expired or invalid
      // If we are not on login page, let's keep tokens or clear on repeated failure
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null) {
          errorMessage =
            errorData.detail ||
            errorData.message ||
            JSON.stringify(errorData);
        }
      } catch {
        // Fallback to response.statusText
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string): Promise<AuthTokens> {
    const res = await fetch(`${API_BASE_URL.replace(/\/api$/, '')}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid username or password');
    }

    const data: AuthTokens = await res.json();
    this.setTokens(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agencyflow_username', username);
    }
    return data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats/');
  }

  // Clients
  async getClients(search = '', status = ''): Promise<Client[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await this.request<PaginatedResponse<Client> | Client[]>(
      `/clients/${queryString}`
    );
    return Array.isArray(res) ? res : res.results;
  }

  async createClient(data: Partial<Client>): Promise<Client> {
    return this.request<Client>('/clients/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Projects
  async getProjects(paramsObj: Record<string, string> = {}): Promise<Project[]> {
    const params = new URLSearchParams();
    Object.entries(paramsObj).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await this.request<PaginatedResponse<Project> | Project[]>(
      `/projects/${queryString}`
    );
    return Array.isArray(res) ? res : res.results;
  }

  async getProject(id: number | string): Promise<Project> {
    return this.request<Project>(`/projects/${id}/`);
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    id: number | string,
    data: Partial<Project>
  ): Promise<Project> {
    return this.request<Project>(`/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number | string): Promise<void> {
    await this.request<void>(`/projects/${id}/`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async createTask(data: Partial<Task>): Promise<Task> {
    return this.request<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleTask(id: number | string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/toggle/`, {
      method: 'POST',
    });
  }

  async deleteTask(id: number | string): Promise<void> {
    await this.request<void>(`/tasks/${id}/`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
