export type ClientStatus = 'lead' | 'active' | 'archived';
export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Client {
  id: number;
  name: string;
  company_name: string;
  email: string;
  status: ClientStatus;
  projects_count: number;
  created_at: string;
}

export interface Task {
  id: number;
  project: number;
  project_title?: string;
  title: string;
  priority: TaskPriority;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  client: number;
  client_name: string;
  client_company: string;
  title: string;
  description: string;
  budget: string | number;
  status: ProjectStatus;
  deadline: string;
  tasks_count: number;
  completed_tasks_count: number;
  created_at: string;
  client_detail?: Client;
  tasks?: Task[];
}

export interface DashboardStats {
  total_clients: number;
  active_projects: number;
  total_active_budget: number | string;
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  task_completion_rate: number;
  recent_projects: Project[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
