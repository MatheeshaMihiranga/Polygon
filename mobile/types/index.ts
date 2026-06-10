export interface User {
  id:          number;
  name:        string;
  email:       string;
  role:        'admin' | 'employee';
  department?: string;
  phone?:      string;
  created_at?: string;
}

export interface Task {
  id:                  number;
  title:               string;
  description?:        string;
  status:              'pending' | 'in_progress' | 'completed';
  priority:            'low' | 'medium' | 'high';
  assigned_to?:        number;
  assigned_to_name?:   string;
  assigned_to_email?:  string;
  created_by:          number;
  created_by_name?:    string;
  due_date?:           string;
  created_at:          string;
  updated_at:          string;
}

export interface TaskStats {
  total:       number;
  pending:     number;
  in_progress: number;
  completed:   number;
}

export interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
}

export interface TaskState {
  tasks:       Task[];
  currentTask: Task | null;
  stats:       TaskStats | null;
  isLoading:   boolean;
  error:       string | null;
  filter: {
    status:   string;
    priority: string;
    search:   string;
  };
}

export interface UserState {
  employees: (User & {
    total_tasks?:       number;
    completed_tasks?:   number;
    in_progress_tasks?: number;
    pending_tasks?:     number;
  })[];
  isLoading: boolean;
  error:     string | null;
}
